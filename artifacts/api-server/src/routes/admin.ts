import { Router, type IRouter } from "express";
import { db, petsTable, usersTable, adoptionRequestsTable, fosterRequestsTable, notificationsTable, volunteerApplicationsTable, adminNotificationsTable, adminNotificationEmailLogsTable } from "@workspace/db";
import { eq, and, ilike, desc, sql, gte, lte, lt, inArray } from "drizzle-orm";
import { ListAdminUsersQueryParams, ApprovePetParams, TogglePetFeaturedParams, UpdateAdminVolunteerStatusBody } from "@workspace/api-zod";
import { createNotification, createAdminNotification } from "../lib/notifications";
import { sendAdminEmail, sendPetStatusEmail } from "../lib/mailer";
import { cache, CACHE_PREFIX } from "../lib/cache";

const router: IRouter = Router();

router.get("/admin/stats", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const now = new Date();
    const months = Array.from({ length: 10 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 9 + i, 1);
      return {
        name: d.toLocaleString("en", { month: "short" }),
        start: new Date(d.getFullYear(), d.getMonth(), 1),
        end: new Date(d.getFullYear(), d.getMonth() + 1, 1),
      };
    });

    const monthsWithKey = months.map(m => ({
      ...m,
      key: `${m.start.getFullYear()}-${String(m.start.getMonth() + 1).padStart(2, "0")}`,
    }));
    const rangeStart = monthsWithKey[0].start;
    const rangeEnd = monthsWithKey[monthsWithKey.length - 1].end;

    const [
      totalPetsResult,
      pendingApprovalResult,
      activeAdoptionsResult,
      activeFostersResult,
      adoptionsCountResult,
      newUsersTodayResult,
      totalUsersResult,
      petsByType,
      topCities,
      adoptionsByMonthRaw,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(petsTable),
      db.select({ count: sql<number>`count(*)::int` }).from(petsTable).where(eq(petsTable.approved, false)),
      db.select({ count: sql<number>`count(*)::int` }).from(petsTable).where(eq(petsTable.status, "adopted")),
      db.select({ count: sql<number>`count(*)::int` }).from(petsTable).where(eq(petsTable.status, "fostered")),
      db.select({ count: sql<number>`count(*)::int` }).from(adoptionRequestsTable).where(eq(adoptionRequestsTable.status, "approved")),
      db.select({ count: sql<number>`count(*)::int` }).from(usersTable).where(gte(usersTable.createdAt, today)),
      db.select({ count: sql<number>`count(*)::int` }).from(usersTable),
      db.select({ type: petsTable.type, count: sql<number>`count(*)::int` }).from(petsTable).groupBy(petsTable.type),
      db.select({ city: petsTable.city, count: sql<number>`count(*)::int` })
        .from(petsTable)
        .where(sql`${petsTable.city} is not null`)
        .groupBy(petsTable.city)
        .orderBy(desc(sql`count(*)`))
        .limit(5),
      db.select({
        monthKey: sql<string>`to_char(date_trunc('month', ${adoptionRequestsTable.createdAt}), 'YYYY-MM')`,
        count: sql<number>`count(*)::int`,
      })
        .from(adoptionRequestsTable)
        .where(and(
          eq(adoptionRequestsTable.status, "approved"),
          gte(adoptionRequestsTable.createdAt, rangeStart),
          lt(adoptionRequestsTable.createdAt, rangeEnd),
        ))
        .groupBy(sql`date_trunc('month', ${adoptionRequestsTable.createdAt})`),
    ]);

    const adoptionsMonthMap = new Map(adoptionsByMonthRaw.map(r => [r.monthKey, r.count]));

    const adoptionsByMonth = monthsWithKey.map(m => ({
      month: m.name,
      count: adoptionsMonthMap.get(m.key) ?? 0,
    }));

const result = {
      totalPets: totalPetsResult[0]?.count ?? 0,
      pendingApproval: pendingApprovalResult[0]?.count ?? 0,
      activeAdoptions: activeAdoptionsResult[0]?.count ?? 0,
      activeFosters: activeFostersResult[0]?.count ?? 0,
      adoptionsCount: adoptionsCountResult[0]?.count ?? 0,
      newUsersToday: newUsersTodayResult[0]?.count ?? 0,
      totalUsers: totalUsersResult[0]?.count ?? 0,
      adoptionsByMonth,
      petsByType,
      topCities,
    };
    await cache.set(`${CACHE_PREFIX}admin:stats`, JSON.stringify(result), "EX", 60);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error getting admin stats");
    res.status(500).json({ error: "internal_error", message: "Failed to get stats" });
  }
});

router.get("/admin/users", async (req, res) => {
  try {
    const queryParsed = ListAdminUsersQueryParams.safeParse(req.query);
    if (!queryParsed.success) {
      return res.status(400).json({ error: "validation_error", message: "Invalid query parameters", details: queryParsed.error.issues });
    }
    const { role, search, page = 1, limit = 20 } = queryParsed.data;
    const pageNum = page;
    const limitNum = limit;
    const offset = (pageNum - 1) * limitNum;

    const USER_ROLES = ["user", "admin", "volunteer"] as const;
    const conditions = [];
    const userRole = role ? USER_ROLES.find(r => r === role) : undefined;
    if (userRole) conditions.push(eq(usersTable.role, userRole));
    if (search) conditions.push(ilike(usersTable.fullName, `%${search}%`));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const users = await db.select().from(usersTable)
      .where(whereClause)
      .orderBy(desc(usersTable.createdAt))
      .limit(limitNum)
      .offset(offset);

    const userIds = users.map(u => u.id);

    const adoptionMap = new Map<number, number>();
    const fosterMap = new Map<number, number>();
    const petsMap = new Map<number, number>();

    if (userIds.length > 0) {
      const [adoptionCounts, fosterCounts, petCounts] = await Promise.all([
        db.select({ userId: adoptionRequestsTable.requesterId, cnt: sql<number>`count(*)::int` })
          .from(adoptionRequestsTable)
          .where(inArray(adoptionRequestsTable.requesterId, userIds))
          .groupBy(adoptionRequestsTable.requesterId),
        db.select({ userId: fosterRequestsTable.requesterId, cnt: sql<number>`count(*)::int` })
          .from(fosterRequestsTable)
          .where(inArray(fosterRequestsTable.requesterId, userIds))
          .groupBy(fosterRequestsTable.requesterId),
        db.select({ userId: petsTable.ownerId, cnt: sql<number>`count(*)::int` })
          .from(petsTable)
          .where(inArray(petsTable.ownerId, userIds))
          .groupBy(petsTable.ownerId),
      ]);

      for (const row of adoptionCounts) adoptionMap.set(row.userId, row.cnt);
      for (const row of fosterCounts) fosterMap.set(row.userId, row.cnt);
      for (const row of petCounts) petsMap.set(row.userId, row.cnt);
    }

    const enriched = users.map(u => ({
      ...u,
      totalAdoptionRequests: adoptionMap.get(u.id) ?? 0,
      totalFosterRequests: fosterMap.get(u.id) ?? 0,
      totalPetsOwned: petsMap.get(u.id) ?? 0,
    }));

    res.json(enriched);
  } catch (err) {
    req.log.error({ err }, "Error listing admin users");
    res.status(500).json({ error: "internal_error", message: "Failed to list users" });
  }
});

router.put("/admin/users/:id/deactivate", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "validation_error", message: "Invalid id" });
    const [user] = await db.update(usersTable).set({ isActive: false }).where(eq(usersTable.id, id)).returning();
    if (!user) return res.status(404).json({ error: "not_found", message: "User not found" });
    res.json(user);
  } catch (err) {
    req.log.error({ err }, "Error deactivating user");
    res.status(500).json({ error: "internal_error", message: "Failed to deactivate user" });
  }
});

router.put("/admin/pets/:id/settings", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "validation_error", message: "Invalid id" });
    const { status, featured, approved, rejected, addedByAdmin } = req.body;
    const updates: Partial<{ status: "available" | "adopted" | "fostered" | "pending" | "lost" | "found"; featured: boolean; approved: boolean; rejected: boolean; addedByAdmin: boolean }> = {};
    const validStatuses = ["available", "adopted", "fostered", "pending", "lost", "found"] as const;
    if (typeof status === "string" && validStatuses.includes(status as typeof validStatuses[number])) {
      updates.status = status as typeof validStatuses[number];
    }
    if (typeof featured === "boolean") updates.featured = featured;
    if (typeof approved === "boolean") updates.approved = approved;
    if (typeof rejected === "boolean") updates.rejected = rejected;
    if (typeof addedByAdmin === "boolean") updates.addedByAdmin = addedByAdmin;
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "validation_error", message: "No valid fields to update" });
    }
    const [pet] = await db.update(petsTable).set(updates).where(eq(petsTable.id, id)).returning();
    if (!pet) return res.status(404).json({ error: "not_found", message: "Pet not found" });
    await cache.invalidatePrefix(CACHE_PREFIX.PETS_LIST);
    await cache.invalidatePrefix(CACHE_PREFIX.PET_DETAIL + id);
    await cache.invalidatePrefix(CACHE_PREFIX.PETS_FEATURED);
    res.json(pet);
  } catch (err) {
    req.log.error({ err }, "Error updating pet settings");
    res.status(500).json({ error: "internal_error", message: "Failed to update pet settings" });
  }
});

router.put("/admin/pets/:id/approve", async (req, res) => {
  try {
    const paramsParsed = ApprovePetParams.safeParse(req.params);
    if (!paramsParsed.success) {
      return res.status(400).json({ error: "validation_error", message: "Invalid pet id", details: paramsParsed.error.issues });
    }
    const id = paramsParsed.data.id;
    const [pet] = await db.update(petsTable)
      .set({ approved: true, rejected: false })
      .where(eq(petsTable.id, id))
      .returning();
    if (!pet) return res.status(404).json({ error: "not_found", message: "Pet not found" });

    if (pet.ownerId) {
      try {
        const [owner] = await db
          .select({ email: usersTable.email, fullName: usersTable.fullName })
          .from(usersTable)
          .where(eq(usersTable.id, pet.ownerId));

        await createNotification(
          pet.ownerId,
          "pet_accepted",
          "Pet Submission Approved",
          `Great news! Your pet "${pet.name}" has been approved and is now listed for adoption/foster.`,
          pet.id,
          undefined,
          true,
        );

        if (owner?.email) {
          const userName = owner.fullName || "Pet Owner";
          sendPetStatusEmail({
            to: owner.email,
            userName,
            petName: pet.name,
            status: "accepted",
            message: `Great news! Your pet "${pet.name}" has been approved and is now listed for adoption/foster.`,
          }).catch((err) => {
            req.log.error({ err }, "Error sending pet approval email");
          });
        }
      } catch (err) {
        req.log.error({ err }, "Error creating approval notification");
      }
    }

    createAdminNotification(
      "pet_approved",
      "Pet Approved",
      `Pet "${pet.name}" has been approved and is now listed.`,
      pet.ownerId ?? null,
      { petId: pet.id },
    ).catch(() => {});

    await cache.invalidatePrefix(CACHE_PREFIX.PETS_LIST);
    await cache.invalidatePrefix(CACHE_PREFIX.PET_DETAIL + id);
    await cache.invalidatePrefix(CACHE_PREFIX.PETS_FEATURED);

    res.json(pet);
  } catch (err) {
    req.log.error({ err }, "Error approving pet");
    res.status(500).json({ error: "internal_error", message: "Failed to approve pet" });
  }
});

router.put("/admin/pets/:id/reject", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "validation_error", message: "Invalid pet id" });
    const [pet] = await db.update(petsTable)
      .set({ approved: false, rejected: true })
      .where(eq(petsTable.id, id))
      .returning();
    if (!pet) return res.status(404).json({ error: "not_found", message: "Pet not found" });

    if (pet.ownerId) {
      try {
        const [owner] = await db
          .select({ email: usersTable.email, fullName: usersTable.fullName })
          .from(usersTable)
          .where(eq(usersTable.id, pet.ownerId));

        await createNotification(
          pet.ownerId,
          "pet_rejected",
          "Pet Submission Rejected",
          `Unfortunately, your pet "${pet.name}" submission has been rejected. Please review our submission guidelines and feel free to resubmit.`,
          pet.id,
          undefined,
          true,
        );

        if (owner?.email) {
          const userName = owner.fullName || "Pet Owner";
          sendPetStatusEmail({
            to: owner.email,
            userName,
            petName: pet.name,
            status: "rejected",
            message: `Unfortunately, your pet "${pet.name}" submission has been rejected. Please review our submission guidelines and feel free to resubmit.`,
          }).catch((err) => {
            req.log.error({ err }, "Error sending pet rejection email");
          });
        }
      } catch (err) {
        req.log.error({ err }, "Error creating rejection notification");
      }
    }

    createAdminNotification(
      "pet_rejected",
      "Pet Rejected",
      `Pet "${pet.name}" submission has been rejected.`,
      pet.ownerId ?? null,
      { petId: pet.id },
    ).catch(() => {});

    await cache.invalidatePrefix(CACHE_PREFIX.PETS_LIST);
    await cache.invalidatePrefix(CACHE_PREFIX.PET_DETAIL + id);
    await cache.invalidatePrefix(CACHE_PREFIX.PETS_FEATURED);

    res.json(pet);
  } catch (err) {
    req.log.error({ err }, "Error rejecting pet");
    res.status(500).json({ error: "internal_error", message: "Failed to reject pet" });
  }
});

router.put("/admin/pets/:id/featured", async (req, res) => {
  try {
    const paramsParsed = TogglePetFeaturedParams.safeParse(req.params);
    if (!paramsParsed.success) {
      return res.status(400).json({ error: "validation_error", message: "Invalid pet id", details: paramsParsed.error.issues });
    }
    const id = paramsParsed.data.id;
    const [current] = await db.select({ featured: petsTable.featured }).from(petsTable).where(eq(petsTable.id, id));
    if (!current) return res.status(404).json({ error: "not_found", message: "Pet not found" });

    const [pet] = await db.update(petsTable)
      .set({ featured: !current.featured })
      .where(eq(petsTable.id, id))
      .returning();
    await cache.invalidatePrefix(CACHE_PREFIX.PETS_LIST);
    await cache.invalidatePrefix(CACHE_PREFIX.PET_DETAIL + id);
    await cache.invalidatePrefix(CACHE_PREFIX.PETS_FEATURED);
    res.json(pet);
  } catch (err) {
    req.log.error({ err }, "Error toggling pet featured");
    res.status(500).json({ error: "internal_error", message: "Failed to toggle featured" });
  }
});

router.put("/admin/users/:id/role", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "validation_error", message: "Invalid id" });
    const { role } = req.body;
    if (!["user", "admin", "volunteer"].includes(role)) {
      return res.status(400).json({ error: "validation_error", message: "Invalid role" });
    }
    const [user] = await db.update(usersTable).set({ role }).where(eq(usersTable.id, id)).returning();
    if (!user) return res.status(404).json({ error: "not_found", message: "User not found" });
    res.json(user);
  } catch (err) {
    req.log.error({ err }, "Error updating user role");
    res.status(500).json({ error: "internal_error", message: "Failed to update user role" });
  }
});

router.get("/admin/analytics", async (req, res) => {
  try {
    const now = new Date();
    const months = Array.from({ length: 10 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 9 + i, 1);
      return {
        name: d.toLocaleString("en", { month: "short" }),
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        start: new Date(d.getFullYear(), d.getMonth(), 1),
        end: new Date(d.getFullYear(), d.getMonth() + 1, 1),
      };
    });

    const monthsWithKey = months.map(m => ({
      ...m,
      key: `${m.start.getFullYear()}-${String(m.start.getMonth() + 1).padStart(2, "0")}`,
    }));
    const rangeStart = monthsWithKey[0].start;
    const rangeEnd = monthsWithKey[monthsWithKey.length - 1].end;

    const [adoptionsByMonthRaw, petsByType, topCities] = await Promise.all([
      db.select({
        monthKey: sql<string>`to_char(date_trunc('month', ${adoptionRequestsTable.createdAt}), 'YYYY-MM')`,
        count: sql<number>`count(*)::int`,
      })
        .from(adoptionRequestsTable)
        .where(and(
          eq(adoptionRequestsTable.status, "approved"),
          gte(adoptionRequestsTable.createdAt, rangeStart),
          lt(adoptionRequestsTable.createdAt, rangeEnd),
        ))
        .groupBy(sql`date_trunc('month', ${adoptionRequestsTable.createdAt})`),
      db.select({ type: petsTable.type, count: sql<number>`count(*)::int` })
        .from(petsTable)
        .groupBy(petsTable.type),
      db.select({ city: petsTable.city, count: sql<number>`count(*)::int` })
        .from(petsTable)
        .where(sql`${petsTable.city} is not null`)
        .groupBy(petsTable.city)
        .orderBy(desc(sql`count(*)`))
        .limit(5),
    ]);

    const adoptionsMonthMap = new Map(adoptionsByMonthRaw.map(r => [r.monthKey, r.count]));

    const adoptionsByMonth = monthsWithKey.map(m => ({
      month: m.name,
      count: adoptionsMonthMap.get(m.key) ?? 0,
    }));

    res.json({ adoptionsByMonth, petsByType, topCities });
  } catch (err) {
    req.log.error({ err }, "Error getting admin analytics");
    res.status(500).json({ error: "internal_error", message: "Failed to get analytics" });
  }
});

router.get("/admin/content", async (req, res) => {
  try {
    const result = await db.execute(sql`SELECT key, value, updated_at FROM site_content ORDER BY key`);
    const content: Record<string, string> = {};
    for (const row of result.rows as { key: string; value: string }[]) {
      content[row.key] = row.value;
    }
    res.json(content);
  } catch (err) {
    req.log.error({ err }, "Error getting site content");
    res.status(500).json({ error: "internal_error", message: "Failed to get content" });
  }
});

router.put("/admin/content/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const { value } = req.body;
    if (typeof value !== "string") {
      return res.status(400).json({ error: "validation_error", message: "Value must be a string" });
    }
    await db.execute(sql`INSERT INTO site_content (key, value, updated_at) VALUES (${key}, ${value}, NOW()) ON CONFLICT (key) DO UPDATE SET value = ${value}, updated_at = NOW()`);
    res.json({ key, value });
  } catch (err) {
    req.log.error({ err }, "Error updating site content");
    res.status(500).json({ error: "internal_error", message: "Failed to update content" });
  }
});

router.get("/admin/volunteer-applications", async (req, res) => {
  try {
    const applications = await db
      .select({
        id: volunteerApplicationsTable.id,
        userId: volunteerApplicationsTable.userId,
        applicationType: volunteerApplicationsTable.applicationType,
        name: volunteerApplicationsTable.name,
        phone: volunteerApplicationsTable.phone,
        email: volunteerApplicationsTable.email,
        city: volunteerApplicationsTable.city,
        address: volunteerApplicationsTable.address,
        skills: volunteerApplicationsTable.skills,
        motivation: volunteerApplicationsTable.motivation,
        status: volunteerApplicationsTable.status,
        createdAt: volunteerApplicationsTable.createdAt,
        updatedAt: volunteerApplicationsTable.updatedAt,
        userFullName: usersTable.fullName,
        userEmail: usersTable.email,
      })
      .from(volunteerApplicationsTable)
      .leftJoin(usersTable, eq(volunteerApplicationsTable.userId, usersTable.id))
      .orderBy(desc(volunteerApplicationsTable.createdAt));

    res.json(applications);
  } catch (err) {
    req.log.error({ err }, "Error listing volunteer applications");
    res.status(500).json({ error: "internal_error", message: "Failed to list volunteer applications" });
  }
});

router.delete("/admin/volunteer-applications/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "validation_error", message: "Invalid id" });
    }

    const [existing] = await db
      .select({ id: volunteerApplicationsTable.id, status: volunteerApplicationsTable.status })
      .from(volunteerApplicationsTable)
      .where(eq(volunteerApplicationsTable.id, id));

    if (!existing) {
      return res.status(404).json({ error: "not_found", message: "Application not found" });
    }

    if (existing.status !== "accepted") {
      return res.status(400).json({ error: "invalid_status", message: "Only accepted applications can be deleted" });
    }

    const deleted = await db
      .delete(volunteerApplicationsTable)
      .where(and(eq(volunteerApplicationsTable.id, id), eq(volunteerApplicationsTable.status, "accepted")))
      .returning({ id: volunteerApplicationsTable.id });

    if (deleted.length === 0) {
      return res.status(400).json({ error: "invalid_status", message: "Only accepted applications can be deleted" });
    }

    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Error deleting volunteer application");
    res.status(500).json({ error: "internal_error", message: "Failed to delete application" });
  }
});

router.get("/admin/pets", async (req, res) => {
  try {
    const { search, approved, rejected, purpose, page = "1", limit = "100" } = req.query as {
      search?: string;
      approved?: string;
      rejected?: string;
      purpose?: string;
      page?: string;
      limit?: string;
    };

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit) || 100));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    if (search) conditions.push(ilike(petsTable.name, `%${search}%`));
    if (approved === "true") conditions.push(eq(petsTable.approved, true));
    if (approved === "false") conditions.push(eq(petsTable.approved, false));
    if (rejected === "true") conditions.push(eq(petsTable.rejected, true));
    if (rejected === "false") conditions.push(eq(petsTable.rejected, false));

    const PET_PURPOSES = ["adopt", "foster", "both", "lost_found"] as const;
    const petPurpose = purpose ? PET_PURPOSES.find(p => p === purpose) : undefined;
    if (petPurpose) conditions.push(eq(petsTable.purpose, petPurpose));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [pets, countResult] = await Promise.all([
      db.select({
        id: petsTable.id,
        name: petsTable.name,
        type: petsTable.type,
        breed: petsTable.breed,
        gender: petsTable.gender,
        ageMonths: petsTable.ageMonths,
        weightKg: petsTable.weightKg,
        size: petsTable.size,
        color: petsTable.color,
        sterilized: petsTable.sterilized,
        yearlyVaccines: petsTable.yearlyVaccines,
        birthday: petsTable.birthday,
        city: petsTable.city,
        status: petsTable.status,
        purpose: petsTable.purpose,
        imageUrls: petsTable.imageUrls,
        ownerId: petsTable.ownerId,
        ownerName: usersTable.fullName,
        ownerEmail: usersTable.email,
        ownerAvatar: usersTable.avatarUrl,
        approved: petsTable.approved,
        rejected: petsTable.rejected,
        featured: petsTable.featured,
        addedByAdmin: petsTable.addedByAdmin,
        createdAt: petsTable.createdAt,
      })
        .from(petsTable)
        .leftJoin(usersTable, eq(petsTable.ownerId, usersTable.id))
        .where(whereClause)
        .orderBy(desc(petsTable.createdAt))
        .limit(limitNum)
        .offset(offset),
      db.select({ count: sql<number>`count(*)::int` }).from(petsTable).where(whereClause),
    ]);

    const total = countResult[0]?.count ?? 0;

    res.json({
      pets,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    req.log.error({ err }, "Error listing admin pets");
    res.status(500).json({ error: "internal_error", message: "Failed to list pets" });
  }
});

router.patch("/admin/volunteer-applications/:id/status", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "validation_error", message: "Invalid id" });
    }

    const parsed = UpdateAdminVolunteerStatusBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "validation_error", message: "Status must be 'accepted' or 'rejected'" });
    }
    const { status } = parsed.data;

    const [application] = await db
      .update(volunteerApplicationsTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(volunteerApplicationsTable.id, id))
      .returning();

    if (!application) {
      return res.status(404).json({ error: "not_found", message: "Application not found" });
    }

    const notifTitle = status === "accepted" ? "Volunteer Application Accepted" : "Volunteer Application Rejected";
    const notifMessage = status === "accepted"
      ? "Congratulations! Your volunteer application has been accepted. We look forward to working with you."
      : "Thank you for your interest. Unfortunately, your volunteer application has been rejected at this time. You are welcome to reapply in the future.";

    try {
      await createNotification(
        application.userId,
        status === "accepted" ? "volunteer_accepted" : "volunteer_rejected",
        notifTitle,
        notifMessage,
      );
    } catch (err) {
      req.log.error({ err }, "Error creating volunteer notification");
    }

    res.json(application);
  } catch (err) {
    req.log.error({ err }, "Error updating volunteer application status");
    res.status(500).json({ error: "internal_error", message: "Failed to update status" });
  }
});

router.get("/admin/notifications", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string ?? "1", 10) || 1;
    const limit = parseInt(req.query.limit as string ?? "30", 10) || 30;
    const offset = (page - 1) * limit;

    const [rawNotifications, countResult] = await Promise.all([
      db.select({
        id: adminNotificationsTable.id,
        type: adminNotificationsTable.type,
        userId: adminNotificationsTable.userId,
        title: adminNotificationsTable.title,
        message: adminNotificationsTable.message,
        metadata: adminNotificationsTable.metadata,
        read: adminNotificationsTable.read,
        createdAt: adminNotificationsTable.createdAt,
        emailSentAt: adminNotificationsTable.emailSentAt,
        emailFailed: adminNotificationsTable.emailFailed,
        userName: usersTable.fullName,
        userEmail: usersTable.email,
      })
        .from(adminNotificationsTable)
        .leftJoin(usersTable, eq(adminNotificationsTable.userId, usersTable.id))
        .orderBy(desc(adminNotificationsTable.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`count(*)::int` }).from(adminNotificationsTable),
    ]);

    const notifIds = rawNotifications.map((n) => n.id);
    const emailLogs = notifIds.length > 0
      ? await db.select({
          notificationId: adminNotificationEmailLogsTable.notificationId,
          recipientEmail: adminNotificationEmailLogsTable.recipientEmail,
          success: adminNotificationEmailLogsTable.success,
          errorMessage: adminNotificationEmailLogsTable.errorMessage,
          sentAt: adminNotificationEmailLogsTable.sentAt,
        })
          .from(adminNotificationEmailLogsTable)
          .where(inArray(adminNotificationEmailLogsTable.notificationId, notifIds))
          .orderBy(adminNotificationEmailLogsTable.sentAt, adminNotificationEmailLogsTable.id)
      : [];

    const logsByNotifId = new Map<number, typeof emailLogs>();
    for (const log of emailLogs) {
      if (!logsByNotifId.has(log.notificationId)) {
        logsByNotifId.set(log.notificationId, []);
      }
      logsByNotifId.get(log.notificationId)!.push(log);
    }

    const notifications = rawNotifications.map((n) => ({
      ...n,
      emailLogs: logsByNotifId.get(n.id) ?? [],
    }));

    res.json({ notifications, total: countResult[0]?.count ?? 0, page, limit });
  } catch (err) {
    req.log.error({ err }, "Error listing admin notifications");
    res.status(500).json({ error: "internal_error", message: "Failed to list admin notifications" });
  }
});

router.get("/admin/notifications/unread-count", async (req, res) => {
  try {
    const [result] = await db.select({ count: sql<number>`count(*)::int` })
      .from(adminNotificationsTable)
      .where(eq(adminNotificationsTable.read, false));
    res.json({ count: result?.count ?? 0 });
  } catch (err) {
    req.log.error({ err }, "Error getting admin unread count");
    res.status(500).json({ error: "internal_error", message: "Failed to get unread count" });
  }
});

router.patch("/admin/notifications/read-all", async (req, res) => {
  try {
    await db.update(adminNotificationsTable).set({ read: true }).where(eq(adminNotificationsTable.read, false));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Error marking all admin notifications as read");
    res.status(500).json({ error: "internal_error", message: "Failed to mark all as read" });
  }
});

router.patch("/admin/notifications/:id/read", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "validation_error", message: "Invalid id" });
    }
    const readValue = typeof req.body?.read === "boolean" ? req.body.read : true;
    const [notif] = await db.update(adminNotificationsTable)
      .set({ read: readValue })
      .where(eq(adminNotificationsTable.id, id))
      .returning();
    if (!notif) return res.status(404).json({ error: "not_found", message: "Notification not found" });
    res.json(notif);
  } catch (err) {
    req.log.error({ err }, "Error toggling admin notification read state");
    res.status(500).json({ error: "internal_error", message: "Failed to update notification" });
  }
});

router.post("/admin/notifications/:id/resend-email", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "validation_error", message: "Invalid id" });
    }

    const [notif] = await db.select({
      id: adminNotificationsTable.id,
      type: adminNotificationsTable.type,
      title: adminNotificationsTable.title,
      message: adminNotificationsTable.message,
      createdAt: adminNotificationsTable.createdAt,
    }).from(adminNotificationsTable).where(eq(adminNotificationsTable.id, id));

    if (!notif) {
      return res.status(404).json({ error: "not_found", message: "Notification not found" });
    }

    const adminEmailEnv = process.env.ADMIN_EMAIL;
    const smtpFrom = process.env.SMTP_FROM ?? "noreply@tabanni.com";
    const adminsFromDb = await db.select({ email: usersTable.email }).from(usersTable).where(eq(usersTable.role, "admin"));

    const recipients = new Set<string>();
    for (const admin of adminsFromDb) {
      recipients.add(admin.email);
    }
    if (adminEmailEnv) {
      recipients.add(adminEmailEnv);
    }
    if (recipients.size === 0) {
      recipients.add(smtpFrom);
    }

    const sentAt = new Date();
    const results = await Promise.all(
      Array.from(recipients).map((email) =>
        sendAdminEmail({ to: email, type: notif.type, title: notif.title, message: notif.message, timestamp: sentAt }).catch(() => false),
      ),
    );

    const anySucceeded = results.some(Boolean);
    const allFailed = results.length > 0 && results.every((r) => !r);

    if (anySucceeded) {
      await db.update(adminNotificationsTable)
        .set({ emailSentAt: sentAt, emailFailed: false })
        .where(eq(adminNotificationsTable.id, id));
      return res.json({ success: true, emailSentAt: sentAt.toISOString() });
    } else if (allFailed) {
      await db.update(adminNotificationsTable)
        .set({ emailFailed: true })
        .where(eq(adminNotificationsTable.id, id));
      return res.status(502).json({ error: "email_failed", message: "Failed to send email. Check SMTP configuration." });
    }

    return res.json({ success: true, emailSentAt: sentAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Error resending admin notification email");
    res.status(500).json({ error: "internal_error", message: "Failed to resend email" });
  }
});

router.post("/admin/notifications/broadcast", async (req, res) => {
  try {
    const { title, message, targetGroup } = req.body as { title?: string; message?: string; targetGroup?: string };
    if (!title || !message) {
      return res.status(400).json({ error: "validation_error", message: "title and message are required" });
    }
    const validTargets = ["all", "adopters", "volunteers"];
    const target = validTargets.includes(targetGroup ?? "") ? targetGroup! : "all";

    const targetLabel = target === "adopters" ? "Adopters" : target === "volunteers" ? "Volunteers" : "All Users";

    let userIds: number[] = [];
    if (target === "adopters") {
      const adopters = await db.selectDistinct({ userId: adoptionRequestsTable.requesterId }).from(adoptionRequestsTable);
      userIds = adopters.map(a => a.userId).filter((id): id is number => id !== null);
    } else if (target === "volunteers") {
      const volunteers = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.role, "volunteer"));
      userIds = volunteers.map(u => u.id);
    } else {
      const allActive = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.isActive, true));
      userIds = allActive.map(u => u.id);
    }

    let count = 0;
    for (const id of userIds) {
      try {
        await createNotification(id, "general", title, message, null, null, true);
        count++;
      } catch {
      }
    }

    createAdminNotification(
      "broadcast",
      `Broadcast Sent — ${targetLabel}`,
      `"${title}" was delivered to ${count} user${count !== 1 ? "s" : ""}.`,
      null,
      { targetGroup: target, sentCount: count },
    ).catch((err) => {
      req.log.error({ err }, "Failed to record broadcast admin notification");
    });

    res.json({ success: true, count });
  } catch (err) {
    req.log.error({ err }, "Error broadcasting admin notification");
    res.status(500).json({ error: "internal_error", message: "Failed to broadcast notification" });
  }
});

export default router;

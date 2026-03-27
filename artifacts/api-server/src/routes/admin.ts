import { Router, type IRouter } from "express";
import { db, petsTable, usersTable, adoptionRequestsTable, fosterRequestsTable, donationsTable, notificationsTable } from "@workspace/db";
import { eq, and, ilike, desc, sql, gte, lte, lt } from "drizzle-orm";
import { ListAdminUsersQueryParams, ApprovePetParams, TogglePetFeaturedParams } from "@workspace/api-zod";
import { sendPetStatusEmail } from "../lib/mailer";

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

    const [
      totalPetsResult,
      pendingApprovalResult,
      activeAdoptionsResult,
      activeFostersResult,
      adoptionsCountResult,
      donationsResult,
      newUsersTodayResult,
      totalUsersResult,
      petsByType,
      topCities,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(petsTable),
      db.select({ count: sql<number>`count(*)::int` }).from(petsTable).where(eq(petsTable.approved, false)),
      db.select({ count: sql<number>`count(*)::int` }).from(petsTable).where(eq(petsTable.status, "adopted")),
      db.select({ count: sql<number>`count(*)::int` }).from(petsTable).where(eq(petsTable.status, "fostered")),
      db.select({ count: sql<number>`count(*)::int` }).from(adoptionRequestsTable).where(eq(adoptionRequestsTable.status, "approved")),
      db.select({ total: sql<string>`coalesce(sum(amount::numeric), 0)::text` }).from(donationsTable).where(and(
        eq(donationsTable.type, "monetary"),
        gte(donationsTable.createdAt, new Date(today.getFullYear(), today.getMonth(), 1)),
      )),
      db.select({ count: sql<number>`count(*)::int` }).from(usersTable).where(gte(usersTable.createdAt, today)),
      db.select({ count: sql<number>`count(*)::int` }).from(usersTable),
      db.select({ type: petsTable.type, count: sql<number>`count(*)::int` }).from(petsTable).groupBy(petsTable.type),
      db.select({ city: petsTable.city, count: sql<number>`count(*)::int` })
        .from(petsTable)
        .where(sql`${petsTable.city} is not null`)
        .groupBy(petsTable.city)
        .orderBy(desc(sql`count(*)`))
        .limit(5),
    ]);

    const adoptionsByMonth = await Promise.all(
      months.map(async (m) => ({
        month: m.name,
        count: (
          await db.select({ count: sql<number>`count(*)::int` })
            .from(adoptionRequestsTable)
            .where(and(
              eq(adoptionRequestsTable.status, "approved"),
              gte(adoptionRequestsTable.createdAt, m.start),
              lt(adoptionRequestsTable.createdAt, m.end),
            ))
        )[0]?.count ?? 0,
      }))
    );

    const donationsByMonth = await Promise.all(
      months.map(async (m) => ({
        month: m.name,
        total: parseFloat(
          (
            await db.select({ total: sql<string>`coalesce(sum(amount::numeric), 0)::text` })
              .from(donationsTable)
              .where(and(
                eq(donationsTable.type, "monetary"),
                gte(donationsTable.createdAt, m.start),
                lt(donationsTable.createdAt, m.end),
              ))
          )[0]?.total ?? "0"
        ),
      }))
    );

    res.json({
      totalPets: totalPetsResult[0]?.count ?? 0,
      pendingApproval: pendingApprovalResult[0]?.count ?? 0,
      activeAdoptions: activeAdoptionsResult[0]?.count ?? 0,
      activeFosters: activeFostersResult[0]?.count ?? 0,
      adoptionsCount: adoptionsCountResult[0]?.count ?? 0,
      totalDonationsThisMonth: donationsResult[0]?.total ?? "0",
      newUsersToday: newUsersTodayResult[0]?.count ?? 0,
      totalUsers: totalUsersResult[0]?.count ?? 0,
      adoptionsByMonth,
      donationsByMonth,
      petsByType,
      topCities,
    });
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

    const adoptionMap = new Map<number, number>();
    const fosterMap = new Map<number, number>();
    const petsMap = new Map<number, number>();

    for (const u of users) {
      const [ar, fr, po] = await Promise.all([
        db.select({ cnt: sql<number>`count(*)::int` }).from(adoptionRequestsTable).where(eq(adoptionRequestsTable.requesterId, u.id)),
        db.select({ cnt: sql<number>`count(*)::int` }).from(fosterRequestsTable).where(eq(fosterRequestsTable.requesterId, u.id)),
        db.select({ cnt: sql<number>`count(*)::int` }).from(petsTable).where(eq(petsTable.ownerId, u.id)),
      ]);
      adoptionMap.set(u.id, ar[0]?.cnt ?? 0);
      fosterMap.set(u.id, fr[0]?.cnt ?? 0);
      petsMap.set(u.id, po[0]?.cnt ?? 0);
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
    const { status, featured, approved, rejected } = req.body;
    const updates: Partial<{ status: "available" | "adopted" | "fostered" | "pending" | "lost" | "found"; featured: boolean; approved: boolean; rejected: boolean }> = {};
    const validStatuses = ["available", "adopted", "fostered", "pending", "lost", "found"] as const;
    if (typeof status === "string" && validStatuses.includes(status as typeof validStatuses[number])) {
      updates.status = status as typeof validStatuses[number];
    }
    if (typeof featured === "boolean") updates.featured = featured;
    if (typeof approved === "boolean") updates.approved = approved;
    if (typeof rejected === "boolean") updates.rejected = rejected;
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "validation_error", message: "No valid fields to update" });
    }
    const [pet] = await db.update(petsTable).set(updates).where(eq(petsTable.id, id)).returning();
    if (!pet) return res.status(404).json({ error: "not_found", message: "Pet not found" });
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
      const notificationMessage = `Great news! Your pet "${pet.name}" has been approved and is now listed for adoption/foster.`;
      try {
        await db.insert(notificationsTable).values({
          userId: pet.ownerId,
          petId: pet.id,
          status: "accepted",
          message: notificationMessage,
        });
        const [owner] = await db.select({ email: usersTable.email, fullName: usersTable.fullName })
          .from(usersTable).where(eq(usersTable.id, pet.ownerId!));
        if (owner) {
          sendPetStatusEmail({ to: owner.email, userName: owner.fullName, petName: pet.name, status: "accepted", message: notificationMessage });
        }
      } catch (err) {
        req.log.error({ err }, "Error creating approval notification or sending email");
      }
    }

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
      const notificationMessage = `Unfortunately, your pet "${pet.name}" submission has been rejected. Please review our submission guidelines and feel free to resubmit.`;
      try {
        await db.insert(notificationsTable).values({
          userId: pet.ownerId,
          petId: pet.id,
          status: "rejected",
          message: notificationMessage,
        });
        const [owner] = await db.select({ email: usersTable.email, fullName: usersTable.fullName })
          .from(usersTable).where(eq(usersTable.id, pet.ownerId!));
        if (owner) {
          sendPetStatusEmail({ to: owner.email, userName: owner.fullName, petName: pet.name, status: "rejected", message: notificationMessage });
        }
      } catch (err) {
        req.log.error({ err }, "Error creating rejection notification or sending email");
      }
    }

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

    const [adoptionsByMonth, donationsByMonth, petsByType, topCities] = await Promise.all([
      Promise.all(
        months.map(async (m) => ({
          month: m.name,
          count: (
            await db.select({ count: sql<number>`count(*)::int` })
              .from(adoptionRequestsTable)
              .where(and(
                eq(adoptionRequestsTable.status, "approved"),
                gte(adoptionRequestsTable.createdAt, m.start),
                lt(adoptionRequestsTable.createdAt, m.end),
              ))
          )[0]?.count ?? 0,
        }))
      ),
      Promise.all(
        months.map(async (m) => ({
          month: m.name,
          total: parseFloat(
            (
              await db.select({ total: sql<string>`coalesce(sum(amount::numeric), 0)::text` })
                .from(donationsTable)
                .where(and(
                  eq(donationsTable.type, "monetary"),
                  gte(donationsTable.createdAt, m.start),
                  lt(donationsTable.createdAt, m.end),
                ))
            )[0]?.total ?? "0"
          ),
        }))
      ),
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

    res.json({ adoptionsByMonth, donationsByMonth, petsByType, topCities });
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

export default router;

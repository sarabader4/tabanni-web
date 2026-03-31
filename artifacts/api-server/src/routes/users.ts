import { Router, type IRouter, type Request, type Response } from "express";
import { db, usersTable, petsTable, adoptionRequestsTable, fosterRequestsTable, donationsTable, favouritesTable, notificationsTable } from "@workspace/db";
import { eq, desc, and, sql, lt } from "drizzle-orm";
import { UpdateMyProfileBody } from "@workspace/api-zod";

const router: IRouter = Router();

function requireAuth(req: Request, res: Response): boolean {
  if (!req.userId) {
    res.status(401).json({ error: "unauthorized", message: "Authentication required" });
    return false;
  }
  return true;
}

router.get("/users/me", async (req, res): Promise<void> => {
  try {
    if (!requireAuth(req, res)) return;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId));
    if (!user) { res.status(404).json({ error: "not_found", message: "User not found" }); return; }
    const { passwordHash: _pw, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    req.log.error({ err }, "Error getting user profile");
    res.status(500).json({ error: "internal_error", message: "Failed to get profile" });
  }
});

router.put("/users/me", async (req, res): Promise<void> => {
  try {
    if (!requireAuth(req, res)) return;
    const parsed = UpdateMyProfileBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "validation_error", message: "Invalid request body", details: parsed.error.issues });
      return;
    }
    const { fullName, email, phone, country, city, avatarUrl } = parsed.data;
    const [user] = await db.update(usersTable)
      .set({ fullName, email, phone, country, city, avatarUrl })
      .where(eq(usersTable.id, req.userId))
      .returning();
    if (!user) { res.status(404).json({ error: "not_found", message: "User not found" }); return; }
    const { passwordHash: _pw, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    req.log.error({ err }, "Error updating user profile");
    res.status(500).json({ error: "internal_error", message: "Failed to update profile" });
  }
});

router.get("/users/me/pets", async (req, res): Promise<void> => {
  try {
    if (!requireAuth(req, res)) return;
    const pets = await db.select().from(petsTable)
      .where(eq(petsTable.ownerId, req.userId))
      .orderBy(desc(petsTable.createdAt));
    res.json(pets);
  } catch (err) {
    req.log.error({ err }, "Error getting user pets");
    res.status(500).json({ error: "internal_error", message: "Failed to get user pets" });
  }
});

router.get("/users/me/applications", async (req, res): Promise<void> => {
  try {
    if (!requireAuth(req, res)) return;
    const [adoptionRequests, fosterRequests] = await Promise.all([
      db.select({
        id: adoptionRequestsTable.id,
        petId: adoptionRequestsTable.petId,
        requesterId: adoptionRequestsTable.requesterId,
        message: adoptionRequestsTable.message,
        status: adoptionRequestsTable.status,
        petName: petsTable.name,
        petImageUrls: petsTable.imageUrls,
        petType: petsTable.type,
        petBreed: petsTable.breed,
        petGender: petsTable.gender,
        petAgeMonths: petsTable.ageMonths,
        petStory: petsTable.story,
        petCity: petsTable.city,
        petPurpose: petsTable.purpose,
        createdAt: adoptionRequestsTable.createdAt,
      })
        .from(adoptionRequestsTable)
        .leftJoin(petsTable, eq(adoptionRequestsTable.petId, petsTable.id))
        .where(eq(adoptionRequestsTable.requesterId, req.userId))
        .orderBy(desc(adoptionRequestsTable.createdAt)),
      db.select({
        id: fosterRequestsTable.id,
        petId: fosterRequestsTable.petId,
        requesterId: fosterRequestsTable.requesterId,
        message: fosterRequestsTable.message,
        status: fosterRequestsTable.status,
        petName: petsTable.name,
        petImageUrls: petsTable.imageUrls,
        petType: petsTable.type,
        petBreed: petsTable.breed,
        petGender: petsTable.gender,
        petAgeMonths: petsTable.ageMonths,
        petStory: petsTable.story,
        petCity: petsTable.city,
        petPurpose: petsTable.purpose,
        createdAt: fosterRequestsTable.createdAt,
      })
        .from(fosterRequestsTable)
        .leftJoin(petsTable, eq(fosterRequestsTable.petId, petsTable.id))
        .where(eq(fosterRequestsTable.requesterId, req.userId))
        .orderBy(desc(fosterRequestsTable.createdAt)),
    ]);

    res.json({
      adoptionRequests: adoptionRequests.map(r => ({
        ...r,
        petImageUrl: Array.isArray(r.petImageUrls) ? r.petImageUrls[0] ?? null : null,
        petImageUrls: Array.isArray(r.petImageUrls) ? r.petImageUrls : [],
      })),
      fosterRequests: fosterRequests.map(r => ({
        ...r,
        petImageUrl: Array.isArray(r.petImageUrls) ? r.petImageUrls[0] ?? null : null,
        petImageUrls: Array.isArray(r.petImageUrls) ? r.petImageUrls : [],
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Error getting user applications");
    res.status(500).json({ error: "internal_error", message: "Failed to get applications" });
  }
});

router.get("/users/me/favourites", async (req, res): Promise<void> => {
  try {
    if (!requireAuth(req, res)) return;
    const pets = await db.select({
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
      story: petsTable.story,
      ownerId: petsTable.ownerId,
      ownerName: usersTable.fullName,
      ownerPhone: usersTable.phone,
      approved: petsTable.approved,
      featured: petsTable.featured,
      createdAt: petsTable.createdAt,
    })
      .from(favouritesTable)
      .innerJoin(petsTable, eq(favouritesTable.petId, petsTable.id))
      .leftJoin(usersTable, eq(petsTable.ownerId, usersTable.id))
      .where(eq(favouritesTable.userId, req.userId));
    res.json(pets);
  } catch (err) {
    req.log.error({ err }, "Error getting user favourites");
    res.status(500).json({ error: "internal_error", message: "Failed to get favourites" });
  }
});

router.get("/users/me/donations", async (req, res): Promise<void> => {
  try {
    if (!requireAuth(req, res)) return;
    const donations = await db.select().from(donationsTable)
      .where(eq(donationsTable.userId, req.userId))
      .orderBy(desc(donationsTable.createdAt));
    res.json(donations);
  } catch (err) {
    req.log.error({ err }, "Error getting user donations");
    res.status(500).json({ error: "internal_error", message: "Failed to get donations" });
  }
});

router.get("/users/me/notifications", async (req, res): Promise<void> => {
  try {
    if (!requireAuth(req, res)) return;
    const notifications = await db.select({
      id: notificationsTable.id,
      userId: notificationsTable.userId,
      petId: notificationsTable.petId,
      petName: petsTable.name,
      type: notificationsTable.type,
      title: notificationsTable.title,
      message: notificationsTable.message,
      read: notificationsTable.read,
      createdAt: notificationsTable.createdAt,
    })
      .from(notificationsTable)
      .leftJoin(petsTable, eq(notificationsTable.petId, petsTable.id))
      .where(eq(notificationsTable.userId, req.userId))
      .orderBy(desc(notificationsTable.createdAt));
    res.json(notifications);
  } catch (err) {
    req.log.error({ err }, "Error getting user notifications");
    res.status(500).json({ error: "internal_error", message: "Failed to get notifications" });
  }
});

router.get("/users/me/notifications/unread-count", async (req, res): Promise<void> => {
  try {
    if (!requireAuth(req, res)) return;
    const [result] = await db.select({ count: sql<number>`count(*)::int` })
      .from(notificationsTable)
      .where(and(
        eq(notificationsTable.userId, req.userId),
        eq(notificationsTable.read, false),
      ));
    res.json({ count: result?.count ?? 0 });
  } catch (err) {
    req.log.error({ err }, "Error getting unread notification count");
    res.status(500).json({ error: "internal_error", message: "Failed to get unread count" });
  }
});

router.patch("/users/me/notifications/read-all", async (req, res): Promise<void> => {
  try {
    if (!requireAuth(req, res)) return;
    await db.update(notificationsTable)
      .set({ read: true })
      .where(and(
        eq(notificationsTable.userId, req.userId),
        eq(notificationsTable.read, false),
      ));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Error marking all notifications as read");
    res.status(500).json({ error: "internal_error", message: "Failed to mark all as read" });
  }
});

router.patch("/users/me/notifications/:id/read", async (req, res): Promise<void> => {
  try {
    if (!requireAuth(req, res)) return;
    const notifId = parseInt(req.params.id);
    if (isNaN(notifId)) {
      res.status(400).json({ error: "validation_error", message: "Invalid notification id" });
      return;
    }
    const [notif] = await db.update(notificationsTable)
      .set({ read: true })
      .where(and(eq(notificationsTable.id, notifId), eq(notificationsTable.userId, req.userId)))
      .returning();
    if (!notif) {
      res.status(404).json({ error: "not_found", message: "Notification not found" });
      return;
    }
    res.json(notif);
  } catch (err) {
    req.log.error({ err }, "Error marking notification as read");
    res.status(500).json({ error: "internal_error", message: "Failed to mark notification as read" });
  }
});

export default router;

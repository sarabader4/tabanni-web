import { Router, type IRouter, type Request, type Response } from "express";
import { db, usersTable, petsTable, adoptionRequestsTable, fosterRequestsTable, donationsTable, favouritesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
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
        petImageUrl: petsTable.imageUrls,
        requesterName: usersTable.fullName,
        createdAt: adoptionRequestsTable.createdAt,
      })
        .from(adoptionRequestsTable)
        .leftJoin(petsTable, eq(adoptionRequestsTable.petId, petsTable.id))
        .leftJoin(usersTable, eq(adoptionRequestsTable.requesterId, usersTable.id))
        .where(eq(adoptionRequestsTable.requesterId, req.userId))
        .orderBy(desc(adoptionRequestsTable.createdAt)),
      db.select({
        id: fosterRequestsTable.id,
        petId: fosterRequestsTable.petId,
        requesterId: fosterRequestsTable.requesterId,
        message: fosterRequestsTable.message,
        status: fosterRequestsTable.status,
        petName: petsTable.name,
        petImageUrl: petsTable.imageUrls,
        requesterName: usersTable.fullName,
        createdAt: fosterRequestsTable.createdAt,
      })
        .from(fosterRequestsTable)
        .leftJoin(petsTable, eq(fosterRequestsTable.petId, petsTable.id))
        .leftJoin(usersTable, eq(fosterRequestsTable.requesterId, usersTable.id))
        .where(eq(fosterRequestsTable.requesterId, req.userId))
        .orderBy(desc(fosterRequestsTable.createdAt)),
    ]);

    res.json({
      adoptionRequests: adoptionRequests.map(r => ({ ...r, petImageUrl: Array.isArray(r.petImageUrl) ? r.petImageUrl[0] : null })),
      fosterRequests: fosterRequests.map(r => ({ ...r, petImageUrl: Array.isArray(r.petImageUrl) ? r.petImageUrl[0] : null })),
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

export default router;

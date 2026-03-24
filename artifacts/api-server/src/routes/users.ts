import { Router, type IRouter } from "express";
import { db, usersTable, petsTable, adoptionRequestsTable, fosterRequestsTable, donationsTable, favouritesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { UserIdQueryParams, UpdateMyProfileBody } from "@workspace/api-zod";

const router: IRouter = Router();

function parseUserId(query: Record<string, unknown>): { id: number } | { error: string } {
  if (!query.userId) return { id: 1 };
  const parsed = UserIdQueryParams.safeParse(query);
  if (!parsed.success) return { error: "userId query param must be a number" };
  return { id: parsed.data.userId };
}

router.get("/users/me", async (req, res) => {
  try {
    const result = parseUserId(req.query as Record<string, unknown>);
    if ("error" in result) return res.status(400).json({ error: "validation_error", message: result.error });

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, result.id));
    if (!user) return res.status(404).json({ error: "not_found", message: "User not found" });
    res.json(user);
  } catch (err) {
    req.log.error({ err }, "Error getting user profile");
    res.status(500).json({ error: "internal_error", message: "Failed to get profile" });
  }
});

router.put("/users/me", async (req, res) => {
  try {
    const result = parseUserId(req.query as Record<string, unknown>);
    if ("error" in result) return res.status(400).json({ error: "validation_error", message: result.error });

    const parsed = UpdateMyProfileBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "validation_error", message: "Invalid request body", details: parsed.error.issues });
    }
    const { fullName, email, phone, country, city, avatarUrl } = parsed.data;
    const [user] = await db.update(usersTable)
      .set({ fullName, email, phone, country, city, avatarUrl })
      .where(eq(usersTable.id, result.id))
      .returning();
    if (!user) return res.status(404).json({ error: "not_found", message: "User not found" });
    res.json(user);
  } catch (err) {
    req.log.error({ err }, "Error updating user profile");
    res.status(500).json({ error: "internal_error", message: "Failed to update profile" });
  }
});

router.get("/users/me/pets", async (req, res) => {
  try {
    const result = parseUserId(req.query as Record<string, unknown>);
    if ("error" in result) return res.status(400).json({ error: "validation_error", message: result.error });

    const pets = await db.select().from(petsTable)
      .where(eq(petsTable.ownerId, result.id))
      .orderBy(desc(petsTable.createdAt));
    res.json(pets);
  } catch (err) {
    req.log.error({ err }, "Error getting user pets");
    res.status(500).json({ error: "internal_error", message: "Failed to get user pets" });
  }
});

router.get("/users/me/applications", async (req, res) => {
  try {
    const result = parseUserId(req.query as Record<string, unknown>);
    if ("error" in result) return res.status(400).json({ error: "validation_error", message: result.error });

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
        .where(eq(adoptionRequestsTable.requesterId, result.id))
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
        .where(eq(fosterRequestsTable.requesterId, result.id))
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

router.get("/users/me/favourites", async (req, res) => {
  try {
    const result = parseUserId(req.query as Record<string, unknown>);
    if ("error" in result) return res.status(400).json({ error: "validation_error", message: result.error });

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
      .where(eq(favouritesTable.userId, result.id));
    res.json(pets);
  } catch (err) {
    req.log.error({ err }, "Error getting user favourites");
    res.status(500).json({ error: "internal_error", message: "Failed to get favourites" });
  }
});

router.get("/users/me/donations", async (req, res) => {
  try {
    const result = parseUserId(req.query as Record<string, unknown>);
    if ("error" in result) return res.status(400).json({ error: "validation_error", message: result.error });

    const donations = await db.select().from(donationsTable)
      .where(eq(donationsTable.userId, result.id))
      .orderBy(desc(donationsTable.createdAt));
    res.json(donations);
  } catch (err) {
    req.log.error({ err }, "Error getting user donations");
    res.status(500).json({ error: "internal_error", message: "Failed to get donations" });
  }
});

export default router;

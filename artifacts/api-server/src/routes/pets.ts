import { Router, type IRouter } from "express";
import { db, petsTable, usersTable, favouritesTable } from "@workspace/db";
import { eq, and, ilike, sql, desc, gte, lte } from "drizzle-orm";
import { CreatePetBody, ListPetsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/pets", async (req, res) => {
  try {
    const parsed = ListPetsQueryParams.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: "validation_error", message: "Invalid query parameters", details: parsed.error.issues });
    }

    const { type, gender, size, city, breed, sterilized, purpose, status, search, page = 1, limit = 16 } = parsed.data;
    const minAge = req.query.minAge ? parseInt(req.query.minAge as string) : undefined;
    const maxAge = req.query.maxAge ? parseInt(req.query.maxAge as string) : undefined;

    const pageNum = page;
    const limitNum = limit;
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    if (type) conditions.push(eq(petsTable.type, type as any));
    if (gender) conditions.push(eq(petsTable.gender, gender as any));
    if (size) conditions.push(eq(petsTable.size, size as any));
    if (city) conditions.push(ilike(petsTable.city, `%${city}%`));
    if (breed) conditions.push(ilike(petsTable.breed, `%${breed}%`));
    if (sterilized !== undefined) conditions.push(eq(petsTable.sterilized, sterilized));
    if (purpose) conditions.push(eq(petsTable.purpose, purpose as any));
    if (status) conditions.push(eq(petsTable.status, status as any));
    if (search) conditions.push(ilike(petsTable.name, `%${search}%`));
    if (minAge !== undefined) conditions.push(gte(petsTable.ageMonths, minAge));
    if (maxAge !== undefined) conditions.push(lte(petsTable.ageMonths, maxAge));

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
        story: petsTable.story,
        ownerId: petsTable.ownerId,
        ownerName: usersTable.fullName,
        ownerPhone: usersTable.phone,
        approved: petsTable.approved,
        featured: petsTable.featured,
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
    req.log.error({ err }, "Error listing pets");
    res.status(500).json({ error: "internal_error", message: "Failed to list pets" });
  }
});

router.post("/pets", async (req, res) => {
  try {
    const parsed = CreatePetBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "validation_error", message: "Invalid request body", details: parsed.error.issues });
    }

    const { name, type, breed, gender, ageMonths, weightKg, size, color, sterilized, yearlyVaccines, birthday, city, purpose, imageUrls, story, ownerId } = parsed.data;

    const [pet] = await db.insert(petsTable).values({
      name, type, breed, gender,
      ageMonths: ageMonths ?? 0,
      weightKg, size, color,
      sterilized: sterilized ?? false,
      yearlyVaccines: yearlyVaccines ?? false,
      birthday, city, purpose,
      imageUrls: imageUrls ?? [],
      story, ownerId,
      approved: false, featured: false,
    }).returning();

    res.status(201).json(pet);
  } catch (err) {
    req.log.error({ err }, "Error creating pet");
    res.status(500).json({ error: "internal_error", message: "Failed to create pet" });
  }
});

router.get("/pets/featured", async (req, res) => {
  try {
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
      .from(petsTable)
      .leftJoin(usersTable, eq(petsTable.ownerId, usersTable.id))
      .where(and(eq(petsTable.featured, true), eq(petsTable.approved, true)))
      .orderBy(desc(petsTable.createdAt))
      .limit(8);

    res.json(pets);
  } catch (err) {
    req.log.error({ err }, "Error getting featured pets");
    res.status(500).json({ error: "internal_error", message: "Failed to get featured pets" });
  }
});

router.get("/pets/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "validation_error", message: "Invalid pet id" });

    const [pet] = await db.select({
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
      .from(petsTable)
      .leftJoin(usersTable, eq(petsTable.ownerId, usersTable.id))
      .where(eq(petsTable.id, id));

    if (!pet) return res.status(404).json({ error: "not_found", message: "Pet not found" });
    res.json(pet);
  } catch (err) {
    req.log.error({ err }, "Error getting pet");
    res.status(500).json({ error: "internal_error", message: "Failed to get pet" });
  }
});

router.put("/pets/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "validation_error", message: "Invalid pet id" });

    const updates = req.body;
    const [pet] = await db.update(petsTable).set(updates).where(eq(petsTable.id, id)).returning();
    if (!pet) return res.status(404).json({ error: "not_found", message: "Pet not found" });
    res.json(pet);
  } catch (err) {
    req.log.error({ err }, "Error updating pet");
    res.status(500).json({ error: "internal_error", message: "Failed to update pet" });
  }
});

router.delete("/pets/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "validation_error", message: "Invalid pet id" });

    await db.delete(petsTable).where(eq(petsTable.id, id));
    res.json({ success: true, message: "Pet deleted" });
  } catch (err) {
    req.log.error({ err }, "Error deleting pet");
    res.status(500).json({ error: "internal_error", message: "Failed to delete pet" });
  }
});

router.post("/pets/:id/favourite", async (req, res) => {
  try {
    const petId = parseInt(req.params.id);
    if (isNaN(petId)) return res.status(400).json({ error: "validation_error", message: "Invalid pet id" });

    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "validation_error", message: "userId required" });

    const existing = await db.select().from(favouritesTable)
      .where(and(eq(favouritesTable.userId, userId), eq(favouritesTable.petId, petId)));

    if (existing.length > 0) {
      await db.delete(favouritesTable).where(and(eq(favouritesTable.userId, userId), eq(favouritesTable.petId, petId)));
      return res.json({ success: true, message: "Removed from favourites" });
    }

    await db.insert(favouritesTable).values({ userId, petId });
    res.json({ success: true, message: "Added to favourites" });
  } catch (err) {
    req.log.error({ err }, "Error toggling favourite");
    res.status(500).json({ error: "internal_error", message: "Failed to toggle favourite" });
  }
});

export default router;

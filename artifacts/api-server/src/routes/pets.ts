import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import {
  db,
  petsTable,
  usersTable,
  favouritesTable,
  adoptionRequestsTable,
  fosterRequestsTable,
  messagesTable,
  notificationsTable,
  donationsTable,
  lostFoundReportsTable,
} from "@workspace/db";
import { eq, and, ilike, sql, desc, gte, lte } from "drizzle-orm";
import {
  CreatePetBody,
  ListPetsQueryParams,
  UpdatePetBody,
  GetPetParams,
  UpdatePetParams,
  DeletePetParams,
  ToggleFavouriteParams,
  ToggleFavouriteBody,
} from "@workspace/api-zod";
import { createAdminNotification } from "../lib/notifications";
import { cache, CACHE_TTL, CACHE_PREFIX } from "../lib/cache";

const router: IRouter = Router();

const PET_TYPES = ["dog", "cat", "rabbit", "bird", "other"] as const;
const PET_GENDERS = ["male", "female"] as const;
const PET_SIZES = ["small", "medium", "large"] as const;
const PET_STATUSES = ["available", "adopted", "fostered", "pending", "lost", "found"] as const;
const PET_PURPOSES = ["adopt", "foster", "both", "lost_found"] as const;

function transformImageUrls(petId: number, rawUrls: unknown, firstOnly = false): string[] {
  const urls = Array.isArray(rawUrls) ? (rawUrls as string[]) : [];
  const slice = firstOnly ? urls.slice(0, 1) : urls;
  return slice.map((url, idx) =>
    typeof url === "string" && url.startsWith("data:") ? `/api/pets/${petId}/image/${idx}` : url
  );
}

router.get("/pets", async (req, res) => {
  try {
    const parsed = ListPetsQueryParams.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: "validation_error", message: "Invalid query parameters", details: parsed.error.issues });
    }

    const cacheKey = CACHE_PREFIX.PETS_LIST + JSON.stringify(parsed.data);
    const cached = await cache.get<{ pets: unknown[]; total: number; page: number; totalPages: number }>(cacheKey);
    if (cached) {
      res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
      return res.json(cached);
    }

    const { type, gender, size, city, breed, sterilized, purpose, status, search, page = 1, limit = 16, minAge, maxAge } = parsed.data;

    const pageNum = page;
    const limitNum = limit;
    const offset = (pageNum - 1) * limitNum;

    const conditions = [eq(petsTable.approved, true)];

    const petType = type ? PET_TYPES.find(t => t === type) : undefined;
    if (petType) conditions.push(eq(petsTable.type, petType));

    const petGender = gender ? PET_GENDERS.find(g => g === gender) : undefined;
    if (petGender) conditions.push(eq(petsTable.gender, petGender));

    const petSize = size ? PET_SIZES.find(s => s === size) : undefined;
    if (petSize) conditions.push(eq(petsTable.size, petSize));

    if (city) conditions.push(ilike(petsTable.city, `%${city}%`));
    if (breed) conditions.push(ilike(petsTable.breed, `%${breed}%`));
    if (sterilized !== undefined) conditions.push(eq(petsTable.sterilized, sterilized));

    const petPurpose = purpose ? PET_PURPOSES.find(p => p === purpose) : undefined;
    if (petPurpose) conditions.push(eq(petsTable.purpose, petPurpose));

    const petStatus = status ? PET_STATUSES.find(s => s === status) : undefined;
    if (petStatus) {
      conditions.push(eq(petsTable.status, petStatus));
    } else {
      conditions.push(eq(petsTable.status, "available"));
    }

    if (search) conditions.push(ilike(petsTable.name, `%${search}%`));
    if (minAge !== undefined && !isNaN(minAge)) conditions.push(gte(petsTable.ageMonths, minAge));
    if (maxAge !== undefined && !isNaN(maxAge)) conditions.push(lte(petsTable.ageMonths, maxAge));

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

    const transformedPets = pets.map(p => ({ ...p, imageUrls: transformImageUrls(p.id, p.imageUrls, true) }));
    const responseBody = { pets: transformedPets, total, page: pageNum, totalPages: Math.ceil(total / limitNum) };
    await cache.set(cacheKey, responseBody, CACHE_TTL.LISTING);

    res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
    res.json(responseBody);
  } catch (err) {
    req.log.error({ err }, "Error listing pets");
    res.status(500).json({ error: "internal_error", message: "Failed to list pets" });
  }
});

router.post("/pets", requireAuth, async (req, res) => {
  try {
    const parsed = CreatePetBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "validation_error", message: "Invalid request body", details: parsed.error.issues });
    }

    const { name, type, breed, gender, ageMonths, weightKg, size, color, sterilized, yearlyVaccines, birthday, city, purpose, imageUrls, story, whatsappUrl, paymentProof } = parsed.data;

    const [pet] = await db.insert(petsTable).values({
      name, type, breed, gender,
      ageMonths: ageMonths ?? 0,
      weightKg, size, color,
      sterilized: sterilized ?? false,
      yearlyVaccines: yearlyVaccines ?? false,
      birthday, city, purpose,
      imageUrls: imageUrls ?? [],
      story, whatsappUrl, paymentProof,
      ownerId: req.userId,
      approved: false, featured: false, addedByAdmin: req.userRole === "admin",
    }).returning();

    const [submitter] = await db.select({ fullName: usersTable.fullName }).from(usersTable).where(eq(usersTable.id, req.userId!));
    createAdminNotification(
      "new_pet",
      "New Pet Submission",
      `${submitter?.fullName ?? "A user"} submitted a new pet "${name}" for review.`,
      req.userId,
      { petId: pet.id },
    ).catch(() => {});

    res.status(201).json(pet);
  } catch (err) {
    req.log.error({ err }, "Error creating pet");
    res.status(500).json({ error: "internal_error", message: "Failed to create pet" });
  }
});

router.get("/pets/featured", async (req, res) => {
  try {
    const cached = await cache.get<unknown[]>(CACHE_PREFIX.PETS_FEATURED);
    if (cached) {
      res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
      return res.json(cached);
    }

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
      addedByAdmin: petsTable.addedByAdmin,
      createdAt: petsTable.createdAt,
    })
      .from(petsTable)
      .leftJoin(usersTable, eq(petsTable.ownerId, usersTable.id))
      .where(and(eq(petsTable.featured, true), eq(petsTable.approved, true)))
      .orderBy(desc(petsTable.createdAt))
      .limit(8);

    const transformedFeatured = pets.map(p => ({ ...p, imageUrls: transformImageUrls(p.id, p.imageUrls, true) }));
    await cache.set(CACHE_PREFIX.PETS_FEATURED, transformedFeatured, CACHE_TTL.LISTING);

    res.set("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
    res.json(transformedFeatured);
  } catch (err) {
    req.log.error({ err }, "Error getting featured pets");
    res.status(500).json({ error: "internal_error", message: "Failed to get featured pets" });
  }
});

router.get("/pets/:id/image/:idx", async (req, res) => {
  try {
    const petId = parseInt(req.params.id, 10);
    const idx = parseInt(req.params.idx, 10);
    if (isNaN(petId) || isNaN(idx) || idx < 0) return res.status(400).end();

    const [pet] = await db
      .select({ imageUrls: petsTable.imageUrls })
      .from(petsTable)
      .where(eq(petsTable.id, petId))
      .limit(1);

    if (!pet) return res.status(404).end();
    const urls = pet.imageUrls as string[] | null;
    const url = urls?.[idx];
    if (!url) return res.status(404).end();

    if (url.startsWith("data:")) {
      const commaIdx = url.indexOf(",");
      if (commaIdx === -1) return res.status(422).end();
      const mime = (url.slice(0, commaIdx).match(/data:([^;,]+)/) ?? [])[1] ?? "image/jpeg";
      const buffer = Buffer.from(url.slice(commaIdx + 1), "base64");
      res.set("Content-Type", mime);
      res.set("Cache-Control", "public, max-age=31536000, immutable");
      res.set("Content-Length", String(buffer.length));
      return res.end(buffer);
    }
    return res.redirect(302, url);
  } catch (err) {
    req.log.error({ err }, "Error serving pet image");
    res.status(500).end();
  }
});

router.get("/pets/:id", async (req, res) => {
  try {
    const paramsParsed = GetPetParams.safeParse(req.params);
    if (!paramsParsed.success) {
      return res.status(400).json({ error: "validation_error", message: "Invalid pet id", details: paramsParsed.error.issues });
    }

    const cacheKey = CACHE_PREFIX.PET_DETAIL + paramsParsed.data.id;
    const cachedPet = await cache.get<unknown>(cacheKey);
    if (cachedPet) {
      res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=120");
      return res.json(cachedPet);
    }

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
      addedByAdmin: petsTable.addedByAdmin,
      createdAt: petsTable.createdAt,
    })
      .from(petsTable)
      .leftJoin(usersTable, eq(petsTable.ownerId, usersTable.id))
      .where(eq(petsTable.id, paramsParsed.data.id));

    if (!pet) return res.status(404).json({ error: "not_found", message: "Pet not found" });
    const petTransformed = { ...pet, imageUrls: transformImageUrls(pet.id, pet.imageUrls) };
    await cache.set(cacheKey, petTransformed, CACHE_TTL.DETAIL);
    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=120");
    res.json(petTransformed);
  } catch (err) {
    req.log.error({ err }, "Error getting pet");
    res.status(500).json({ error: "internal_error", message: "Failed to get pet" });
  }
});

router.put("/pets/:id", async (req, res) => {
  try {
    const paramsParsed = UpdatePetParams.safeParse(req.params);
    if (!paramsParsed.success) {
      return res.status(400).json({ error: "validation_error", message: "Invalid pet id", details: paramsParsed.error.issues });
    }
    const bodyParsed = UpdatePetBody.safeParse(req.body);
    if (!bodyParsed.success) {
      return res.status(400).json({ error: "validation_error", message: "Invalid request body", details: bodyParsed.error.issues });
    }

    const [pet] = await db.update(petsTable).set(bodyParsed.data).where(eq(petsTable.id, paramsParsed.data.id)).returning();
    if (!pet) return res.status(404).json({ error: "not_found", message: "Pet not found" });
    await cache.invalidatePrefix(CACHE_PREFIX.PETS_LIST);
    await cache.invalidatePrefix(CACHE_PREFIX.PET_DETAIL + paramsParsed.data.id);
    await cache.invalidatePrefix(CACHE_PREFIX.PETS_FEATURED);
    res.json(pet);
  } catch (err) {
    req.log.error({ err }, "Error updating pet");
    res.status(500).json({ error: "internal_error", message: "Failed to update pet" });
  }
});

router.delete("/pets/:id", async (req, res) => {
  try {
    const paramsParsed = DeletePetParams.safeParse(req.params);
    if (!paramsParsed.success) {
      return res.status(400).json({ error: "validation_error", message: "Invalid pet id", details: paramsParsed.error.issues });
    }

    const petId = paramsParsed.data.id;

    await db.delete(adoptionRequestsTable).where(eq(adoptionRequestsTable.petId, petId));
    await db.delete(fosterRequestsTable).where(eq(fosterRequestsTable.petId, petId));
    await db.delete(favouritesTable).where(eq(favouritesTable.petId, petId));
    await db.update(messagesTable).set({ petId: null }).where(eq(messagesTable.petId, petId));
    await db.update(notificationsTable).set({ petId: null }).where(eq(notificationsTable.petId, petId));
    await db.update(donationsTable).set({ petId: null }).where(eq(donationsTable.petId, petId));
    await db.update(lostFoundReportsTable).set({ petId: null }).where(eq(lostFoundReportsTable.petId, petId));

    await db.delete(petsTable).where(eq(petsTable.id, petId));
    await cache.invalidatePrefix(CACHE_PREFIX.PETS_LIST);
    await cache.invalidatePrefix(CACHE_PREFIX.PET_DETAIL + petId);
    await cache.invalidatePrefix(CACHE_PREFIX.PETS_FEATURED);
    res.json({ success: true, message: "Pet deleted" });
  } catch (err) {
    req.log.error({ err }, "Error deleting pet");
    res.status(500).json({ error: "internal_error", message: "Failed to delete pet" });
  }
});

router.post("/pets/:id/favourite", requireAuth, async (req, res): Promise<void> => {
  try {
    const paramsParsed = ToggleFavouriteParams.safeParse(req.params);
    if (!paramsParsed.success) {
      res.status(400).json({ error: "validation_error", message: "Invalid pet id", details: paramsParsed.error.issues });
      return;
    }
    const petId = paramsParsed.data.id;
    const userId = req.userId;

    const existing = await db.select().from(favouritesTable)
      .where(and(eq(favouritesTable.userId, userId), eq(favouritesTable.petId, petId)));

    if (existing.length > 0) {
      await db.delete(favouritesTable).where(and(eq(favouritesTable.userId, userId), eq(favouritesTable.petId, petId)));
      res.json({ success: true, message: "Removed from favourites" });
      return;
    }

    await db.insert(favouritesTable).values({ userId, petId });
    res.json({ success: true, message: "Added to favourites" });
  } catch (err) {
    req.log.error({ err }, "Error toggling favourite");
    res.status(500).json({ error: "internal_error", message: "Failed to toggle favourite" });
  }
});

export default router;

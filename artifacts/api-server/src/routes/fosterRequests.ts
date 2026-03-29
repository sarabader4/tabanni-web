import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { db, fosterRequestsTable, petsTable, usersTable, userProfilesTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import {
  ListFosterRequestsQueryParams,
  CreateFosterRequestBody,
  UpdateFosterRequestStatusBody,
  UpdateFosterRequestStatusParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const FOSTER_STATUSES = ["pending", "approved", "rejected"] as const;

router.get("/foster-requests", requireAuth, async (req, res) => {
  try {
    const queryParsed = ListFosterRequestsQueryParams.safeParse(req.query);
    if (!queryParsed.success) {
      return res.status(400).json({ error: "validation_error", message: "Invalid query parameters", details: queryParsed.error.issues });
    }

    const { status, petId, requesterId } = queryParsed.data;

    const conditions = [];
    const reqStatus = status ? FOSTER_STATUSES.find(s => s === status) : undefined;
    if (reqStatus) conditions.push(eq(fosterRequestsTable.status, reqStatus));
    if (petId !== undefined) conditions.push(eq(fosterRequestsTable.petId, petId));

    // Non-admin users can only view their own requests; admins can see all (and filter by requesterId)
    if (req.userRole !== "admin") {
      conditions.push(eq(fosterRequestsTable.requesterId, req.userId));
    } else if (requesterId !== undefined) {
      conditions.push(eq(fosterRequestsTable.requesterId, requesterId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const requests = await db.select({
      id: fosterRequestsTable.id,
      petId: fosterRequestsTable.petId,
      requesterId: fosterRequestsTable.requesterId,
      message: fosterRequestsTable.message,
      status: fosterRequestsTable.status,
      petName: petsTable.name,
      petImageUrl: petsTable.imageUrls,
      requesterName: usersTable.fullName,
      requesterCity: usersTable.city,
      createdAt: fosterRequestsTable.createdAt,
    })
      .from(fosterRequestsTable)
      .leftJoin(petsTable, eq(fosterRequestsTable.petId, petsTable.id))
      .leftJoin(usersTable, eq(fosterRequestsTable.requesterId, usersTable.id))
      .where(whereClause)
      .orderBy(desc(fosterRequestsTable.createdAt));

    const mapped = requests.map(r => ({
      ...r,
      petImageUrl: Array.isArray(r.petImageUrl) ? r.petImageUrl[0] : null,
    }));

    res.json(mapped);
  } catch (err) {
    req.log.error({ err }, "Error listing foster requests");
    res.status(500).json({ error: "internal_error", message: "Failed to list foster requests" });
  }
});

router.get("/foster-requests/incoming", requireAuth, async (req, res): Promise<void> => {
  try {
    const myPets = await db.select({ id: petsTable.id }).from(petsTable).where(eq(petsTable.ownerId, req.userId));
    const myPetIds = myPets.map(p => p.id);

    if (myPetIds.length === 0) {
      res.json([]);
      return;
    }

    const rows = await db.select({
      id: fosterRequestsTable.id,
      petId: fosterRequestsTable.petId,
      requesterId: fosterRequestsTable.requesterId,
      message: fosterRequestsTable.message,
      status: fosterRequestsTable.status,
      petName: petsTable.name,
      petImageUrl: petsTable.imageUrls,
      requesterName: usersTable.fullName,
      requesterCity: usersTable.city,
      createdAt: fosterRequestsTable.createdAt,
      requesterProfile: userProfilesTable,
    })
      .from(fosterRequestsTable)
      .leftJoin(petsTable, eq(fosterRequestsTable.petId, petsTable.id))
      .leftJoin(usersTable, eq(fosterRequestsTable.requesterId, usersTable.id))
      .leftJoin(userProfilesTable, eq(fosterRequestsTable.requesterId, userProfilesTable.userId))
      .where(eq(petsTable.ownerId, req.userId))
      .orderBy(desc(fosterRequestsTable.createdAt));

    const result = rows.map(r => ({
      ...r,
      petImageUrl: Array.isArray(r.petImageUrl) ? r.petImageUrl[0] : null,
      requesterProfile: r.requesterProfile ?? null,
    }));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error listing incoming foster requests");
    res.status(500).json({ error: "internal_error", message: "Failed to list incoming foster requests" });
  }
});

router.get("/foster-requests/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "validation_error", message: "Invalid id" });
      return;
    }

    const [request] = await db.select({
      id: fosterRequestsTable.id,
      petId: fosterRequestsTable.petId,
      requesterId: fosterRequestsTable.requesterId,
      message: fosterRequestsTable.message,
      status: fosterRequestsTable.status,
      petName: petsTable.name,
      petImageUrl: petsTable.imageUrls,
      petOwnerId: petsTable.ownerId,
      requesterName: usersTable.fullName,
      requesterCity: usersTable.city,
      createdAt: fosterRequestsTable.createdAt,
    })
      .from(fosterRequestsTable)
      .leftJoin(petsTable, eq(fosterRequestsTable.petId, petsTable.id))
      .leftJoin(usersTable, eq(fosterRequestsTable.requesterId, usersTable.id))
      .where(eq(fosterRequestsTable.id, id));

    if (!request) {
      res.status(404).json({ error: "not_found", message: "Request not found" });
      return;
    }

    const isRequester = request.requesterId === req.userId;
    const isPetOwner = request.petOwnerId === req.userId;
    const isAdmin = req.userRole === "admin";

    if (!isRequester && !isPetOwner && !isAdmin) {
      res.status(403).json({ error: "forbidden", message: "Access denied" });
      return;
    }

    const [requesterProfile] = await db.select().from(userProfilesTable).where(eq(userProfilesTable.userId, request.requesterId));

    res.json({
      ...request,
      petImageUrl: Array.isArray(request.petImageUrl) ? request.petImageUrl[0] : null,
      requesterProfile: requesterProfile ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching foster request");
    res.status(500).json({ error: "internal_error", message: "Failed to fetch foster request" });
  }
});

router.post("/foster-requests", requireAuth, async (req, res): Promise<void> => {
  try {
    const [currentUser] = await db.select({ isOnboardingCompleted: usersTable.isOnboardingCompleted }).from(usersTable).where(eq(usersTable.id, req.userId));
    if (!currentUser?.isOnboardingCompleted) {
      res.status(403).json({ error: "onboarding_required", message: "Please complete your adoption profile before submitting a request" });
      return;
    }

    const parsed = CreateFosterRequestBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "validation_error", message: "Invalid request body", details: parsed.error.issues });
      return;
    }

    const { petId, message } = parsed.data;

    const existing = await db.select({ id: fosterRequestsTable.id })
      .from(fosterRequestsTable)
      .where(and(
        eq(fosterRequestsTable.requesterId, req.userId),
        eq(fosterRequestsTable.petId, petId),
      ))
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "duplicate_request", message: "You already have a request for this pet" });
      return;
    }

    const [request] = await db.insert(fosterRequestsTable).values({ petId, requesterId: req.userId, message }).returning();
    res.status(201).json(request);
  } catch (err) {
    req.log.error({ err }, "Error creating foster request");
    res.status(500).json({ error: "internal_error", message: "Failed to create foster request" });
  }
});

router.put("/foster-requests/:id/status", requireAuth, async (req, res): Promise<void> => {
  try {
    const paramsParsed = UpdateFosterRequestStatusParams.safeParse(req.params);
    if (!paramsParsed.success) {
      res.status(400).json({ error: "validation_error", message: "Invalid id", details: paramsParsed.error.issues });
      return;
    }

    const bodyParsed = UpdateFosterRequestStatusBody.safeParse(req.body);
    if (!bodyParsed.success) {
      res.status(400).json({ error: "validation_error", message: "Invalid request body", details: bodyParsed.error.issues });
      return;
    }

    const requestId = paramsParsed.data.id;
    const newStatus = bodyParsed.data.status;

    const [existingRequest] = await db.select({
      id: fosterRequestsTable.id,
      petId: fosterRequestsTable.petId,
      status: fosterRequestsTable.status,
      ownerId: petsTable.ownerId,
    })
      .from(fosterRequestsTable)
      .leftJoin(petsTable, eq(fosterRequestsTable.petId, petsTable.id))
      .where(eq(fosterRequestsTable.id, requestId));

    if (!existingRequest) {
      res.status(404).json({ error: "not_found", message: "Request not found" });
      return;
    }

    const isAdmin = req.userRole === "admin";
    const isPetOwner = existingRequest.ownerId === req.userId;

    if (!isAdmin && !isPetOwner) {
      res.status(403).json({ error: "forbidden", message: "Only the pet owner or an admin can update request status" });
      return;
    }

    const [updated] = await db.update(fosterRequestsTable)
      .set({ status: newStatus })
      .where(eq(fosterRequestsTable.id, requestId))
      .returning();

    if (newStatus === "approved" && existingRequest.petId) {
      await db.update(petsTable)
        .set({ status: "fostered" })
        .where(eq(petsTable.id, existingRequest.petId));
    }

    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Error updating foster request status");
    res.status(500).json({ error: "internal_error", message: "Failed to update status" });
  }
});

router.put("/foster-requests/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "validation_error", message: "Invalid id" });
      return;
    }

    const [existingRequest] = await db.select().from(fosterRequestsTable).where(eq(fosterRequestsTable.id, id));
    if (!existingRequest) {
      res.status(404).json({ error: "not_found", message: "Request not found" });
      return;
    }

    if (existingRequest.requesterId !== req.userId) {
      res.status(403).json({ error: "forbidden", message: "Only the requester can edit this request" });
      return;
    }

    if (existingRequest.status !== "pending") {
      res.status(400).json({ error: "invalid_status", message: "Can only edit pending requests" });
      return;
    }

    if (typeof req.body !== "object" || req.body === null) {
      res.status(400).json({ error: "validation_error", message: "Request body must be a JSON object" });
      return;
    }
    const { message } = req.body as { message?: string };
    if (message !== undefined && typeof message !== "string") {
      res.status(400).json({ error: "validation_error", message: "message must be a string" });
      return;
    }

    const [updated] = await db.update(fosterRequestsTable)
      .set({ message: message ?? existingRequest.message })
      .where(eq(fosterRequestsTable.id, id))
      .returning();

    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Error updating foster request");
    res.status(500).json({ error: "internal_error", message: "Failed to update foster request" });
  }
});

router.delete("/foster-requests/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "validation_error", message: "Invalid id" });
      return;
    }

    const [existingRequest] = await db.select().from(fosterRequestsTable).where(eq(fosterRequestsTable.id, id));
    if (!existingRequest) {
      res.status(404).json({ error: "not_found", message: "Request not found" });
      return;
    }

    if (existingRequest.requesterId !== req.userId) {
      res.status(403).json({ error: "forbidden", message: "Only the requester can delete this request" });
      return;
    }

    await db.delete(fosterRequestsTable).where(eq(fosterRequestsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Error deleting foster request");
    res.status(500).json({ error: "internal_error", message: "Failed to delete foster request" });
  }
});

export default router;

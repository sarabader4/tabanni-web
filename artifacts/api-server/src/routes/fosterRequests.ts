import { Router, type IRouter } from "express";
import { requireAuth, requireAdmin } from "../middlewares/requireAuth";
import { db, fosterRequestsTable, petsTable, usersTable } from "@workspace/db";
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

router.post("/foster-requests", requireAuth, async (req, res): Promise<void> => {
  try {
    const parsed = CreateFosterRequestBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "validation_error", message: "Invalid request body", details: parsed.error.issues });
      return;
    }

    const { petId, message } = parsed.data;
    const [request] = await db.insert(fosterRequestsTable).values({ petId, requesterId: req.userId, message }).returning();
    res.status(201).json(request);
  } catch (err) {
    req.log.error({ err }, "Error creating foster request");
    res.status(500).json({ error: "internal_error", message: "Failed to create foster request" });
  }
});

router.put("/foster-requests/:id/status", requireAdmin, async (req, res): Promise<void> => {
  try {
    const paramsParsed = UpdateFosterRequestStatusParams.safeParse(req.params);
    if (!paramsParsed.success) {
      return res.status(400).json({ error: "validation_error", message: "Invalid id", details: paramsParsed.error.issues });
    }

    const bodyParsed = UpdateFosterRequestStatusBody.safeParse(req.body);
    if (!bodyParsed.success) {
      return res.status(400).json({ error: "validation_error", message: "Invalid request body", details: bodyParsed.error.issues });
    }

    const [request] = await db.update(fosterRequestsTable)
      .set({ status: bodyParsed.data.status })
      .where(eq(fosterRequestsTable.id, paramsParsed.data.id))
      .returning();
    if (!request) return res.status(404).json({ error: "not_found", message: "Request not found" });
    res.json(request);
  } catch (err) {
    req.log.error({ err }, "Error updating foster request status");
    res.status(500).json({ error: "internal_error", message: "Failed to update status" });
  }
});

export default router;

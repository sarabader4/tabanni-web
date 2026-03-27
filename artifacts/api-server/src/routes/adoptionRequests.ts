import { Router, type IRouter } from "express";
import { requireAuth, requireAdmin } from "../middlewares/requireAuth";
import { db, adoptionRequestsTable, petsTable, usersTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import {
  ListAdoptionRequestsQueryParams,
  CreateAdoptionRequestBody,
  UpdateAdoptionRequestStatusBody,
  UpdateAdoptionRequestStatusParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const ADOPTION_STATUSES = ["pending", "approved", "rejected"] as const;

router.get("/adoption-requests", requireAuth, async (req, res) => {
  try {
    const queryParsed = ListAdoptionRequestsQueryParams.safeParse(req.query);
    if (!queryParsed.success) {
      return res.status(400).json({ error: "validation_error", message: "Invalid query parameters", details: queryParsed.error.issues });
    }

    const { status, petId, requesterId } = queryParsed.data;

    const conditions = [];
    const reqStatus = status ? ADOPTION_STATUSES.find(s => s === status) : undefined;
    if (reqStatus) conditions.push(eq(adoptionRequestsTable.status, reqStatus));
    if (petId !== undefined) conditions.push(eq(adoptionRequestsTable.petId, petId));

    // Non-admin users can only view their own requests; admins can see all (and filter by requesterId)
    if (req.userRole !== "admin") {
      conditions.push(eq(adoptionRequestsTable.requesterId, req.userId));
    } else if (requesterId !== undefined) {
      conditions.push(eq(adoptionRequestsTable.requesterId, requesterId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const requests = await db.select({
      id: adoptionRequestsTable.id,
      petId: adoptionRequestsTable.petId,
      requesterId: adoptionRequestsTable.requesterId,
      message: adoptionRequestsTable.message,
      status: adoptionRequestsTable.status,
      petName: petsTable.name,
      petImageUrl: petsTable.imageUrls,
      requesterName: usersTable.fullName,
      requesterCity: usersTable.city,
      createdAt: adoptionRequestsTable.createdAt,
    })
      .from(adoptionRequestsTable)
      .leftJoin(petsTable, eq(adoptionRequestsTable.petId, petsTable.id))
      .leftJoin(usersTable, eq(adoptionRequestsTable.requesterId, usersTable.id))
      .where(whereClause)
      .orderBy(desc(adoptionRequestsTable.createdAt));

    const mapped = requests.map(r => ({
      ...r,
      petImageUrl: Array.isArray(r.petImageUrl) ? r.petImageUrl[0] : null,
    }));

    res.json(mapped);
  } catch (err) {
    req.log.error({ err }, "Error listing adoption requests");
    res.status(500).json({ error: "internal_error", message: "Failed to list adoption requests" });
  }
});

router.post("/adoption-requests", requireAuth, async (req, res): Promise<void> => {
  try {
    const [currentUser] = await db.select({ isOnboardingCompleted: usersTable.isOnboardingCompleted }).from(usersTable).where(eq(usersTable.id, req.userId));
    if (!currentUser?.isOnboardingCompleted) {
      res.status(403).json({ error: "onboarding_required", message: "Please complete your adoption profile before submitting a request" });
      return;
    }

    const parsed = CreateAdoptionRequestBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "validation_error", message: "Invalid request body", details: parsed.error.issues });
      return;
    }

    const { petId, message } = parsed.data;
    const [request] = await db.insert(adoptionRequestsTable).values({ petId, requesterId: req.userId, message }).returning();
    res.status(201).json(request);
  } catch (err) {
    req.log.error({ err }, "Error creating adoption request");
    res.status(500).json({ error: "internal_error", message: "Failed to create adoption request" });
  }
});

router.put("/adoption-requests/:id/status", requireAdmin, async (req, res): Promise<void> => {
  try {
    const paramsParsed = UpdateAdoptionRequestStatusParams.safeParse(req.params);
    if (!paramsParsed.success) {
      return res.status(400).json({ error: "validation_error", message: "Invalid id", details: paramsParsed.error.issues });
    }

    const bodyParsed = UpdateAdoptionRequestStatusBody.safeParse(req.body);
    if (!bodyParsed.success) {
      return res.status(400).json({ error: "validation_error", message: "Invalid request body", details: bodyParsed.error.issues });
    }

    const [request] = await db.update(adoptionRequestsTable)
      .set({ status: bodyParsed.data.status })
      .where(eq(adoptionRequestsTable.id, paramsParsed.data.id))
      .returning();
    if (!request) return res.status(404).json({ error: "not_found", message: "Request not found" });
    res.json(request);
  } catch (err) {
    req.log.error({ err }, "Error updating adoption request status");
    res.status(500).json({ error: "internal_error", message: "Failed to update status" });
  }
});

export default router;

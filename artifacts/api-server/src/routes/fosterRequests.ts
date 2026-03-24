import { Router, type IRouter } from "express";
import { db, fosterRequestsTable, petsTable, usersTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { CreateFosterRequestBody, UpdateFosterRequestStatusBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/foster-requests", async (req, res) => {
  try {
    const { status, petId, requesterId } = req.query as Record<string, string>;

    const conditions = [];
    if (status) conditions.push(eq(fosterRequestsTable.status, status as any));
    if (petId) {
      const parsedPetId = parseInt(petId);
      if (!isNaN(parsedPetId)) conditions.push(eq(fosterRequestsTable.petId, parsedPetId));
    }
    if (requesterId) {
      const parsedRequesterId = parseInt(requesterId);
      if (!isNaN(parsedRequesterId)) conditions.push(eq(fosterRequestsTable.requesterId, parsedRequesterId));
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

router.post("/foster-requests", async (req, res) => {
  try {
    const parsed = CreateFosterRequestBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "validation_error", message: "Invalid request body", details: parsed.error.issues });
    }

    const { petId, requesterId, message } = parsed.data;
    const [request] = await db.insert(fosterRequestsTable).values({ petId, requesterId, message }).returning();
    res.status(201).json(request);
  } catch (err) {
    req.log.error({ err }, "Error creating foster request");
    res.status(500).json({ error: "internal_error", message: "Failed to create foster request" });
  }
});

router.put("/foster-requests/:id/status", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "validation_error", message: "Invalid id" });

    const parsed = UpdateFosterRequestStatusBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "validation_error", message: "Invalid request body", details: parsed.error.issues });
    }

    const [request] = await db.update(fosterRequestsTable)
      .set({ status: parsed.data.status })
      .where(eq(fosterRequestsTable.id, id))
      .returning();
    if (!request) return res.status(404).json({ error: "not_found", message: "Request not found" });
    res.json(request);
  } catch (err) {
    req.log.error({ err }, "Error updating foster request status");
    res.status(500).json({ error: "internal_error", message: "Failed to update status" });
  }
});

export default router;

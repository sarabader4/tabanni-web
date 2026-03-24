import { Router, type IRouter } from "express";
import { db, adoptionRequestsTable, petsTable, usersTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { CreateAdoptionRequestBody, UpdateAdoptionRequestStatusBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/adoption-requests", async (req, res) => {
  try {
    const { status, petId, requesterId } = req.query as Record<string, string>;

    const conditions = [];
    if (status) conditions.push(eq(adoptionRequestsTable.status, status as any));
    if (petId) {
      const parsedPetId = parseInt(petId);
      if (!isNaN(parsedPetId)) conditions.push(eq(adoptionRequestsTable.petId, parsedPetId));
    }
    if (requesterId) {
      const parsedRequesterId = parseInt(requesterId);
      if (!isNaN(parsedRequesterId)) conditions.push(eq(adoptionRequestsTable.requesterId, parsedRequesterId));
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

router.post("/adoption-requests", async (req, res) => {
  try {
    const parsed = CreateAdoptionRequestBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "validation_error", message: "Invalid request body", details: parsed.error.issues });
    }

    const { petId, requesterId, message } = parsed.data;
    const [request] = await db.insert(adoptionRequestsTable).values({ petId, requesterId, message }).returning();
    res.status(201).json(request);
  } catch (err) {
    req.log.error({ err }, "Error creating adoption request");
    res.status(500).json({ error: "internal_error", message: "Failed to create adoption request" });
  }
});

router.put("/adoption-requests/:id/status", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "validation_error", message: "Invalid id" });

    const parsed = UpdateAdoptionRequestStatusBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "validation_error", message: "Invalid request body", details: parsed.error.issues });
    }

    const [request] = await db.update(adoptionRequestsTable)
      .set({ status: parsed.data.status })
      .where(eq(adoptionRequestsTable.id, id))
      .returning();
    if (!request) return res.status(404).json({ error: "not_found", message: "Request not found" });
    res.json(request);
  } catch (err) {
    req.log.error({ err }, "Error updating adoption request status");
    res.status(500).json({ error: "internal_error", message: "Failed to update status" });
  }
});

export default router;

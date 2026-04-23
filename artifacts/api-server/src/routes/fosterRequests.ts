import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { db, fosterRequestsTable, petsTable, usersTable, userProfilesTable } from "@workspace/db";
import { eq, and, desc, ne, inArray } from "drizzle-orm";
import {
  ListFosterRequestsQueryParams,
  CreateFosterRequestBody,
  UpdateFosterRequestStatusBody,
  UpdateFosterRequestStatusParams,
} from "@workspace/api-zod";
import { createNotification, createAdminNotification } from "../lib/notifications";
import { cache, CACHE_PREFIX } from "../lib/cache";

const router: IRouter = Router();

const FOSTER_STATUSES = ["pending", "approved", "rejected", "in_progress", "completed"] as const;

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
      .where(and(eq(petsTable.ownerId, req.userId), eq(fosterRequestsTable.status, "pending")))
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

    const [pet] = await db.select({ ownerId: petsTable.ownerId, name: petsTable.name, status: petsTable.status })
      .from(petsTable).where(eq(petsTable.id, petId));

    if (!pet) {
      res.status(404).json({ error: "not_found", message: "Pet not found" });
      return;
    }

    if (pet.status === "adopted" || pet.status === "fostered") {
      res.status(409).json({ error: "pet_not_available", message: "This pet has already been adopted or fostered and is no longer available." });
      return;
    }

    if (pet?.ownerId === req.userId) {
      res.status(403).json({ error: "own_pet", message: "You cannot submit a request for your own pet" });
      return;
    }

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

    if (pet?.ownerId && pet.ownerId !== req.userId) {
      try {
        const [requester] = await db.select({ fullName: usersTable.fullName }).from(usersTable).where(eq(usersTable.id, req.userId));
        await createNotification(
          pet.ownerId,
          "new_foster_request",
          "New Foster Request",
          `${requester?.fullName ?? "Someone"} has submitted a foster request for your pet "${pet.name}".`,
          petId,
        );
        createAdminNotification(
          "new_foster_request",
          "New Foster Request",
          `${requester?.fullName ?? "Someone"} submitted a foster request for "${pet.name}".`,
          req.userId,
          { petId },
        ).catch(() => {});
      } catch (err) {
        req.log.error({ err }, "Error creating new foster request notification");
      }
    }

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
      requesterId: fosterRequestsTable.requesterId,
      status: fosterRequestsTable.status,
      ownerId: petsTable.ownerId,
      petName: petsTable.name,
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

    let updated: typeof fosterRequestsTable.$inferSelect;
    let autoRejectedRequesterIds: number[] = [];

    if (newStatus === "approved") {
      if (!existingRequest.petId) {
        res.status(400).json({ error: "invalid_request", message: "Request has no associated pet" });
        return;
      }

      const result = await db.transaction(async (tx) => {
        const [acceptedRequest] = await tx.update(fosterRequestsTable)
          .set({ status: "approved" })
          .where(and(eq(fosterRequestsTable.id, requestId), eq(fosterRequestsTable.status, "pending")))
          .returning();

        if (!acceptedRequest) {
          throw Object.assign(new Error("request_not_pending"), { code: "request_not_pending" });
        }

        const updatedPets = await tx.update(petsTable)
          .set({ status: "fostered" })
          .where(and(eq(petsTable.id, existingRequest.petId!), eq(petsTable.status, "available")))
          .returning({ id: petsTable.id });

        if (updatedPets.length === 0) {
          throw Object.assign(new Error("pet_not_available"), { code: "pet_not_available" });
        }

        const otherPending = await tx.select({ id: fosterRequestsTable.id, requesterId: fosterRequestsTable.requesterId })
          .from(fosterRequestsTable)
          .where(and(
            eq(fosterRequestsTable.petId, existingRequest.petId!),
            ne(fosterRequestsTable.id, requestId),
            eq(fosterRequestsTable.status, "pending"),
          ));

        if (otherPending.length > 0) {
          await tx.update(fosterRequestsTable)
            .set({ status: "rejected" })
            .where(inArray(fosterRequestsTable.id, otherPending.map(r => r.id)));
        }

        return { acceptedRequest, autoRejectedRequesterIds: otherPending.map(r => r.requesterId).filter((id): id is number => id !== null) };
      });

      updated = result.acceptedRequest;
      autoRejectedRequesterIds = result.autoRejectedRequesterIds;
    } else {
      const shouldResetPet =
        existingRequest.status === "approved" &&
        existingRequest.petId !== null &&
        (newStatus === "completed" || newStatus === "rejected");

      if (shouldResetPet) {
        const result = await db.transaction(async (tx) => {
          const [resolvedRequest] = await tx.update(fosterRequestsTable)
            .set({ status: newStatus })
            .where(eq(fosterRequestsTable.id, requestId))
            .returning();

          await tx.update(petsTable)
            .set({ status: "available" })
            .where(and(eq(petsTable.id, existingRequest.petId!), eq(petsTable.status, "fostered")));

          return resolvedRequest;
        });
        updated = result;
      } else {
        const [rejectedRequest] = await db.update(fosterRequestsTable)
          .set({ status: newStatus })
          .where(eq(fosterRequestsTable.id, requestId))
          .returning();
        updated = rejectedRequest;
      }
    }

    await Promise.all([
      cache.invalidatePrefix(CACHE_PREFIX.PETS_LIST),
      cache.invalidatePrefix(CACHE_PREFIX.PET_DETAIL),
      cache.invalidatePrefix(CACHE_PREFIX.PETS_FEATURED),
    ]);

    if (existingRequest.requesterId) {
      try {
        const notifType = newStatus === "approved" ? "foster_accepted" : newStatus === "completed" ? "foster_completed" : "foster_rejected";
        const notifTitle = newStatus === "approved" ? "Foster Request Approved" : newStatus === "completed" ? "Foster Completed" : "Foster Request Rejected";
        const notifMessage = newStatus === "approved"
          ? `Congratulations! Your foster request for "${existingRequest.petName}" has been approved. Please contact the owner via WhatsApp to complete the fostering process.`
          : newStatus === "completed"
          ? `Your foster of "${existingRequest.petName}" has been marked as completed. Thank you for providing this pet with a loving temporary home!`
          : `Unfortunately, your foster request for "${existingRequest.petName}" has been rejected.`;

        let metadata: Record<string, unknown> | null = null;
        if (newStatus === "approved" && existingRequest.ownerId) {
          const [owner] = await db.select({ phone: usersTable.phone }).from(usersTable).where(eq(usersTable.id, existingRequest.ownerId));
          if (owner?.phone) {
            const cleanPhone = owner.phone.replace(/\D/g, "");
            const prefilledText = encodeURIComponent(`Hi, I've been approved to foster ${existingRequest.petName ?? "your pet"}. I'd like to coordinate with you.`);
            metadata = { whatsappLink: `https://wa.me/${cleanPhone}?text=${prefilledText}` };
          } else {
            metadata = { noPhone: true };
          }
        }

        await createNotification(
          existingRequest.requesterId,
          notifType,
          notifTitle,
          notifMessage,
          existingRequest.petId ?? undefined,
          metadata,
        );
      } catch (err) {
        req.log.error({ err }, "Error creating foster status notification");
      }
    }

    if (newStatus === "approved" && existingRequest.ownerId && existingRequest.requesterId) {
      try {
        const [requester] = await db
          .select({ phone: usersTable.phone, fullName: usersTable.fullName })
          .from(usersTable)
          .where(eq(usersTable.id, existingRequest.requesterId));

        let ownerMetadata: Record<string, unknown> | null = null;
        if (requester?.phone) {
          const cleanPhone = requester.phone.replace(/\D/g, "");
          const prefilledText = encodeURIComponent(
            `Hi, I've been approved to foster ${existingRequest.petName ?? "your pet"}. I'd like to coordinate the arrangement with you.`
          );
          ownerMetadata = { whatsappLink: `https://wa.me/${cleanPhone}?text=${prefilledText}` };
        } else {
          ownerMetadata = { noPhone: true };
        }

        await createNotification(
          existingRequest.ownerId,
          "foster_accepted",
          "Foster Approved — Contact the Fosterer",
          `The foster request for "${existingRequest.petName}" has been approved. Please contact the fosterer via WhatsApp to arrange the handover.`,
          existingRequest.petId ?? undefined,
          ownerMetadata,
        );
      } catch (err) {
        req.log.error({ err }, "Error creating owner foster notification");
      }
    }

    for (const rejectedRequesterId of autoRejectedRequesterIds) {
      try {
        await createNotification(
          rejectedRequesterId,
          "foster_rejected",
          "Foster Request Rejected",
          `Unfortunately, your foster request for "${existingRequest.petName}" has been rejected because another foster was selected.`,
          existingRequest.petId ?? undefined,
        );
      } catch (err) {
        req.log.error({ err }, "Error sending auto-rejection notification");
      }
    }

    const fosterActionLabel = newStatus === "approved" ? "approved" : newStatus === "rejected" ? "rejected" : newStatus;
    createAdminNotification(
      newStatus === "approved" ? "foster_approved" : "foster_status_changed",
      `Foster Request ${fosterActionLabel.charAt(0).toUpperCase() + fosterActionLabel.slice(1)}`,
      `Foster request for "${existingRequest.petName}" has been ${fosterActionLabel}.`,
      existingRequest.requesterId ?? null,
      { requestId: requestId, petId: existingRequest.petId },
    ).catch(() => {});

    res.json(updated);
  } catch (err: unknown) {
    const code = err instanceof Error ? (err as Error & { code?: string }).code : undefined;
    if (code === "pet_not_available") {
      res.status(409).json({ error: "pet_not_available", message: "This pet has already been adopted or fostered and is no longer available." });
      return;
    }
    if (code === "request_not_pending") {
      res.status(409).json({ error: "request_not_pending", message: "This request has already been processed and cannot be accepted again." });
      return;
    }
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

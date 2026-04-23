import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { db, adoptionRequestsTable, petsTable, usersTable, userProfilesTable } from "@workspace/db";
import { eq, and, desc, ne, inArray } from "drizzle-orm";
import {
  ListAdoptionRequestsQueryParams,
  CreateAdoptionRequestBody,
  UpdateAdoptionRequestStatusBody,
  UpdateAdoptionRequestStatusParams,
} from "@workspace/api-zod";
import { createNotification, createAdminNotification } from "../lib/notifications";
import { cache, CACHE_PREFIX } from "../lib/cache";

const router: IRouter = Router();

const ADOPTION_STATUSES = ["pending", "approved", "rejected", "in_progress", "completed"] as const;

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

router.get("/adoption-requests/incoming", requireAuth, async (req, res): Promise<void> => {
  try {
    const myPets = await db.select({ id: petsTable.id }).from(petsTable).where(eq(petsTable.ownerId, req.userId));
    const myPetIds = myPets.map(p => p.id);

    if (myPetIds.length === 0) {
      res.json([]);
      return;
    }

    const rows = await db.select({
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
      requesterProfile: userProfilesTable,
    })
      .from(adoptionRequestsTable)
      .leftJoin(petsTable, eq(adoptionRequestsTable.petId, petsTable.id))
      .leftJoin(usersTable, eq(adoptionRequestsTable.requesterId, usersTable.id))
      .leftJoin(userProfilesTable, eq(adoptionRequestsTable.requesterId, userProfilesTable.userId))
      .where(and(eq(petsTable.ownerId, req.userId), eq(adoptionRequestsTable.status, "pending")))
      .orderBy(desc(adoptionRequestsTable.createdAt));

    const result = rows.map(r => ({
      ...r,
      petImageUrl: Array.isArray(r.petImageUrl) ? r.petImageUrl[0] : null,
      requesterProfile: r.requesterProfile ?? null,
    }));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error listing incoming adoption requests");
    res.status(500).json({ error: "internal_error", message: "Failed to list incoming adoption requests" });
  }
});

router.get("/adoption-requests/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "validation_error", message: "Invalid id" });
      return;
    }

    const [request] = await db.select({
      id: adoptionRequestsTable.id,
      petId: adoptionRequestsTable.petId,
      requesterId: adoptionRequestsTable.requesterId,
      message: adoptionRequestsTable.message,
      status: adoptionRequestsTable.status,
      petName: petsTable.name,
      petImageUrl: petsTable.imageUrls,
      petOwnerId: petsTable.ownerId,
      requesterName: usersTable.fullName,
      requesterCity: usersTable.city,
      createdAt: adoptionRequestsTable.createdAt,
    })
      .from(adoptionRequestsTable)
      .leftJoin(petsTable, eq(adoptionRequestsTable.petId, petsTable.id))
      .leftJoin(usersTable, eq(adoptionRequestsTable.requesterId, usersTable.id))
      .where(eq(adoptionRequestsTable.id, id));

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
    req.log.error({ err }, "Error fetching adoption request");
    res.status(500).json({ error: "internal_error", message: "Failed to fetch adoption request" });
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

    const existing = await db.select({ id: adoptionRequestsTable.id })
      .from(adoptionRequestsTable)
      .where(and(
        eq(adoptionRequestsTable.requesterId, req.userId),
        eq(adoptionRequestsTable.petId, petId),
      ))
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "duplicate_request", message: "You already have a request for this pet" });
      return;
    }

    const [request] = await db.insert(adoptionRequestsTable).values({ petId, requesterId: req.userId, message }).returning();

    if (pet?.ownerId && pet.ownerId !== req.userId) {
      try {
        const [requester] = await db.select({ fullName: usersTable.fullName }).from(usersTable).where(eq(usersTable.id, req.userId));
        await createNotification(
          pet.ownerId,
          "new_adoption_request",
          "New Adoption Request",
          `${requester?.fullName ?? "Someone"} has submitted an adoption request for your pet "${pet.name}".`,
          petId,
        );
        createAdminNotification(
          "new_adoption_request",
          "New Adoption Request",
          `${requester?.fullName ?? "Someone"} submitted an adoption request for "${pet.name}".`,
          req.userId,
          { petId },
        ).catch(() => {});
      } catch (err) {
        req.log.error({ err }, "Error creating new adoption request notification");
      }
    }

    res.status(201).json(request);
  } catch (err) {
    req.log.error({ err }, "Error creating adoption request");
    res.status(500).json({ error: "internal_error", message: "Failed to create adoption request" });
  }
});

router.put("/adoption-requests/:id/status", requireAuth, async (req, res): Promise<void> => {
  try {
    const paramsParsed = UpdateAdoptionRequestStatusParams.safeParse(req.params);
    if (!paramsParsed.success) {
      res.status(400).json({ error: "validation_error", message: "Invalid id", details: paramsParsed.error.issues });
      return;
    }

    const bodyParsed = UpdateAdoptionRequestStatusBody.safeParse(req.body);
    if (!bodyParsed.success) {
      res.status(400).json({ error: "validation_error", message: "Invalid request body", details: bodyParsed.error.issues });
      return;
    }

    const requestId = paramsParsed.data.id;
    const newStatus = bodyParsed.data.status;

    const [existingRequest] = await db.select({
      id: adoptionRequestsTable.id,
      petId: adoptionRequestsTable.petId,
      requesterId: adoptionRequestsTable.requesterId,
      status: adoptionRequestsTable.status,
      ownerId: petsTable.ownerId,
      petName: petsTable.name,
    })
      .from(adoptionRequestsTable)
      .leftJoin(petsTable, eq(adoptionRequestsTable.petId, petsTable.id))
      .where(eq(adoptionRequestsTable.id, requestId));

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

    let updated: typeof adoptionRequestsTable.$inferSelect;
    let autoRejectedRequesterIds: number[] = [];

    if (newStatus === "approved") {
      if (!existingRequest.petId) {
        res.status(400).json({ error: "invalid_request", message: "Request has no associated pet" });
        return;
      }

      const result = await db.transaction(async (tx) => {
        const [acceptedRequest] = await tx.update(adoptionRequestsTable)
          .set({ status: "approved" })
          .where(and(eq(adoptionRequestsTable.id, requestId), eq(adoptionRequestsTable.status, "pending")))
          .returning();

        if (!acceptedRequest) {
          throw Object.assign(new Error("request_not_pending"), { code: "request_not_pending" });
        }

        const updatedPets = await tx.update(petsTable)
          .set({ status: "adopted" })
          .where(and(eq(petsTable.id, existingRequest.petId!), eq(petsTable.status, "available")))
          .returning({ id: petsTable.id });

        if (updatedPets.length === 0) {
          throw Object.assign(new Error("pet_not_available"), { code: "pet_not_available" });
        }

        const otherPending = await tx.select({ id: adoptionRequestsTable.id, requesterId: adoptionRequestsTable.requesterId })
          .from(adoptionRequestsTable)
          .where(and(
            eq(adoptionRequestsTable.petId, existingRequest.petId!),
            ne(adoptionRequestsTable.id, requestId),
            eq(adoptionRequestsTable.status, "pending"),
          ));

        if (otherPending.length > 0) {
          await tx.update(adoptionRequestsTable)
            .set({ status: "rejected" })
            .where(inArray(adoptionRequestsTable.id, otherPending.map(r => r.id)));
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
          const [resolvedRequest] = await tx.update(adoptionRequestsTable)
            .set({ status: newStatus })
            .where(eq(adoptionRequestsTable.id, requestId))
            .returning();

          await tx.update(petsTable)
            .set({ status: "available" })
            .where(and(eq(petsTable.id, existingRequest.petId!), eq(petsTable.status, "adopted")));

          return resolvedRequest;
        });
        updated = result;
      } else {
        const [rejectedRequest] = await db.update(adoptionRequestsTable)
          .set({ status: newStatus })
          .where(eq(adoptionRequestsTable.id, requestId))
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
        const notifType = newStatus === "approved" ? "adoption_accepted" : newStatus === "completed" ? "adoption_completed" : "adoption_rejected";
        const notifTitle = newStatus === "approved" ? "Adoption Request Approved" : newStatus === "completed" ? "Adoption Completed" : "Adoption Request Rejected";
        const notifMessage = newStatus === "approved"
          ? `Congratulations! Your adoption request for "${existingRequest.petName}" has been approved. Please contact the owner via WhatsApp to complete the adoption process.`
          : newStatus === "completed"
          ? `Your adoption of "${existingRequest.petName}" has been marked as completed. Thank you for giving this pet a loving home!`
          : `Unfortunately, your adoption request for "${existingRequest.petName}" has been rejected.`;

        let metadata: Record<string, unknown> | null = null;
        if (newStatus === "approved" && existingRequest.ownerId) {
          const [owner] = await db.select({ phone: usersTable.phone }).from(usersTable).where(eq(usersTable.id, existingRequest.ownerId));
          if (owner?.phone) {
            const cleanPhone = owner.phone.replace(/\D/g, "");
            const prefilledText = encodeURIComponent(`Hi, I've been approved to adopt ${existingRequest.petName ?? "your pet"}. I'd like to coordinate with you.`);
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
        req.log.error({ err }, "Error creating adoption status notification");
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
            `Hi, I've been approved to adopt ${existingRequest.petName ?? "your pet"}. I'd like to coordinate the handover with you.`
          );
          ownerMetadata = { whatsappLink: `https://wa.me/${cleanPhone}?text=${prefilledText}` };
        } else {
          ownerMetadata = { noPhone: true };
        }

        await createNotification(
          existingRequest.ownerId,
          "adoption_accepted",
          "Adoption Approved — Contact the Adopter",
          `The adoption request for "${existingRequest.petName}" has been approved. Please contact the adopter via WhatsApp to arrange the handover.`,
          existingRequest.petId ?? undefined,
          ownerMetadata,
        );
      } catch (err) {
        req.log.error({ err }, "Error creating owner adoption notification");
      }
    }

    for (const rejectedRequesterId of autoRejectedRequesterIds) {
      try {
        await createNotification(
          rejectedRequesterId,
          "adoption_rejected",
          "Adoption Request Rejected",
          `Unfortunately, your adoption request for "${existingRequest.petName}" has been rejected because another adopter was selected.`,
          existingRequest.petId ?? undefined,
        );
      } catch (err) {
        req.log.error({ err }, "Error sending auto-rejection notification");
      }
    }

    const actionLabel = newStatus === "approved" ? "approved" : newStatus === "rejected" ? "rejected" : newStatus;
    createAdminNotification(
      newStatus === "approved" ? "adoption_approved" : "adoption_status_changed",
      `Adoption Request ${actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1)}`,
      `Adoption request for "${existingRequest.petName}" has been ${actionLabel}.`,
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
    req.log.error({ err }, "Error updating adoption request status");
    res.status(500).json({ error: "internal_error", message: "Failed to update status" });
  }
});

router.put("/adoption-requests/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "validation_error", message: "Invalid id" });
      return;
    }

    const [existingRequest] = await db.select().from(adoptionRequestsTable).where(eq(adoptionRequestsTable.id, id));
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

    const [updated] = await db.update(adoptionRequestsTable)
      .set({ message: message ?? existingRequest.message })
      .where(eq(adoptionRequestsTable.id, id))
      .returning();

    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Error updating adoption request");
    res.status(500).json({ error: "internal_error", message: "Failed to update adoption request" });
  }
});

router.delete("/adoption-requests/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "validation_error", message: "Invalid id" });
      return;
    }

    const [existingRequest] = await db.select().from(adoptionRequestsTable).where(eq(adoptionRequestsTable.id, id));
    if (!existingRequest) {
      res.status(404).json({ error: "not_found", message: "Request not found" });
      return;
    }

    if (existingRequest.requesterId !== req.userId) {
      res.status(403).json({ error: "forbidden", message: "Only the requester can delete this request" });
      return;
    }

    await db.delete(adoptionRequestsTable).where(eq(adoptionRequestsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Error deleting adoption request");
    res.status(500).json({ error: "internal_error", message: "Failed to delete adoption request" });
  }
});

export default router;

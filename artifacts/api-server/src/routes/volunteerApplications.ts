import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { db, volunteerApplicationsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { CreateVolunteerApplicationBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/volunteer-applications/me", requireAuth, async (req, res): Promise<void> => {
  try {
    const [application] = await db
      .select()
      .from(volunteerApplicationsTable)
      .where(eq(volunteerApplicationsTable.userId, req.userId))
      .orderBy(desc(volunteerApplicationsTable.createdAt))
      .limit(1);

    if (!application) {
      res.status(404).json({ error: "not_found", message: "No application found" });
      return;
    }

    res.json(application);
  } catch (err) {
    req.log.error({ err }, "Error fetching volunteer application");
    res.status(500).json({ error: "internal_error", message: "Failed to fetch application" });
  }
});

router.post("/volunteer-applications", requireAuth, async (req, res): Promise<void> => {
  try {
    const parsed = CreateVolunteerApplicationBody.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Validation error";
      res.status(400).json({ error: "validation_error", message });
      return;
    }

    const existing = await db
      .select({ id: volunteerApplicationsTable.id, status: volunteerApplicationsTable.status })
      .from(volunteerApplicationsTable)
      .where(eq(volunteerApplicationsTable.userId, req.userId))
      .orderBy(desc(volunteerApplicationsTable.createdAt))
      .limit(1);

    if (existing.length > 0 && existing[0].status === "pending") {
      res.status(409).json({ error: "duplicate_application", message: "You already have a pending application" });
      return;
    }

const [application] = await db
      .insert(volunteerApplicationsTable)
      .values({ ...parsed.data, userId: req.userId })
      .returning();

 
    try {
      const { createAdminNotification } = await import("../lib/notifications");
      await createAdminNotification(
        "new_volunteer_application",
        "New Volunteer Application",
        `${parsed.data.name} submitted a volunteer application (${parsed.data.applicationType}).`,
        req.userId,
        { applicationId: application.id },
      );
    } catch (notifErr) {
      req.log.error({ notifErr }, "Failed to create admin notification for volunteer");
    }

    res.status(201).json(application);
  } catch (err) {
    req.log.error({ err }, "Error creating volunteer application");
    res.status(500).json({ error: "internal_error", message: "Failed to create application" });
  }
});

router.patch("/volunteer-applications/me", requireAuth, async (req, res): Promise<void> => {
  try {
    const [existing] = await db
      .select()
      .from(volunteerApplicationsTable)
      .where(eq(volunteerApplicationsTable.userId, req.userId))
      .orderBy(desc(volunteerApplicationsTable.createdAt))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "not_found", message: "No application found" });
      return;
    }

    if (existing.status !== "rejected") {
      res.status(400).json({ error: "invalid_status", message: "Only rejected applications can be resubmitted" });
      return;
    }

    const parsed = CreateVolunteerApplicationBody.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Validation error";
      res.status(400).json({ error: "validation_error", message });
      return;
    }

    const [updated] = await db
      .update(volunteerApplicationsTable)
      .set({ ...parsed.data, status: "pending", updatedAt: new Date() })
      .where(eq(volunteerApplicationsTable.id, existing.id))
      .returning();

    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Error updating volunteer application");
    res.status(500).json({ error: "internal_error", message: "Failed to update application" });
  }
});

export default router;

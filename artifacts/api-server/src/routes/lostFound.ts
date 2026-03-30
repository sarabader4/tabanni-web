import { Router, type IRouter } from "express";
import { db, lostFoundReportsTable, usersTable } from "@workspace/db";
import { eq, and, ilike, desc, sql, inArray } from "drizzle-orm";
import { ListLostFoundReportsQueryParams, CreateLostFoundReportBody, GetLostFoundReportParams } from "@workspace/api-zod";
import { z } from "zod/v4";

const router: IRouter = Router();

router.get("/lost-found", async (req, res) => {
  try {
    const queryParsed = ListLostFoundReportsQueryParams.safeParse(req.query);
    if (!queryParsed.success) {
      return res.status(400).json({ error: "validation_error", message: "Invalid query parameters", details: queryParsed.error.issues });
    }

    const { reportType, type, city, gender, size, breed, page = 1, limit = 16, reporterId } = queryParsed.data;
    const pageNum = page;
    const limitNum = limit;
    const offset = (pageNum - 1) * limitNum;

    const REPORT_TYPES = ["lost", "found"] as const;
    const conditions = [];

    const validReportType = reportType ? REPORT_TYPES.find(t => t === reportType) : undefined;
    if (validReportType) conditions.push(eq(lostFoundReportsTable.reportType, validReportType));
    if (type) conditions.push(eq(lostFoundReportsTable.type, type));
    if (city) conditions.push(ilike(lostFoundReportsTable.city, `%${city}%`));
    if (gender) conditions.push(eq(lostFoundReportsTable.gender, gender));
    if (size) conditions.push(eq(lostFoundReportsTable.size, size));
    if (breed) conditions.push(ilike(lostFoundReportsTable.breed, `%${breed}%`));

    if (reporterId !== undefined) {
      conditions.push(eq(lostFoundReportsTable.reporterId, reporterId));
    } else {
      conditions.push(eq(lostFoundReportsTable.status, "approved"));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [reports, countResult] = await Promise.all([
      db.select().from(lostFoundReportsTable)
        .where(whereClause)
        .orderBy(desc(lostFoundReportsTable.createdAt))
        .limit(limitNum)
        .offset(offset),
      db.select({ count: sql<number>`count(*)::int` }).from(lostFoundReportsTable).where(whereClause),
    ]);

    const total = countResult[0]?.count ?? 0;

    res.json({
      reports,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    req.log.error({ err }, "Error listing lost/found reports");
    res.status(500).json({ error: "internal_error", message: "Failed to list reports" });
  }
});

router.post("/lost-found", async (req, res) => {
  try {
    const parsed = CreateLostFoundReportBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "validation_error", message: "Invalid request body", details: parsed.error.issues });
    }
    const [report] = await db.insert(lostFoundReportsTable).values({
      ...parsed.data,
      imageUrls: parsed.data.imageUrls ?? [],
      status: "pending",
    }).returning();
    res.status(201).json(report);
  } catch (err) {
    req.log.error({ err }, "Error creating lost/found report");
    res.status(500).json({ error: "internal_error", message: "Failed to create report" });
  }
});

router.get("/lost-found/:id", async (req, res) => {
  try {
    const paramsParsed = GetLostFoundReportParams.safeParse(req.params);
    if (!paramsParsed.success) {
      return res.status(400).json({ error: "validation_error", message: "Invalid id", details: paramsParsed.error.issues });
    }
    const id = paramsParsed.data.id;
    const [report] = await db.select().from(lostFoundReportsTable)
      .where(eq(lostFoundReportsTable.id, id));
    if (!report) return res.status(404).json({ error: "not_found", message: "Report not found" });
    res.json(report);
  } catch (err) {
    req.log.error({ err }, "Error getting lost/found report");
    res.status(500).json({ error: "internal_error", message: "Failed to get report" });
  }
});

router.delete("/lost-found/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "validation_error", message: "Invalid id" });

    const userId = (req.session as any)?.userId;
    const [report] = await db.select().from(lostFoundReportsTable).where(eq(lostFoundReportsTable.id, id));
    if (!report) return res.status(404).json({ error: "not_found", message: "Report not found" });

    const isAdmin = (req.session as any)?.role === "admin";
    if (!isAdmin && report.reporterId !== userId) {
      return res.status(403).json({ error: "forbidden", message: "Not authorized" });
    }

    await db.delete(lostFoundReportsTable).where(eq(lostFoundReportsTable.id, id));
    res.json({ success: true, message: "Report deleted" });
  } catch (err) {
    req.log.error({ err }, "Error deleting lost/found report");
    res.status(500).json({ error: "internal_error", message: "Failed to delete report" });
  }
});

router.post("/lost-found/:id/resolve", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "validation_error", message: "Invalid id" });

    const userId = (req.session as any)?.userId;
    const [report] = await db.select().from(lostFoundReportsTable).where(eq(lostFoundReportsTable.id, id));
    if (!report) return res.status(404).json({ error: "not_found", message: "Report not found" });

    const isAdmin = (req.session as any)?.role === "admin";
    if (!isAdmin && report.reporterId !== userId) {
      return res.status(403).json({ error: "forbidden", message: "Not authorized" });
    }

    const [updated] = await db.update(lostFoundReportsTable)
      .set({ status: "resolved" })
      .where(eq(lostFoundReportsTable.id, id))
      .returning();
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Error resolving lost/found report");
    res.status(500).json({ error: "internal_error", message: "Failed to resolve report" });
  }
});

router.get("/admin/lost-found", async (req, res) => {
  try {
    const statusFilter = req.query.status as string | undefined;
    const conditions = [];

    if (statusFilter && ["pending", "approved", "rejected", "resolved"].includes(statusFilter)) {
      conditions.push(eq(lostFoundReportsTable.status, statusFilter as "pending" | "approved" | "rejected" | "resolved"));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const reports = await db.select().from(lostFoundReportsTable)
      .where(whereClause)
      .orderBy(desc(lostFoundReportsTable.createdAt));

    res.json({ reports, total: reports.length });
  } catch (err) {
    req.log.error({ err }, "Error listing admin lost/found reports");
    res.status(500).json({ error: "internal_error", message: "Failed to list reports" });
  }
});

router.put("/admin/lost-found/:id/approve", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "validation_error", message: "Invalid id" });

    const [updated] = await db.update(lostFoundReportsTable)
      .set({ status: "approved" })
      .where(eq(lostFoundReportsTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "not_found", message: "Report not found" });
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Error approving lost/found report");
    res.status(500).json({ error: "internal_error", message: "Failed to approve report" });
  }
});

router.put("/admin/lost-found/:id/reject", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "validation_error", message: "Invalid id" });

    const [updated] = await db.update(lostFoundReportsTable)
      .set({ status: "rejected" })
      .where(eq(lostFoundReportsTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "not_found", message: "Report not found" });
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Error rejecting lost/found report");
    res.status(500).json({ error: "internal_error", message: "Failed to reject report" });
  }
});

export default router;

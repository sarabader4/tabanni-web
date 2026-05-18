import { Router, type IRouter } from "express";
import { db, lostFoundReportsTable, usersTable } from "@workspace/db";
import { eq, and, ilike, or, gte, lte, desc, sql } from "drizzle-orm";
import { ListLostFoundReportsQueryParams, CreateLostFoundReportBody, GetLostFoundReportParams } from "@workspace/api-zod";
import { createNotification } from "../lib/notifications";
import { cache, CACHE_PREFIX, CACHE_TTL } from "../lib/cache";

const router: IRouter = Router();

function transformLostFoundImages(reportId: number, rawUrls: unknown, firstOnly = false): string[] {
  const urls = Array.isArray(rawUrls) ? (rawUrls as string[]) : [];
  const slice = firstOnly ? urls.slice(0, 1) : urls;
  return slice.map((url, idx) =>
    typeof url === "string" && url.startsWith("data:") ? `/api/lost-found/${reportId}/image/${idx}` : url
  );
}

router.get("/lost-found", async (req, res) => {
  try {
    const queryParsed = ListLostFoundReportsQueryParams.safeParse(req.query);
    if (!queryParsed.success) {
      return res.status(400).json({ error: "validation_error", message: "Invalid query parameters", details: queryParsed.error.issues });
    }

    const cacheKey = `${CACHE_PREFIX.LOST_FOUND_LIST}${JSON.stringify(queryParsed.data)}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      res.json(JSON.parse(cached));
      return;
    }

    const { reportType, type, city, gender, size, breed, search, month, minAge, maxAge, page = 1, limit = 16, reporterId } = queryParsed.data;
    const pageNum = page;
    const limitNum = limit;
    const offset = (pageNum - 1) * limitNum;

    const REPORT_TYPES = ["lost", "found"] as const;
    const conditions = [];

    const validReportType = reportType ? REPORT_TYPES.find(t => t === reportType) : undefined;
    if (validReportType) conditions.push(eq(lostFoundReportsTable.reportType, validReportType));
    if (type) conditions.push(ilike(lostFoundReportsTable.type, `%${type}%`));
    if (city) conditions.push(ilike(lostFoundReportsTable.city, `%${city}%`));
    if (gender) conditions.push(eq(lostFoundReportsTable.gender, gender));
    if (size) conditions.push(eq(lostFoundReportsTable.size, size));
    if (breed) conditions.push(ilike(lostFoundReportsTable.breed, `%${breed}%`));
    if (search) {
      conditions.push(or(
        ilike(lostFoundReportsTable.name, `%${search}%`),
        ilike(lostFoundReportsTable.type, `%${search}%`),
        ilike(lostFoundReportsTable.breed, `%${search}%`),
        ilike(lostFoundReportsTable.city, `%${search}%`),
      ));
    }
    if (minAge !== undefined) conditions.push(gte(lostFoundReportsTable.ageMonths, minAge));
    if (maxAge !== undefined) conditions.push(lte(lostFoundReportsTable.ageMonths, maxAge));
    if (month !== undefined) {
      const dateField = validReportType === "lost" ? lostFoundReportsTable.lostDate : lostFoundReportsTable.foundDate;
      conditions.push(sql`EXTRACT(MONTH FROM CAST(${dateField} AS DATE)) = ${month}`);
    }

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
    const transformedReports = reports.map(r => ({ ...r, imageUrls: transformLostFoundImages(r.id, r.imageUrls, true) }));
    const result = { reports: transformedReports, total, page: pageNum, totalPages: Math.ceil(total / limitNum) };

    const ttl = reporterId ? 30_000 : CACHE_TTL.LISTING;
    await cache.set(cacheKey, JSON.stringify(result), ttl);

    res.json(result);
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

router.get("/lost-found/:id/image/:idx", async (req, res) => {
  try {
    const reportId = parseInt(req.params.id, 10);
    const idx = parseInt(req.params.idx, 10);
    if (isNaN(reportId) || isNaN(idx) || idx < 0) return res.status(400).end();

    const [report] = await db
      .select({ imageUrls: lostFoundReportsTable.imageUrls })
      .from(lostFoundReportsTable)
      .where(eq(lostFoundReportsTable.id, reportId))
      .limit(1);

    if (!report) return res.status(404).end();
    const urls = report.imageUrls as string[] | null;
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
    req.log.error({ err }, "Error serving lost-found image");
    res.status(500).end();
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
    const reportTransformed = { ...report, imageUrls: transformLostFoundImages(report.id, report.imageUrls) };
    res.json(reportTransformed);
  } catch (err) {
    req.log.error({ err }, "Error getting lost/found report");
    res.status(500).json({ error: "internal_error", message: "Failed to get report" });
  }
});

router.delete("/lost-found/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "validation_error", message: "Invalid id" });

    const userId = req.userId;
    const [report] = await db.select().from(lostFoundReportsTable).where(eq(lostFoundReportsTable.id, id));
    if (!report) return res.status(404).json({ error: "not_found", message: "Report not found" });

    const isAdmin = req.userRole === "admin";
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

    const userId = req.userId;
    const [report] = await db.select().from(lostFoundReportsTable).where(eq(lostFoundReportsTable.id, id));
    if (!report) return res.status(404).json({ error: "not_found", message: "Report not found" });

    const isAdmin = req.userRole === "admin";
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

    if (updated.reporterId) {
      try {
        await createNotification(
          updated.reporterId,
          "lost_found_accepted",
          "Lost/Found Report Approved",
          `Your ${updated.reportType} pet report has been approved and is now visible to the public.`,
        );
      } catch (err) {
        req.log.error({ err }, "Error creating lost/found approval notification");
      }
    }

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

    if (updated.reporterId) {
      try {
        await createNotification(
          updated.reporterId,
          "lost_found_rejected",
          "Lost/Found Report Rejected",
          `Unfortunately, your ${updated.reportType} pet report has been rejected. Please review our guidelines and feel free to resubmit.`,
        );
      } catch (err) {
        req.log.error({ err }, "Error creating lost/found rejection notification");
      }
    }

    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Error rejecting lost/found report");
    res.status(500).json({ error: "internal_error", message: "Failed to reject report" });
  }
});

export default router;

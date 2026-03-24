import { Router, type IRouter } from "express";
import { db, lostFoundReportsTable, usersTable } from "@workspace/db";
import { eq, and, ilike, desc, sql } from "drizzle-orm";
import { ListLostFoundReportsQueryParams, CreateLostFoundReportBody, GetLostFoundReportParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/lost-found", async (req, res) => {
  try {
    const queryParsed = ListLostFoundReportsQueryParams.safeParse(req.query);
    if (!queryParsed.success) {
      return res.status(400).json({ error: "validation_error", message: "Invalid query parameters", details: queryParsed.error.issues });
    }

    const { reportType, type, city, gender, size, breed, page = 1, limit = 16 } = queryParsed.data;
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

export default router;

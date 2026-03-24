import { Router, type IRouter } from "express";
import { db, petsTable, usersTable, adoptionRequestsTable, fosterRequestsTable, donationsTable } from "@workspace/db";
import { eq, and, ilike, desc, sql, gte } from "drizzle-orm";

const router: IRouter = Router();

router.get("/admin/stats", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalPetsResult,
      pendingApprovalResult,
      activeAdoptionsResult,
      activeFostersResult,
      adoptionsCountResult,
      donationsResult,
      newUsersTodayResult,
      totalUsersResult,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(petsTable),
      db.select({ count: sql<number>`count(*)::int` }).from(petsTable).where(eq(petsTable.approved, false)),
      db.select({ count: sql<number>`count(*)::int` }).from(petsTable).where(eq(petsTable.status, "adopted")),
      db.select({ count: sql<number>`count(*)::int` }).from(petsTable).where(eq(petsTable.status, "fostered")),
      db.select({ count: sql<number>`count(*)::int` }).from(adoptionRequestsTable).where(eq(adoptionRequestsTable.status, "approved")),
      db.select({ total: sql<string>`coalesce(sum(amount::numeric), 0)::text` }).from(donationsTable).where(and(
        eq(donationsTable.type, "monetary"),
        gte(donationsTable.createdAt, new Date(today.getFullYear(), today.getMonth(), 1)),
      )),
      db.select({ count: sql<number>`count(*)::int` }).from(usersTable).where(gte(usersTable.createdAt, today)),
      db.select({ count: sql<number>`count(*)::int` }).from(usersTable),
    ]);

    res.json({
      totalPets: totalPetsResult[0]?.count ?? 0,
      pendingApproval: pendingApprovalResult[0]?.count ?? 0,
      activeAdoptions: activeAdoptionsResult[0]?.count ?? 0,
      activeFosters: activeFostersResult[0]?.count ?? 0,
      adoptionsCount: adoptionsCountResult[0]?.count ?? 0,
      totalDonationsThisMonth: donationsResult[0]?.total ?? "0",
      newUsersToday: newUsersTodayResult[0]?.count ?? 0,
      totalUsers: totalUsersResult[0]?.count ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "Error getting admin stats");
    res.status(500).json({ error: "internal_error", message: "Failed to get stats" });
  }
});

router.get("/admin/users", async (req, res) => {
  try {
    const { role, search, page = "1", limit = "20" } = req.query as Record<string, string>;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    if (role) conditions.push(eq(usersTable.role, role as any));
    if (search) conditions.push(ilike(usersTable.fullName, `%${search}%`));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const users = await db.select().from(usersTable)
      .where(whereClause)
      .orderBy(desc(usersTable.createdAt))
      .limit(limitNum)
      .offset(offset);

    res.json(users);
  } catch (err) {
    req.log.error({ err }, "Error listing admin users");
    res.status(500).json({ error: "internal_error", message: "Failed to list users" });
  }
});

router.put("/admin/pets/:id/approve", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [pet] = await db.update(petsTable)
      .set({ approved: true })
      .where(eq(petsTable.id, id))
      .returning();
    if (!pet) return res.status(404).json({ error: "not_found", message: "Pet not found" });
    res.json(pet);
  } catch (err) {
    req.log.error({ err }, "Error approving pet");
    res.status(500).json({ error: "internal_error", message: "Failed to approve pet" });
  }
});

router.put("/admin/pets/:id/featured", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [current] = await db.select({ featured: petsTable.featured }).from(petsTable).where(eq(petsTable.id, id));
    if (!current) return res.status(404).json({ error: "not_found", message: "Pet not found" });

    const [pet] = await db.update(petsTable)
      .set({ featured: !current.featured })
      .where(eq(petsTable.id, id))
      .returning();
    res.json(pet);
  } catch (err) {
    req.log.error({ err }, "Error toggling pet featured");
    res.status(500).json({ error: "internal_error", message: "Failed to toggle featured" });
  }
});

export default router;

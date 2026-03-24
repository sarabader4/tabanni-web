import { Router, type IRouter } from "express";
import { db, donationsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/donations", async (req, res) => {
  try {
    const { type, page = "1", limit = "20" } = req.query as Record<string, string>;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offset = (pageNum - 1) * limitNum;

    let query = db.select().from(donationsTable).orderBy(desc(donationsTable.createdAt));

    const donations = await db.select().from(donationsTable)
      .where(type ? eq(donationsTable.type, type as any) : undefined)
      .orderBy(desc(donationsTable.createdAt))
      .limit(limitNum)
      .offset(offset);

    res.json(donations);
  } catch (err) {
    req.log.error({ err }, "Error listing donations");
    res.status(500).json({ error: "internal_error", message: "Failed to list donations" });
  }
});

router.post("/donations", async (req, res) => {
  try {
    const { donorName, donorPhone, amount, type, donationTypeLabel, description, paymentMethod, frequency, petId } = req.body;
    if (!donorName || !type) {
      return res.status(400).json({ error: "validation_error", message: "donorName and type required" });
    }
    const [donation] = await db.insert(donationsTable).values({
      donorName, donorPhone, amount, type,
      donationTypeLabel, description, paymentMethod,
      frequency: frequency ?? "one_time",
      petId: petId ?? null,
    }).returning();
    res.status(201).json(donation);
  } catch (err) {
    req.log.error({ err }, "Error creating donation");
    res.status(500).json({ error: "internal_error", message: "Failed to create donation" });
  }
});

export default router;

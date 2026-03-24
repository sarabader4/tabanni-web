import { Router, type IRouter } from "express";
import { db, donationsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { CreateDonationBody, ListDonationsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

const DONATION_TYPES = ["monetary", "supplies", "food", "medical", "other"] as const;

router.get("/donations", async (req, res) => {
  try {
    const queryParsed = ListDonationsQueryParams.safeParse(req.query);
    if (!queryParsed.success) {
      return res.status(400).json({ error: "validation_error", message: "Invalid query parameters", details: queryParsed.error.issues });
    }

    const { type, page = 1, limit = 20 } = queryParsed.data;
    const pageNum = page;
    const limitNum = limit;
    const offset = (pageNum - 1) * limitNum;

    const donationType = type ? DONATION_TYPES.find(t => t === type) : undefined;

    const donations = await db.select().from(donationsTable)
      .where(donationType ? eq(donationsTable.type, donationType) : undefined)
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
    const parsed = CreateDonationBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "validation_error", message: "Invalid request body", details: parsed.error.issues });
    }

    const { donorName, donorPhone, amount, type, donationTypeLabel, description, paymentMethod, frequency, petId } = parsed.data;
    const userId = req.body.userId ? parseInt(req.body.userId) : undefined;

    const [donation] = await db.insert(donationsTable).values({
      donorName, donorPhone, amount, type,
      donationTypeLabel, description, paymentMethod,
      frequency: frequency ?? "one_time",
      petId: petId ?? null,
      userId: userId ?? null,
    }).returning();
    res.status(201).json(donation);
  } catch (err) {
    req.log.error({ err }, "Error creating donation");
    res.status(500).json({ error: "internal_error", message: "Failed to create donation" });
  }
});

export default router;

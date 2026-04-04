import { Router, type IRouter, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { contactMessagesTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

router.post("/contact", async (req: Request, res: Response) => {
  const { name, phone, email, message } = req.body as {
    name?: string;
    phone?: string;
    email?: string;
    message?: string;
  };
  if (!name?.trim() || !message?.trim()) {
    res.status(400).json({ error: "Name and message are required" });
    return;
  }
  const [row] = await db
    .insert(contactMessagesTable)
    .values({ name: name.trim(), phone: phone?.trim() || null, email: email?.trim() || null, message: message.trim() })
    .returning();
  res.status(201).json(row);
});

router.get("/admin/contact-messages", async (_req: Request, res: Response) => {
  const rows = await db
    .select()
    .from(contactMessagesTable)
    .orderBy(desc(contactMessagesTable.createdAt));
  res.json(rows);
});

router.patch("/admin/contact-messages/:id/read", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [row] = await db
    .update(contactMessagesTable)
    .set({ read: true })
    .where(eq(contactMessagesTable.id, id))
    .returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.delete("/admin/contact-messages/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(contactMessagesTable).where(eq(contactMessagesTable.id, id));
  res.status(204).end();
});

export default router;

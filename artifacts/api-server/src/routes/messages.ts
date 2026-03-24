import { Router, type IRouter } from "express";
import { db, messagesTable } from "@workspace/db";
import { SendMessageBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/messages", async (req, res) => {
  try {
    const parsed = SendMessageBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "validation_error", message: "Invalid request body", details: parsed.error.issues });
    }
    const { senderId, recipientId, petId, senderName, content } = parsed.data;
    const [message] = await db.insert(messagesTable).values({
      senderId, recipientId, petId, senderName, content,
    }).returning();
    res.status(201).json(message);
  } catch (err) {
    req.log.error({ err }, "Error sending message");
    res.status(500).json({ error: "internal_error", message: "Failed to send message" });
  }
});

export default router;

import { Router, type IRouter } from "express";
import { db, messagesTable } from "@workspace/db";

const router: IRouter = Router();

router.post("/messages", async (req, res) => {
  try {
    const { senderId, recipientId, petId, senderName, content } = req.body;
    if (!content) {
      return res.status(400).json({ error: "validation_error", message: "content required" });
    }
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

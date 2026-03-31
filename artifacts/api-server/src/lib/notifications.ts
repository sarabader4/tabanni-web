import { db, notificationsTable, usersTable, NotificationType } from "@workspace/db";
import { eq } from "drizzle-orm";
import { sendNotificationEmail } from "./mailer";
import { logger } from "./logger";

export type { NotificationType };

export async function createNotification(
  userId: number,
  type: NotificationType,
  title: string,
  message: string,
  petId?: number | null,
): Promise<void> {
  try {
    await db.insert(notificationsTable).values({
      userId,
      type,
      title,
      message,
      petId: petId ?? null,
    });

    const [user] = await db.select({ email: usersTable.email }).from(usersTable).where(eq(usersTable.id, userId));
    if (user?.email) {
      sendNotificationEmail({ to: user.email }).catch((err) => {
        logger.error({ err }, "Failed to send notification email");
      });
    }
  } catch (err) {
    logger.error({ err }, "Failed to create notification");
    throw err;
  }
}

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
  metadata?: Record<string, unknown> | null,
): Promise<void> {
  try {
    await db.insert(notificationsTable).values({
      userId,
      type,
      title,
      message,
      petId: petId ?? null,
      metadata: metadata ?? null,
    });

    const [user] = await db.select({ email: usersTable.email }).from(usersTable).where(eq(usersTable.id, userId));
    if (user?.email) {
      const isApprovalType = type === "adoption_accepted" || type === "foster_accepted";
      const whatsappLink = isApprovalType && metadata?.whatsappLink ? String(metadata.whatsappLink) : undefined;
      const requestTypeName = type === "adoption_accepted" ? "adoption" : type === "foster_accepted" ? "foster" : undefined;
      sendNotificationEmail({
        to: user.email,
        type,
        title,
        message,
        whatsappLink,
        requestTypeName,
      }).catch((err) => {
        logger.error({ err }, "Failed to send notification email");
      });
    }
  } catch (err) {
    logger.error({ err }, "Failed to create notification");
    throw err;
  }
}

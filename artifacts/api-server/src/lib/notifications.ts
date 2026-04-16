import { db, notificationsTable, adminNotificationsTable, usersTable, NotificationType } from "@workspace/db";
import { eq } from "drizzle-orm";
import { sendNotificationEmail, sendAdminEmail } from "./mailer";
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

    const [user] = await db.select({ email: usersTable.email, emailNotificationsEnabled: usersTable.emailNotificationsEnabled }).from(usersTable).where(eq(usersTable.id, userId));
    if (user?.email && user.emailNotificationsEnabled !== false) {
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

export async function createAdminNotification(
  type: string,
  title: string,
  message: string,
  userId?: number | null,
  metadata?: Record<string, unknown> | null,
): Promise<void> {
  try {
    await db.insert(adminNotificationsTable).values({
      type,
      title,
      message,
      userId: userId ?? null,
      metadata: metadata ?? null,
    });

    const adminEmailEnv = process.env.ADMIN_EMAIL;
    const adminsFromDb = await db.select({ email: usersTable.email }).from(usersTable).where(eq(usersTable.role, "admin"));

    const recipients = new Set<string>();
    for (const admin of adminsFromDb) {
      recipients.add(admin.email);
    }
    if (adminEmailEnv) {
      recipients.add(adminEmailEnv);
    }

    for (const email of recipients) {
      sendAdminEmail({ to: email, type, title, message }).catch((err) => {
        logger.error({ err }, "Failed to send admin notification email");
      });
    }
  } catch (err) {
    logger.error({ err }, "Failed to create admin notification");
  }
}

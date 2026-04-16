import { db, notificationsTable, adminNotificationsTable, adminNotificationEmailLogsTable, usersTable, NotificationType } from "@workspace/db";
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
    const [inserted] = await db.insert(adminNotificationsTable).values({
      type,
      title,
      message,
      userId: userId ?? null,
      metadata: metadata ?? null,
    }).returning({ id: adminNotificationsTable.id });

    const notifId = inserted?.id;

    const adminEmailEnv = process.env.ADMIN_EMAIL;
    const smtpFrom = process.env.SMTP_FROM ?? "noreply@tabanni.com";
    const adminsFromDb = await db.select({ email: usersTable.email }).from(usersTable).where(eq(usersTable.role, "admin"));

    const recipients = new Set<string>();
    for (const admin of adminsFromDb) {
      recipients.add(admin.email);
    }
    if (adminEmailEnv) {
      recipients.add(adminEmailEnv);
    }
    if (recipients.size === 0) {
      recipients.add(smtpFrom);
    }

    const sentAt = new Date();
    const recipientList = Array.from(recipients);

    const rawResults = await Promise.allSettled(
      recipientList.map((email) =>
        sendAdminEmail({ to: email, type, title, message, timestamp: sentAt }),
      ),
    );

    const results = rawResults.map((r, i) => ({
      email: recipientList[i],
      success: r.status === "fulfilled" && r.value === true,
      errorMessage: r.status === "rejected"
        ? (r.reason instanceof Error ? r.reason.message : typeof r.reason === "string" ? r.reason : "Unknown error")
        : r.status === "fulfilled" && !r.value
          ? "Email delivery failed"
          : null,
    }));

    if (notifId !== undefined && results.length > 0) {
      const anySucceeded = results.some((r) => r.success);
      const allFailed = results.every((r) => !r.success);

      if (anySucceeded) {
        await db.update(adminNotificationsTable)
          .set({ emailSentAt: sentAt })
          .where(eq(adminNotificationsTable.id, notifId));
      } else if (allFailed) {
        await db.update(adminNotificationsTable)
          .set({ emailFailed: true })
          .where(eq(adminNotificationsTable.id, notifId));
      }

      await db.insert(adminNotificationEmailLogsTable).values(
        results.map((r) => ({
          notificationId: notifId,
          recipientEmail: r.email,
          success: r.success,
          errorMessage: r.errorMessage ?? null,
          sentAt,
        })),
      );
    }
  } catch (err) {
    logger.error({ err }, "Failed to create admin notification");
  }
}

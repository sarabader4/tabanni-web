import { pgTable, text, serial, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const adminNotificationsTable = pgTable("admin_notifications", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  userId: integer("user_id").references(() => usersTable.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  metadata: jsonb("metadata"),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  emailSentAt: timestamp("email_sent_at"),
  emailFailed: boolean("email_failed").notNull().default(false),
});

export type AdminNotification = typeof adminNotificationsTable.$inferSelect;
export type InsertAdminNotification = typeof adminNotificationsTable.$inferInsert;

export const adminNotificationEmailLogsTable = pgTable("admin_notification_email_logs", {
  id: serial("id").primaryKey(),
  notificationId: integer("notification_id").notNull().references(() => adminNotificationsTable.id, { onDelete: "cascade" }),
  recipientEmail: text("recipient_email").notNull(),
  success: boolean("success").notNull(),
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
});

export type AdminNotificationEmailLog = typeof adminNotificationEmailLogsTable.$inferSelect;
export type InsertAdminNotificationEmailLog = typeof adminNotificationEmailLogsTable.$inferInsert;

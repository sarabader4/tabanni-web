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
});

export type AdminNotification = typeof adminNotificationsTable.$inferSelect;
export type InsertAdminNotification = typeof adminNotificationsTable.$inferInsert;

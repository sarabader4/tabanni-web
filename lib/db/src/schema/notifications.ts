import { pgTable, text, serial, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { petsTable } from "./pets";

export const NOTIFICATION_TYPES = [
  "pet_accepted",
  "pet_rejected",
  "lost_found_accepted",
  "lost_found_rejected",
  "volunteer_accepted",
  "volunteer_rejected",
  "new_adoption_request",
  "new_foster_request",
  "adoption_accepted",
  "adoption_rejected",
  "foster_accepted",
  "foster_rejected",
] as const;

export type NotificationType = typeof NOTIFICATION_TYPES[number];

export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  petId: integer("pet_id").references(() => petsTable.id),
  type: text("type").notNull(),
  title: text("title").notNull().default(""),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notificationsTable).omit({ id: true, createdAt: true });
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notificationsTable.$inferSelect;

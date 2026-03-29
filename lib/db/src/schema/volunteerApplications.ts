import { pgTable, text, serial, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const volunteerApplicationTypeEnum = pgEnum("volunteer_application_type", ["member", "volunteer_activity"]);
export const volunteerApplicationStatusEnum = pgEnum("volunteer_application_status", ["pending", "accepted", "rejected"]);

export const volunteerApplicationsTable = pgTable("volunteer_applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  applicationType: volunteerApplicationTypeEnum("application_type").notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  city: text("city").notNull(),
  address: text("address").notNull(),
  skills: text("skills").notNull(),
  motivation: text("motivation").notNull(),
  status: volunteerApplicationStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertVolunteerApplicationSchema = createInsertSchema(volunteerApplicationsTable).omit({ id: true, createdAt: true, updatedAt: true, status: true });
export const updateVolunteerApplicationSchema = insertVolunteerApplicationSchema.partial();
export type InsertVolunteerApplication = z.infer<typeof insertVolunteerApplicationSchema>;
export type VolunteerApplication = typeof volunteerApplicationsTable.$inferSelect;

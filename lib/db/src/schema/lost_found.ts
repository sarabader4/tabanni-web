import { pgTable, text, serial, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { petsTable } from "./pets";

export const reportTypeEnum = pgEnum("report_type", ["lost", "found"]);

export const lostFoundReportsTable = pgTable("lost_found_reports", {
  id: serial("id").primaryKey(),
  reportType: reportTypeEnum("report_type").notNull(),
  petId: integer("pet_id").references(() => petsTable.id),
  name: text("name").notNull(),
  type: text("type").notNull(),
  breed: text("breed"),
  gender: text("gender"),
  color: text("color"),
  ageMonths: integer("age_months"),
  size: text("size"),
  city: text("city").notNull(),
  imageUrls: text("image_urls").array().notNull().default([]),
  description: text("description"),
  lostDate: text("lost_date"),
  foundDate: text("found_date"),
  reporterId: integer("reporter_id").references(() => usersTable.id),
  reporterName: text("reporter_name"),
  reporterPhone: text("reporter_phone"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertLostFoundReportSchema = createInsertSchema(lostFoundReportsTable).omit({ id: true, createdAt: true });
export type InsertLostFoundReport = z.infer<typeof insertLostFoundReportSchema>;
export type LostFoundReport = typeof lostFoundReportsTable.$inferSelect;

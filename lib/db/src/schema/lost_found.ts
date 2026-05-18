import { pgTable, text, serial, timestamp, integer, pgEnum, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { petsTable } from "./pets";

export const reportTypeEnum = pgEnum("report_type", ["lost", "found"]);
export const lostFoundStatusEnum = pgEnum("lost_found_status", ["pending", "approved", "rejected", "resolved"]);

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
  area: text("area"),
  imageUrls: text("image_urls").array().notNull().default([]),
  description: text("description"),
  lostDate: text("lost_date"),
  foundDate: text("found_date"),
  reporterId: integer("reporter_id").references(() => usersTable.id),
  reporterName: text("reporter_name"),
  reporterPhone: text("reporter_phone"),
  whatsappUrl: text("whatsapp_url"),
  status: lostFoundStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("lf_status_created_idx").on(table.status, table.createdAt),
  index("lf_report_type_idx").on(table.reportType),
  index("lf_city_idx").on(table.city),
  index("lf_reporter_id_idx").on(table.reporterId),
]);

export const insertLostFoundReportSchema = createInsertSchema(lostFoundReportsTable).omit({ id: true, createdAt: true });
export type InsertLostFoundReport = z.infer<typeof insertLostFoundReportSchema>;
export type LostFoundReport = typeof lostFoundReportsTable.$inferSelect;

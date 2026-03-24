import { pgTable, text, serial, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { petsTable } from "./pets";

export const requestStatusEnum = pgEnum("request_status", ["pending", "approved", "rejected"]);

export const adoptionRequestsTable = pgTable("adoption_requests", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull().references(() => petsTable.id),
  requesterId: integer("requester_id").notNull().references(() => usersTable.id),
  message: text("message"),
  status: requestStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const fosterRequestsTable = pgTable("foster_requests", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").notNull().references(() => petsTable.id),
  requesterId: integer("requester_id").notNull().references(() => usersTable.id),
  message: text("message"),
  status: requestStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAdoptionRequestSchema = createInsertSchema(adoptionRequestsTable).omit({ id: true, createdAt: true, status: true });
export const insertFosterRequestSchema = createInsertSchema(fosterRequestsTable).omit({ id: true, createdAt: true, status: true });
export type InsertAdoptionRequest = z.infer<typeof insertAdoptionRequestSchema>;
export type AdoptionRequest = typeof adoptionRequestsTable.$inferSelect;
export type InsertFosterRequest = z.infer<typeof insertFosterRequestSchema>;
export type FosterRequest = typeof fosterRequestsTable.$inferSelect;

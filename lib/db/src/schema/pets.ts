import { pgTable, text, serial, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const petTypeEnum = pgEnum("pet_type", ["dog", "cat", "rabbit", "bird", "other"]);
export const petGenderEnum = pgEnum("pet_gender", ["male", "female"]);
export const petSizeEnum = pgEnum("pet_size", ["small", "medium", "large"]);
export const petStatusEnum = pgEnum("pet_status", ["available", "adopted", "fostered", "pending", "lost", "found"]);
export const petPurposeEnum = pgEnum("pet_purpose", ["adopt", "foster", "both", "lost_found"]);

export const petsTable = pgTable("pets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: petTypeEnum("type").notNull(),
  breed: text("breed"),
  gender: petGenderEnum("gender").notNull(),
  ageMonths: integer("age_months").notNull().default(0),
  weightKg: text("weight_kg"),
  size: petSizeEnum("size").notNull(),
  color: text("color"),
  sterilized: boolean("sterilized").notNull().default(false),
  yearlyVaccines: boolean("yearly_vaccines").notNull().default(false),
  birthday: text("birthday"),
  city: text("city").notNull(),
  status: petStatusEnum("status").notNull().default("available"),
  purpose: petPurposeEnum("purpose").notNull().default("adopt"),
  imageUrls: text("image_urls").array().notNull().default([]),
  story: text("story"),
  ownerId: integer("owner_id").references(() => usersTable.id),
  approved: boolean("approved").notNull().default(false),
  rejected: boolean("rejected").notNull().default(false),
  featured: boolean("featured").notNull().default(false),
  addedByAdmin: boolean("added_by_admin").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPetSchema = createInsertSchema(petsTable).omit({ id: true, createdAt: true });
export const updatePetSchema = insertPetSchema.partial();
export type InsertPet = z.infer<typeof insertPetSchema>;
export type Pet = typeof petsTable.$inferSelect;

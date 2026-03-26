import { pgTable, text, serial, timestamp, integer, numeric, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { petsTable } from "./pets";
import { usersTable } from "./users";

export const donationTypeEnum = pgEnum("donation_type", ["monetary", "supplies"]);
export const donationFrequencyEnum = pgEnum("donation_frequency", ["one_time", "monthly"]);
export const donationStatusEnum = pgEnum("donation_status", ["pending", "success", "failed"]);

export const donationsTable = pgTable("donations", {
  id: serial("id").primaryKey(),
  donorName: text("donor_name").notNull(),
  donorPhone: text("donor_phone"),
  userId: integer("user_id").references(() => usersTable.id),
  amount: numeric("amount", { precision: 10, scale: 2 }),
  type: donationTypeEnum("type").notNull().default("monetary"),
  donationTypeLabel: text("donation_type_label"),
  description: text("description"),
  paymentMethod: text("payment_method"),
  frequency: donationFrequencyEnum("frequency").notNull().default("one_time"),
  petId: integer("pet_id").references(() => petsTable.id),
  status: donationStatusEnum("status").notNull().default("pending"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  paypalOrderId: text("paypal_order_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDonationSchema = createInsertSchema(donationsTable).omit({ id: true, createdAt: true });
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donationsTable.$inferSelect;

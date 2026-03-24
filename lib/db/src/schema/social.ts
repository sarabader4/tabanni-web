import { pgTable, text, serial, timestamp, integer, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { petsTable } from "./pets";

export const favouritesTable = pgTable("favourites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  petId: integer("pet_id").notNull().references(() => petsTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  uniqueUserPet: unique().on(table.userId, table.petId),
}));

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => usersTable.id),
  recipientId: integer("recipient_id").references(() => usersTable.id),
  petId: integer("pet_id").references(() => petsTable.id),
  senderName: text("sender_name"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFavouriteSchema = createInsertSchema(favouritesTable).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messagesTable).omit({ id: true, createdAt: true });
export type InsertFavourite = z.infer<typeof insertFavouriteSchema>;
export type Favourite = typeof favouritesTable.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messagesTable.$inferSelect;

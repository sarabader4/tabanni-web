import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const galleryPostsTable = pgTable("gallery_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  authorId: integer("author_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertGalleryPostSchema = createInsertSchema(galleryPostsTable).omit({ id: true, createdAt: true });
export type InsertGalleryPost = z.infer<typeof insertGalleryPostSchema>;
export type GalleryPost = typeof galleryPostsTable.$inferSelect;

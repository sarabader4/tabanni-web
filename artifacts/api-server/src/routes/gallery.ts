import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { db, galleryPostsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { ListGalleryPostsQueryParams, CreateGalleryPostBody, GetGalleryPostParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/gallery", async (req, res): Promise<void> => {
  try {
    const queryParsed = ListGalleryPostsQueryParams.safeParse(req.query);
    if (!queryParsed.success) {
      res.status(400).json({ error: "validation_error", message: "Invalid query parameters", details: queryParsed.error.issues });
      return;
    }
    const { page = 1, limit = 12 } = queryParsed.data;
    const offset = (page - 1) * limit;

    const posts = await db.select({
      id: galleryPostsTable.id,
      title: galleryPostsTable.title,
      content: galleryPostsTable.content,
      imageUrl: galleryPostsTable.imageUrl,
      authorId: galleryPostsTable.authorId,
      authorName: usersTable.fullName,
      createdAt: galleryPostsTable.createdAt,
    })
      .from(galleryPostsTable)
      .leftJoin(usersTable, eq(galleryPostsTable.authorId, usersTable.id))
      .orderBy(desc(galleryPostsTable.createdAt))
      .limit(limit)
      .offset(offset);

    res.json(posts);
  } catch (err) {
    req.log.error({ err }, "Error listing gallery posts");
    res.status(500).json({ error: "internal_error", message: "Failed to list gallery posts" });
  }
});

router.post("/gallery", requireAuth, async (req, res): Promise<void> => {
  try {
    const parsed = CreateGalleryPostBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "validation_error", message: "Invalid request body", details: parsed.error.issues });
      return;
    }
    const { title, content, imageUrl } = parsed.data;
    const [post] = await db.insert(galleryPostsTable).values({ title, content, imageUrl, authorId: req.userId }).returning();
    res.status(201).json(post);
  } catch (err) {
    req.log.error({ err }, "Error creating gallery post");
    res.status(500).json({ error: "internal_error", message: "Failed to create gallery post" });
  }
});

router.get("/gallery/:id", async (req, res): Promise<void> => {
  try {
    const paramsParsed = GetGalleryPostParams.safeParse(req.params);
    if (!paramsParsed.success) {
      res.status(400).json({ error: "validation_error", message: "Invalid id", details: paramsParsed.error.issues });
      return;
    }
    const id = paramsParsed.data.id;
    const [post] = await db.select({
      id: galleryPostsTable.id,
      title: galleryPostsTable.title,
      content: galleryPostsTable.content,
      imageUrl: galleryPostsTable.imageUrl,
      authorId: galleryPostsTable.authorId,
      authorName: usersTable.fullName,
      createdAt: galleryPostsTable.createdAt,
    })
      .from(galleryPostsTable)
      .leftJoin(usersTable, eq(galleryPostsTable.authorId, usersTable.id))
      .where(eq(galleryPostsTable.id, id));

    if (!post) { res.status(404).json({ error: "not_found", message: "Post not found" }); return; }
    res.json(post);
  } catch (err) {
    req.log.error({ err }, "Error getting gallery post");
    res.status(500).json({ error: "internal_error", message: "Failed to get gallery post" });
  }
});

router.put("/gallery/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const paramsParsed = GetGalleryPostParams.safeParse(req.params);
    if (!paramsParsed.success) {
      res.status(400).json({ error: "validation_error", message: "Invalid id", details: paramsParsed.error.issues });
      return;
    }
    const id = paramsParsed.data.id;
    const { title, content, imageUrl } = req.body as { title?: string; content?: string; imageUrl?: string };
    const updates: Partial<{ title: string; content: string; imageUrl: string }> = {};
    if (typeof title === "string") updates.title = title;
    if (typeof content === "string") updates.content = content;
    if (typeof imageUrl === "string") updates.imageUrl = imageUrl;
    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "validation_error", message: "No valid fields to update" });
      return;
    }
    const [post] = await db.update(galleryPostsTable).set(updates).where(eq(galleryPostsTable.id, id)).returning();
    if (!post) { res.status(404).json({ error: "not_found", message: "Post not found" }); return; }
    res.json(post);
  } catch (err) {
    req.log.error({ err }, "Error updating gallery post");
    res.status(500).json({ error: "internal_error", message: "Failed to update gallery post" });
  }
});

router.delete("/gallery/:id", requireAuth, async (req, res): Promise<void> => {
  try {
    const paramsParsed = GetGalleryPostParams.safeParse(req.params);
    if (!paramsParsed.success) {
      res.status(400).json({ error: "validation_error", message: "Invalid id", details: paramsParsed.error.issues });
      return;
    }
    const id = paramsParsed.data.id;
    await db.delete(galleryPostsTable).where(eq(galleryPostsTable.id, id));
    res.json({ success: true, message: "Post deleted" });
  } catch (err) {
    req.log.error({ err }, "Error deleting gallery post");
    res.status(500).json({ error: "internal_error", message: "Failed to delete gallery post" });
  }
});

export default router;

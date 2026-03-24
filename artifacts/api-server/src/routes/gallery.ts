import { Router, type IRouter } from "express";
import { db, galleryPostsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { ListGalleryPostsQueryParams, CreateGalleryPostBody, GetGalleryPostParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/gallery", async (req, res) => {
  try {
    const queryParsed = ListGalleryPostsQueryParams.safeParse(req.query);
    if (!queryParsed.success) {
      return res.status(400).json({ error: "validation_error", message: "Invalid query parameters", details: queryParsed.error.issues });
    }
    const { page = 1, limit = 12 } = queryParsed.data;
    const pageNum = page;
    const limitNum = limit;
    const offset = (pageNum - 1) * limitNum;

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
      .limit(limitNum)
      .offset(offset);

    res.json(posts);
  } catch (err) {
    req.log.error({ err }, "Error listing gallery posts");
    res.status(500).json({ error: "internal_error", message: "Failed to list gallery posts" });
  }
});

router.post("/gallery", async (req, res) => {
  try {
    const parsed = CreateGalleryPostBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "validation_error", message: "Invalid request body", details: parsed.error.issues });
    }
    const { title, content, imageUrl, authorId } = parsed.data;
    const [post] = await db.insert(galleryPostsTable).values({ title, content, imageUrl, authorId }).returning();
    res.status(201).json(post);
  } catch (err) {
    req.log.error({ err }, "Error creating gallery post");
    res.status(500).json({ error: "internal_error", message: "Failed to create gallery post" });
  }
});

router.get("/gallery/:id", async (req, res) => {
  try {
    const paramsParsed = GetGalleryPostParams.safeParse(req.params);
    if (!paramsParsed.success) {
      return res.status(400).json({ error: "validation_error", message: "Invalid id", details: paramsParsed.error.issues });
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

    if (!post) return res.status(404).json({ error: "not_found", message: "Post not found" });
    res.json(post);
  } catch (err) {
    req.log.error({ err }, "Error getting gallery post");
    res.status(500).json({ error: "internal_error", message: "Failed to get gallery post" });
  }
});

router.delete("/gallery/:id", async (req, res) => {
  try {
    const paramsParsed = GetGalleryPostParams.safeParse(req.params);
    if (!paramsParsed.success) {
      return res.status(400).json({ error: "validation_error", message: "Invalid id", details: paramsParsed.error.issues });
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

import { Router, type IRouter } from "express";
import { uploadImage } from "../lib/cloudinary";
import { db, petsTable, usersTable } from "@workspace/db";

const router: IRouter = Router();

router.post("/upload/image", async (req, res) => {
  try {
    const { image } = req.body as { image?: string };
    if (!image) {
      return res.status(400).json({ error: "validation_error", message: "image is required" });
    }
    const url = await uploadImage(image, "tabanni");
    res.json({ url });
  } catch (err) {
    req.log.error({ err }, "Error uploading image");
    res.status(500).json({ error: "upload_error", message: "Failed to upload image" });
  }
});

router.post("/admin/migrate-images", async (req, res) => {
  try {
    const results = { pets: 0, users: 0, errors: 0 };

    const pets = await db.select({ id: petsTable.id, imageUrls: petsTable.imageUrls }).from(petsTable);
    for (const pet of pets) {
      if (!Array.isArray(pet.imageUrls)) continue;
      let changed = false;
      const newUrls: string[] = [];
      for (const url of pet.imageUrls) {
        if (typeof url === "string" && url.startsWith("data:")) {
          try {
            const newUrl = await uploadImage(url, "tabanni/pets");
            newUrls.push(newUrl);
            changed = true;
          } catch { newUrls.push(url); results.errors++; }
        } else { newUrls.push(url); }
      }
      if (changed) {
        await db.update(petsTable).set({ imageUrls: newUrls }).where((await import("drizzle-orm")).eq(petsTable.id, pet.id));
        results.pets++;
      }
    }

    const users = await db.select({ id: usersTable.id, avatarUrl: usersTable.avatarUrl }).from(usersTable);
    for (const user of users) {
      if (user.avatarUrl?.startsWith("data:")) {
        try {
          const newUrl = await uploadImage(user.avatarUrl, "tabanni/avatars");
          await db.update(usersTable).set({ avatarUrl: newUrl }).where((await import("drizzle-orm")).eq(usersTable.id, user.id));
          results.users++;
        } catch { results.errors++; }
      }
    }

    res.json({ success: true, ...results });
  } catch (err) {
    req.log.error({ err }, "Migration error");
    res.status(500).json({ error: "migration_error", message: String(err) });
  }
});

export default router;
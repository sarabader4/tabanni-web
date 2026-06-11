import { v2 as cloudinary } from "cloudinary";
import pg from "pg";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

async function uploadBase64(base64) {
  try {
    const result = await cloudinary.uploader.upload(base64, {
      folder: "tabanni",
      resource_type: "auto",
    });
    return result.secure_url;
  } catch (err) {
    console.error("Upload failed:", err.message);
    return null;
  }
}

function isBase64(str) {
  return typeof str === "string" && str.startsWith("data:");
}

// Migrate pets images
console.log("Migrating pets images...");
const { rows: pets } = await client.query("SELECT id, image_urls FROM pets WHERE image_urls IS NOT NULL");

for (const pet of pets) {
  const urls = pet.image_urls;
  if (!Array.isArray(urls)) continue;
  
  let changed = false;
  const newUrls = [];
  
  for (const url of urls) {
    if (isBase64(url)) {
      console.log(`Uploading image for pet ${pet.id}...`);
      const newUrl = await uploadBase64(url);
      if (newUrl) {
        newUrls.push(newUrl);
        changed = true;
      }
    } else {
      newUrls.push(url);
    }
  }
  
  if (changed) {
    await client.query("UPDATE pets SET image_urls = $1 WHERE id = $2", [JSON.stringify(newUrls), pet.id]);
    console.log(`✅ Pet ${pet.id} updated`);
  }
}

// Migrate gallery posts
console.log("Migrating gallery images...");
const { rows: gallery } = await client.query("SELECT id, image_url FROM gallery_posts WHERE image_url IS NOT NULL");

for (const post of gallery) {
  if (isBase64(post.image_url)) {
    console.log(`Uploading gallery image ${post.id}...`);
    const newUrl = await uploadBase64(post.image_url);
    if (newUrl) {
      await client.query("UPDATE gallery_posts SET image_url = $1 WHERE id = $2", [newUrl, post.id]);
      console.log(`✅ Gallery ${post.id} updated`);
    }
  }
}

// Migrate user avatars
console.log("Migrating user avatars...");
const { rows: users } = await client.query("SELECT id, avatar_url FROM users WHERE avatar_url IS NOT NULL");

for (const user of users) {
  if (isBase64(user.avatar_url)) {
    console.log(`Uploading avatar for user ${user.id}...`);
    const newUrl = await uploadBase64(user.avatar_url);
    if (newUrl) {
      await client.query("UPDATE users SET avatar_url = $1 WHERE id = $2", [newUrl, user.id]);
      console.log(`✅ User ${user.id} updated`);
    }
  }
}

await client.end();
console.log("✅ Migration complete!");
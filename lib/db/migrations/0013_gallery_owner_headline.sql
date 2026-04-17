ALTER TABLE "gallery_posts" ADD COLUMN IF NOT EXISTS "headline" text NOT NULL DEFAULT '';
ALTER TABLE "gallery_posts" ADD COLUMN IF NOT EXISTS "owner_name" text NOT NULL DEFAULT '';

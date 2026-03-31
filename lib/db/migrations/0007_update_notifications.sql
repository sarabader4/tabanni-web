-- Migration: Update notifications table — replace status enum with type text + add title column
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "type" text NOT NULL DEFAULT '';
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "title" text NOT NULL DEFAULT '';

-- Backfill type from existing status values
UPDATE "notifications" SET "type" = CASE
  WHEN "status"::text = 'accepted' THEN 'pet_accepted'
  WHEN "status"::text = 'rejected' THEN 'pet_rejected'
  ELSE 'pet_accepted'
END WHERE "type" = '' AND "status" IS NOT NULL;

-- Drop the old status column (now superseded by type)
ALTER TABLE "notifications" DROP COLUMN IF EXISTS "status";

-- Drop the enum type if no longer used
DO $$ BEGIN
  DROP TYPE IF EXISTS "public"."notification_status";
EXCEPTION WHEN others THEN NULL; END $$;

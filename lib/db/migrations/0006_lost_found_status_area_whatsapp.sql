-- Migration: Add status, area, whatsappUrl to lost_found_reports
DO $$ BEGIN
  CREATE TYPE "public"."lost_found_status" AS ENUM('pending', 'approved', 'rejected', 'resolved');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "lost_found_reports"
  ADD COLUMN IF NOT EXISTS "area" text,
  ADD COLUMN IF NOT EXISTS "whatsapp_url" text,
  ADD COLUMN IF NOT EXISTS "status" "lost_found_status" NOT NULL DEFAULT 'pending';

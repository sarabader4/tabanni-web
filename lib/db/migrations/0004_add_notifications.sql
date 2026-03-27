-- Migration: Add notifications table
DO $$ BEGIN
 CREATE TYPE "public"."notification_status" AS ENUM('accepted', 'rejected');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "notifications" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id"),
  "pet_id" integer REFERENCES "pets"("id"),
  "status" "notification_status" NOT NULL,
  "message" text NOT NULL,
  "read" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now()
);

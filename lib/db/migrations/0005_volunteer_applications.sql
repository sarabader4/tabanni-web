-- Migration: Add volunteer_applications table
DO $$ BEGIN
  CREATE TYPE "public"."volunteer_application_type" AS ENUM('member', 'volunteer_activity');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."volunteer_application_status" AS ENUM('pending', 'accepted', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "volunteer_applications" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id"),
  "application_type" "volunteer_application_type" NOT NULL,
  "name" text NOT NULL,
  "phone" text NOT NULL,
  "email" text NOT NULL,
  "city" text NOT NULL,
  "address" text NOT NULL,
  "skills" text NOT NULL,
  "motivation" text NOT NULL,
  "status" "volunteer_application_status" NOT NULL DEFAULT 'pending',
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

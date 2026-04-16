ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_notifications_enabled" boolean DEFAULT true NOT NULL;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admin_notifications" (
  "id" serial PRIMARY KEY NOT NULL,
  "type" text NOT NULL,
  "user_id" integer REFERENCES "users"("id"),
  "title" text NOT NULL,
  "message" text NOT NULL,
  "metadata" jsonb,
  "read" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "admin_notifications" ADD COLUMN "email_sent_at" timestamp;
ALTER TABLE "admin_notifications" ADD COLUMN "email_failed" boolean NOT NULL DEFAULT false;

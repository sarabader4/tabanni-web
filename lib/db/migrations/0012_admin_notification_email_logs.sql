CREATE TABLE IF NOT EXISTS "admin_notification_email_logs" (
  "id" serial PRIMARY KEY NOT NULL,
  "notification_id" integer NOT NULL REFERENCES "admin_notifications"("id") ON DELETE CASCADE,
  "recipient_email" text NOT NULL,
  "success" boolean NOT NULL,
  "error_message" text,
  "sent_at" timestamp NOT NULL DEFAULT now()
);

-- Migration: Add payment tracking columns to donations table
-- Additive migration: safe for existing databases (uses IF NOT EXISTS guards)

DO $$ BEGIN
  CREATE TYPE "public"."donation_status" AS ENUM('pending', 'success', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
ALTER TABLE "donations" ADD COLUMN IF NOT EXISTS "status" "donation_status" DEFAULT 'pending' NOT NULL;
--> statement-breakpoint
ALTER TABLE "donations" ADD COLUMN IF NOT EXISTS "stripe_payment_intent_id" text;
--> statement-breakpoint
ALTER TABLE "donations" ADD COLUMN IF NOT EXISTS "paypal_order_id" text;

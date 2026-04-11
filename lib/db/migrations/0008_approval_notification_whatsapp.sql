-- Migration: Add in_progress and completed to request_status enum, add metadata to notifications

-- Extend request_status enum with new values
ALTER TYPE "public"."request_status" ADD VALUE IF NOT EXISTS 'in_progress';
ALTER TYPE "public"."request_status" ADD VALUE IF NOT EXISTS 'completed';

-- Add metadata JSONB column to notifications table
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "metadata" jsonb;

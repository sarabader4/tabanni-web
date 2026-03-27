-- Migration: Add whatsapp_url column to pets table
ALTER TABLE "pets" ADD COLUMN IF NOT EXISTS "whatsapp_url" text;

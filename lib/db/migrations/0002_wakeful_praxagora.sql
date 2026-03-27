-- Migration: Add user_profiles table for onboarding data
-- Additive migration: safe for existing databases (uses IF NOT EXISTS guards)

CREATE TABLE IF NOT EXISTS "user_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"area_of_residence" text NOT NULL,
	"home_address" text NOT NULL,
	"occupation" text NOT NULL,
	"age" integer NOT NULL,
	"main_caregiver" text NOT NULL,
	"adoption_reason" text NOT NULL,
	"financial_responsibility" text NOT NULL,
	"children_count" integer DEFAULT 0 NOT NULL,
	"yard_type" text NOT NULL,
	"day_location" text NOT NULL,
	"night_location" text NOT NULL,
	"allergies" text,
	"current_pets" text,
	"household_objection" text NOT NULL,
	"home_type" text NOT NULL,
	"ownership_type" text NOT NULL,
	"previous_pet_experience" text,
	"exercise_hours" integer NOT NULL,
	"monthly_cost_estimation" integer NOT NULL,
	"breeding_intention" text NOT NULL,
	"spay_neuter_commitment" boolean DEFAULT false NOT NULL,
	"behavior_tolerance" text,
	"trauma_handling_comfort" text,
	"daily_care_plan" text NOT NULL,
	"travel_plan" text,
	"activities" json DEFAULT '[]'::json,
	"pet_preferences" json DEFAULT '[]'::json,
	"training_expectations" json DEFAULT '[]'::json,
	"confirmed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

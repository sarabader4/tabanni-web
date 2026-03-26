import { pgTable, serial, integer, text, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const userProfilesTable = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique().references(() => usersTable.id, { onDelete: "cascade" }),
  areaOfResidence: text("area_of_residence").notNull(),
  homeAddress: text("home_address").notNull(),
  occupation: text("occupation").notNull(),
  age: integer("age").notNull(),
  mainCaregiver: text("main_caregiver").notNull(),
  adoptionReason: text("adoption_reason").notNull(),
  financialResponsibility: text("financial_responsibility").notNull(),
  childrenCount: integer("children_count").notNull().default(0),
  yardType: text("yard_type").notNull(),
  dayLocation: text("day_location").notNull(),
  nightLocation: text("night_location").notNull(),
  allergies: text("allergies"),
  currentPets: text("current_pets"),
  householdObjection: text("household_objection").notNull(),
  homeType: text("home_type").notNull(),
  ownershipType: text("ownership_type").notNull(),
  previousPetExperience: text("previous_pet_experience"),
  exerciseHours: integer("exercise_hours").notNull(),
  monthlyCostEstimation: integer("monthly_cost_estimation").notNull(),
  breedingIntention: text("breeding_intention").notNull(),
  spayNeuterCommitment: boolean("spay_neuter_commitment").notNull().default(false),
  behaviorTolerance: text("behavior_tolerance"),
  traumaHandlingComfort: text("trauma_handling_comfort"),
  dailyCarePlan: text("daily_care_plan").notNull(),
  travelPlan: text("travel_plan"),
  activities: json("activities").$type<string[]>().default([]),
  petPreferences: json("pet_preferences").$type<string[]>().default([]),
  trainingExpectations: json("training_expectations").$type<string[]>().default([]),
  confirmed: boolean("confirmed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type UserProfile = typeof userProfilesTable.$inferSelect;
export type InsertUserProfile = typeof userProfilesTable.$inferInsert;

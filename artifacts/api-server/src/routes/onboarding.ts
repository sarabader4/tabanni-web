import { Router, type IRouter, type Request, type Response } from "express";
import { db, usersTable, userProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { SubmitOnboardingBody } from "@workspace/api-zod";

const REQUIRED_STRING_FIELDS = [
  "areaOfResidence", "homeAddress", "occupation", "mainCaregiver",
  "adoptionReason", "financialResponsibility", "yardType", "dayLocation",
  "nightLocation", "householdObjection", "homeType", "ownershipType",
  "breedingIntention", "dailyCarePlan",
] as const;

const OnboardingBodyStrict = SubmitOnboardingBody.superRefine((data, ctx) => {
  for (const field of REQUIRED_STRING_FIELDS) {
    if (!data[field].trim()) {
      ctx.addIssue({ code: "too_small", minimum: 1, type: "string", inclusive: true, path: [field], message: `${field} must not be empty` });
    }
  }
  if (data.activities.length === 0) {
    ctx.addIssue({ code: "too_small", minimum: 1, type: "array", inclusive: true, path: ["activities"], message: "Select at least one activity" });
  }
  if (data.petPreferences.length === 0) {
    ctx.addIssue({ code: "too_small", minimum: 1, type: "array", inclusive: true, path: ["petPreferences"], message: "Select at least one pet preference" });
  }
  if (data.trainingExpectations.length === 0) {
    ctx.addIssue({ code: "too_small", minimum: 1, type: "array", inclusive: true, path: ["trainingExpectations"], message: "Select at least one training expectation" });
  }
  if (data.age < 18) {
    ctx.addIssue({ code: "too_small", minimum: 18, type: "number", inclusive: true, path: ["age"], message: "Must be at least 18" });
  }
  if (data.confirmed !== true) {
    ctx.addIssue({ code: "custom", path: ["confirmed"], message: "You must confirm the onboarding declaration" });
  }
  if (data.exerciseHours < 0 || data.exerciseHours > 24) {
    ctx.addIssue({ code: "too_small", minimum: 0, type: "number", inclusive: true, path: ["exerciseHours"], message: "exerciseHours must be between 0 and 24" });
  }
  if (data.monthlyCostEstimation < 0) {
    ctx.addIssue({ code: "too_small", minimum: 0, type: "number", inclusive: true, path: ["monthlyCostEstimation"], message: "monthlyCostEstimation must be non-negative" });
  }
});

const router: IRouter = Router();

function requireAuth(req: Request, res: Response): boolean {
  if (!req.userId) {
    res.status(401).json({ error: "unauthorized", message: "Authentication required" });
    return false;
  }
  return true;
}

router.post("/user/onboarding", async (req: Request, res: Response): Promise<void> => {
  try {
    if (!requireAuth(req, res)) return;

    const [existing] = await db
      .select({ id: userProfilesTable.id })
      .from(userProfilesTable)
      .where(eq(userProfilesTable.userId, req.userId));

    if (existing) {
      res.status(409).json({ error: "conflict", message: "Onboarding already submitted" });
      return;
    }

    const parsed = OnboardingBodyStrict.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "validation_error", message: "Invalid request body", details: parsed.error.issues });
      return;
    }

    const data = parsed.data;

    await db.transaction(async (tx) => {
      await tx.insert(userProfilesTable).values({
        userId: req.userId,
        areaOfResidence: data.areaOfResidence,
        homeAddress: data.homeAddress,
        occupation: data.occupation,
        age: data.age,
        mainCaregiver: data.mainCaregiver,
        adoptionReason: data.adoptionReason,
        financialResponsibility: data.financialResponsibility,
        childrenCount: data.childrenCount ?? 0,
        yardType: data.yardType,
        dayLocation: data.dayLocation,
        nightLocation: data.nightLocation,
        allergies: data.allergies ?? null,
        currentPets: data.currentPets ?? null,
        householdObjection: data.householdObjection,
        homeType: data.homeType,
        ownershipType: data.ownershipType,
        previousPetExperience: data.previousPetExperience ?? null,
        exerciseHours: data.exerciseHours,
        monthlyCostEstimation: data.monthlyCostEstimation,
        breedingIntention: data.breedingIntention,
        spayNeuterCommitment: data.spayNeuterCommitment,
        behaviorTolerance: data.behaviorTolerance ?? null,
        traumaHandlingComfort: data.traumaHandlingComfort ?? null,
        dailyCarePlan: data.dailyCarePlan,
        travelPlan: data.travelPlan ?? null,
        activities: data.activities,
        petPreferences: data.petPreferences,
        trainingExpectations: data.trainingExpectations,
        confirmed: data.confirmed,
      });

      await tx
        .update(usersTable)
        .set({ isOnboardingCompleted: true })
        .where(eq(usersTable.id, req.userId));
    });

    res.json({ success: true, message: "Onboarding completed" });
  } catch (err) {
    const pgErr = err as { code?: string };
    if (pgErr.code === "23505") {
      res.status(409).json({ error: "conflict", message: "Onboarding already submitted" });
      return;
    }
    req.log.error({ err }, "Error submitting onboarding");
    res.status(500).json({ error: "internal_error", message: "Failed to submit onboarding" });
  }
});

export default router;

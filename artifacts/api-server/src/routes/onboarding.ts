import { Router, type IRouter, type Request, type Response } from "express";
import { db, usersTable, userProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { SubmitOnboardingBody } from "@workspace/api-zod";

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

    const parsed = SubmitOnboardingBody.safeParse(req.body);
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
    req.log.error({ err }, "Error submitting onboarding");
    res.status(500).json({ error: "internal_error", message: "Failed to submit onboarding" });
  }
});

export default router;

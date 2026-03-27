import { Router, type IRouter, type Request, type Response } from "express";
import { db, usersTable, userProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

function requireAuth(req: Request, res: Response): boolean {
  if (!req.userId) {
    res.status(401).json({ error: "unauthorized", message: "Authentication required" });
    return false;
  }
  return true;
}

function validate(body: Record<string, unknown>): string | null {
  const requiredStrings = [
    "areaOfResidence", "homeAddress", "occupation", "mainCaregiver",
    "adoptionReason", "financialResponsibility", "yardType", "dayLocation",
    "nightLocation", "householdObjection", "homeType", "ownershipType",
    "breedingIntention", "dailyCarePlan",
  ];
  for (const key of requiredStrings) {
    if (!body[key] || typeof body[key] !== "string" || !(body[key] as string).trim()) {
      return `${key} is required`;
    }
  }
  const age = Number(body.age);
  if (!age || age < 18 || age > 120) return "Age must be 18 or older";
  const exerciseHours = Number(body.exerciseHours);
  if (isNaN(exerciseHours) || exerciseHours < 0) return "exerciseHours is required";
  const monthlyCost = Number(body.monthlyCostEstimation);
  if (isNaN(monthlyCost) || monthlyCost < 0) return "monthlyCostEstimation is required";
  if (!Array.isArray(body.activities) || body.activities.length === 0) return "Select at least one activity";
  if (!Array.isArray(body.petPreferences) || body.petPreferences.length === 0) return "Select at least one pet preference";
  if (!Array.isArray(body.trainingExpectations) || body.trainingExpectations.length === 0) return "Select at least one training expectation";
  if (typeof body.spayNeuterCommitment !== "boolean") return "spayNeuterCommitment must be a boolean";
  if (body.confirmed !== true) return "You must confirm the application";
  return null;
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

    const body = req.body as Record<string, unknown>;
    const validationError = validate(body);
    if (validationError) {
      res.status(400).json({ error: "validation_error", message: validationError });
      return;
    }

    await db.insert(userProfilesTable).values({
      userId: req.userId,
      areaOfResidence: String(body.areaOfResidence),
      homeAddress: String(body.homeAddress),
      occupation: String(body.occupation),
      age: Number(body.age),
      mainCaregiver: String(body.mainCaregiver),
      adoptionReason: String(body.adoptionReason),
      financialResponsibility: String(body.financialResponsibility),
      childrenCount: Number(body.childrenCount ?? 0),
      yardType: String(body.yardType),
      dayLocation: String(body.dayLocation),
      nightLocation: String(body.nightLocation),
      allergies: body.allergies ? String(body.allergies) : null,
      currentPets: body.currentPets ? String(body.currentPets) : null,
      householdObjection: String(body.householdObjection),
      homeType: String(body.homeType),
      ownershipType: String(body.ownershipType),
      previousPetExperience: body.previousPetExperience ? String(body.previousPetExperience) : null,
      exerciseHours: Number(body.exerciseHours),
      monthlyCostEstimation: Number(body.monthlyCostEstimation),
      breedingIntention: String(body.breedingIntention),
      spayNeuterCommitment: Boolean(body.spayNeuterCommitment),
      behaviorTolerance: body.behaviorTolerance ? String(body.behaviorTolerance) : null,
      traumaHandlingComfort: body.traumaHandlingComfort ? String(body.traumaHandlingComfort) : null,
      dailyCarePlan: String(body.dailyCarePlan),
      travelPlan: body.travelPlan ? String(body.travelPlan) : null,
      activities: Array.isArray(body.activities) ? body.activities as string[] : [],
      petPreferences: Array.isArray(body.petPreferences) ? body.petPreferences as string[] : [],
      trainingExpectations: Array.isArray(body.trainingExpectations) ? body.trainingExpectations as string[] : [],
      confirmed: Boolean(body.confirmed),
    });

    await db
      .update(usersTable)
      .set({ isOnboardingCompleted: true })
      .where(eq(usersTable.id, req.userId));

    res.json({ success: true, message: "Onboarding completed" });
  } catch (err) {
    req.log.error({ err }, "Error submitting onboarding");
    res.status(500).json({ error: "internal_error", message: "Failed to submit onboarding" });
  }
});

export default router;

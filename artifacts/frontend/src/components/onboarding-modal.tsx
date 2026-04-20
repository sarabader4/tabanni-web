import React, { useState } from "react";
import { X, ChevronRight, ChevronLeft, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth, apiFetch } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface OnboardingModalProps {
  onClose: () => void;
}

const ACTIVITY_OPTION_KEYS: { value: string; key: string }[] = [
  { value: "Morning walks", key: "profile.actMorningWalks" },
  { value: "Evening runs", key: "profile.actEveningRuns" },
  { value: "Hiking", key: "profile.actHiking" },
  { value: "Swimming", key: "profile.actSwimming" },
  { value: "Dog park visits", key: "profile.actDogPark" },
  { value: "Training sessions", key: "profile.actTrainingSessions" },
  { value: "Playtime indoors", key: "profile.actPlaytimeIndoors" },
  { value: "Agility sports", key: "profile.actAgilitySports" },
  { value: "Camping", key: "profile.actCamping" },
  { value: "Road trips", key: "profile.actRoadTrips" },
];

const PET_PREFERENCE_OPTION_KEYS: { value: string; key: string }[] = [
  { value: "Dogs", key: "profile.prefDogs" },
  { value: "Cats", key: "profile.prefCats" },
  { value: "Rabbits", key: "profile.prefRabbits" },
  { value: "Birds", key: "profile.prefBirds" },
  { value: "Small animals", key: "profile.prefSmallAnimals" },
  { value: "Senior pets", key: "profile.prefSeniorPets" },
  { value: "Puppies/kittens", key: "profile.prefPuppiesKittens" },
  { value: "Mixed breeds", key: "profile.prefMixedBreeds" },
  { value: "Purebreds", key: "profile.prefPurebreds" },
  { value: "Special needs pets", key: "profile.prefSpecialNeeds" },
];

const TRAINING_EXPECTATION_OPTION_KEYS: { value: string; key: string }[] = [
  { value: "Basic obedience", key: "profile.trainBasicObedience" },
  { value: "House training", key: "profile.trainHouseTraining" },
  { value: "Leash training", key: "profile.trainLeashTraining" },
  { value: "Socialization", key: "profile.trainSocialization" },
  { value: "Advanced commands", key: "profile.trainAdvancedCommands" },
  { value: "Behavioral correction", key: "profile.trainBehavioralCorrection" },
  { value: "Agility training", key: "profile.trainAgilityTraining" },
  { value: "No training expected", key: "profile.trainNoTraining" },
];

const STEP_TITLE_KEYS = [
  "profile.stepPersonalInfo",
  "profile.stepHomeLifestyle",
  "profile.stepPetCare",
  "profile.stepAdoptionIntent",
  "profile.stepActivitiesPrefs",
  "profile.stepCommitments",
];

const STEP_FIELDS = [
  ["areaOfResidence", "homeAddress", "occupation", "age", "mainCaregiver"],
  ["homeType", "ownershipType", "yardType", "childrenCount", "householdObjection"],
  ["dayLocation", "nightLocation", "exerciseHours", "currentPets", "previousPetExperience"],
  ["adoptionReason", "financialResponsibility", "monthlyCostEstimation", "breedingIntention", "spayNeuterCommitment"],
  ["activities", "petPreferences", "trainingExpectations"],
  ["allergies", "behaviorTolerance", "traumaHandlingComfort", "dailyCarePlan", "travelPlan", "confirmed"],
];

interface FormData {
  areaOfResidence: string;
  homeAddress: string;
  occupation: string;
  age: string;
  mainCaregiver: string;
  adoptionReason: string;
  financialResponsibility: string;
  childrenCount: string;
  yardType: string;
  dayLocation: string;
  nightLocation: string;
  allergies: string;
  currentPets: string;
  householdObjection: string;
  homeType: string;
  ownershipType: string;
  previousPetExperience: string;
  exerciseHours: string;
  monthlyCostEstimation: string;
  breedingIntention: string;
  spayNeuterCommitment: boolean;
  behaviorTolerance: string;
  traumaHandlingComfort: string;
  dailyCarePlan: string;
  travelPlan: string;
  activities: string[];
  petPreferences: string[];
  trainingExpectations: string[];
  confirmed: boolean;
}

const initialForm: FormData = {
  areaOfResidence: "",
  homeAddress: "",
  occupation: "",
  age: "",
  mainCaregiver: "",
  adoptionReason: "",
  financialResponsibility: "",
  childrenCount: "0",
  yardType: "",
  dayLocation: "",
  nightLocation: "",
  allergies: "",
  currentPets: "",
  householdObjection: "",
  homeType: "",
  ownershipType: "",
  previousPetExperience: "",
  exerciseHours: "",
  monthlyCostEstimation: "",
  breedingIntention: "",
  spayNeuterCommitment: false,
  behaviorTolerance: "",
  traumaHandlingComfort: "",
  dailyCarePlan: "",
  travelPlan: "",
  activities: [],
  petPreferences: [],
  trainingExpectations: [],
  confirmed: false,
};

type FormErrors = Partial<Record<keyof FormData, string>>;

function validateStep(step: number, form: FormData, t: (key: string) => string): FormErrors {
  const errors: FormErrors = {};
  if (step === 0) {
    if (!form.areaOfResidence.trim()) errors.areaOfResidence = t("profile.errRequired");
    if (!form.homeAddress.trim()) errors.homeAddress = t("profile.errRequired");
    if (!form.occupation.trim()) errors.occupation = t("profile.errRequired");
    if (!form.age || Number(form.age) < 18) errors.age = t("profile.errAge18");
    if (!form.mainCaregiver.trim()) errors.mainCaregiver = t("profile.errRequired");
  }
  if (step === 1) {
    if (!form.homeType) errors.homeType = t("profile.errRequired");
    if (!form.ownershipType) errors.ownershipType = t("profile.errRequired");
    if (!form.yardType) errors.yardType = t("profile.errRequired");
    if (!form.householdObjection) errors.householdObjection = t("profile.errRequired");
  }
  if (step === 2) {
    if (!form.dayLocation.trim()) errors.dayLocation = t("profile.errRequired");
    if (!form.nightLocation.trim()) errors.nightLocation = t("profile.errRequired");
    if (form.exerciseHours === "" || Number(form.exerciseHours) < 0) errors.exerciseHours = t("profile.errRequired");
  }
  if (step === 3) {
    if (!form.adoptionReason.trim()) errors.adoptionReason = t("profile.errRequired");
    if (!form.financialResponsibility.trim()) errors.financialResponsibility = t("profile.errRequired");
    if (form.monthlyCostEstimation === "" || Number(form.monthlyCostEstimation) < 0) errors.monthlyCostEstimation = t("profile.errRequired");
    if (!form.breedingIntention) errors.breedingIntention = t("profile.errRequired");
  }
  if (step === 4) {
    if (form.activities.length === 0) errors.activities = t("profile.errSelectActivity");
    if (form.petPreferences.length === 0) errors.petPreferences = t("profile.errSelectPreference");
    if (form.trainingExpectations.length === 0) errors.trainingExpectations = t("profile.errSelectTraining");
  }
  if (step === 5) {
    if (!form.dailyCarePlan.trim()) errors.dailyCarePlan = t("profile.errRequired");
    if (!form.confirmed) errors.confirmed = t("profile.errConfirm");
  }
  return errors;
}

const fieldClass = "w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all";
const labelClass = "block text-sm font-semibold text-foreground mb-1";
const errorClass = "text-xs text-red-500 mt-1";

export default function OnboardingModal({ onClose }: OnboardingModalProps) {
  const { markOnboardingComplete, skipOnboarding } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (key: keyof FormData, value: FormData[keyof FormData]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const toggleArray = (key: "activities" | "petPreferences" | "trainingExpectations", value: string) => {
    setForm(prev => {
      const arr = prev[key] as string[];
      const next = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
      return { ...prev, [key]: next };
    });
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const handleNext = () => {
    const errs = validateStep(step, form, t);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setErrors({});
    setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    const errs = validateStep(step, form, t);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setIsSubmitting(true);
    try {
      await apiFetch("/api/user/onboarding", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          age: Number(form.age),
          childrenCount: Number(form.childrenCount),
          exerciseHours: Number(form.exerciseHours),
          monthlyCostEstimation: Number(form.monthlyCostEstimation),
        }),
      });
      setSubmitted(true);
      toast({ title: t("onboarding.toastTitle"), description: t("onboarding.toastDesc") });
      setTimeout(() => {
        markOnboardingComplete();
      }, 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      if (msg.includes("already")) {
        toast({ title: t("onboarding.alreadyTitle"), description: t("onboarding.alreadyDesc") });
        markOnboardingComplete();
      } else {
        toast({ title: t("common.error"), description: msg, variant: "destructive" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    skipOnboarding();
    onClose();
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-[#FFFAF7] rounded-3xl p-12 text-center max-w-md w-full shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-secondary" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">{t("onboarding.allSet")}</h2>
          <p className="text-muted-foreground">{t("onboarding.profileComplete")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#FFFAF7] rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-4 shrink-0">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">{t("onboarding.title")}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {t("onboarding.stepProgress", { n: step + 1, total: STEP_TITLE_KEYS.length, title: t(STEP_TITLE_KEYS[step]) })}
            </p>
          </div>
          <button
            onClick={handleSkip}
            className="p-2 rounded-full hover:bg-muted/50 text-muted-foreground transition-colors"
            aria-label={t("onboarding.skipForNow")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-8 pb-4 shrink-0">
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / STEP_TITLE_KEYS.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {STEP_TITLE_KEYS.map((key, i) => (
              <span
                key={i}
                className={`text-xs font-medium hidden sm:block transition-colors ${i <= step ? "text-primary" : "text-muted-foreground"}`}
              >
                {t(key)}
              </span>
            ))}
          </div>
        </div>

        {/* Form content */}
        <div className="flex-1 overflow-y-auto px-8 pb-4">
          {step === 0 && (
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>{t("profile.areaOfResidence")} *</label>
                <input className={fieldClass} placeholder={t("profile.placeholderArea")} value={form.areaOfResidence} onChange={e => set("areaOfResidence", e.target.value)} />
                {errors.areaOfResidence && <p className={errorClass}>{errors.areaOfResidence}</p>}
              </div>
              <div>
                <label className={labelClass}>{t("profile.homeAddress")} *</label>
                <input className={fieldClass} placeholder={t("profile.placeholderAddress")} value={form.homeAddress} onChange={e => set("homeAddress", e.target.value)} />
                {errors.homeAddress && <p className={errorClass}>{errors.homeAddress}</p>}
              </div>
              <div>
                <label className={labelClass}>{t("profile.occupation")} *</label>
                <input className={fieldClass} placeholder={t("profile.placeholderOccupation")} value={form.occupation} onChange={e => set("occupation", e.target.value)} />
                {errors.occupation && <p className={errorClass}>{errors.occupation}</p>}
              </div>
              <div>
                <label className={labelClass}>{t("profile.labelAge")} *</label>
                <input type="number" min={18} max={120} className={fieldClass} placeholder={t("profile.placeholderAge18")} value={form.age} onChange={e => set("age", e.target.value)} />
                {errors.age && <p className={errorClass}>{errors.age}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>{t("profile.mainCaregiver")} *</label>
                <select className={fieldClass} value={form.mainCaregiver} onChange={e => set("mainCaregiver", e.target.value)}>
                  <option value="">{t("profile.selectDots")}</option>
                  <option value="Myself">{t("profile.optMyself")}</option>
                  <option value="Spouse / Partner">{t("profile.optSpousePartner")}</option>
                  <option value="Family member">{t("profile.optFamilyMember")}</option>
                  <option value="Shared responsibility">{t("profile.optSharedResp")}</option>
                </select>
                {errors.mainCaregiver && <p className={errorClass}>{errors.mainCaregiver}</p>}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>{t("profile.homeType")} *</label>
                <select className={fieldClass} value={form.homeType} onChange={e => set("homeType", e.target.value)}>
                  <option value="">{t("profile.selectDots")}</option>
                  <option value="Apartment">{t("profile.optApartment")}</option>
                  <option value="Villa">{t("profile.optVilla")}</option>
                  <option value="House">{t("profile.optHouse")}</option>
                  <option value="Townhouse">{t("profile.optTownhouse")}</option>
                  <option value="Studio">{t("profile.optStudio")}</option>
                </select>
                {errors.homeType && <p className={errorClass}>{errors.homeType}</p>}
              </div>
              <div>
                <label className={labelClass}>{t("profile.ownershipType")} *</label>
                <select className={fieldClass} value={form.ownershipType} onChange={e => set("ownershipType", e.target.value)}>
                  <option value="">{t("profile.selectDots")}</option>
                  <option value="Owner">{t("profile.optOwner")}</option>
                  <option value="Renting">{t("profile.optRenting")}</option>
                  <option value="Family home">{t("profile.optFamilyHome")}</option>
                </select>
                {errors.ownershipType && <p className={errorClass}>{errors.ownershipType}</p>}
              </div>
              <div>
                <label className={labelClass}>{t("profile.yardOutdoorSpace")} *</label>
                <select className={fieldClass} value={form.yardType} onChange={e => set("yardType", e.target.value)}>
                  <option value="">{t("profile.selectDots")}</option>
                  <option value="No outdoor space">{t("profile.optNoOutdoor")}</option>
                  <option value="Small balcony">{t("profile.optSmallBalcony")}</option>
                  <option value="Large balcony">{t("profile.optLargeBalcony")}</option>
                  <option value="Small yard">{t("profile.optSmallYard")}</option>
                  <option value="Large yard / garden">{t("profile.optLargeYard")}</option>
                </select>
                {errors.yardType && <p className={errorClass}>{errors.yardType}</p>}
              </div>
              <div>
                <label className={labelClass}>{t("profile.numberOfChildren")}</label>
                <input type="number" min={0} className={fieldClass} value={form.childrenCount} onChange={e => set("childrenCount", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>{t("profile.labelHouseholdObjection")} *</label>
                <select className={fieldClass} value={form.householdObjection} onChange={e => set("householdObjection", e.target.value)}>
                  <option value="">{t("profile.selectDots")}</option>
                  <option value="No, everyone agrees">{t("profile.optNoObjection")}</option>
                  <option value="Some are hesitant but open">{t("profile.optHesitant")}</option>
                  <option value="Yes, there may be resistance">{t("profile.optResistance")}</option>
                </select>
                {errors.householdObjection && <p className={errorClass}>{errors.householdObjection}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>{t("profile.labelDayLocation")} *</label>
                <select className={fieldClass} value={form.dayLocation} onChange={e => set("dayLocation", e.target.value)}>
                  <option value="">{t("profile.selectDots")}</option>
                  <option value="Indoors with family">{t("profile.optIndoorsFamily")}</option>
                  <option value="Indoors alone">{t("profile.optIndoorsAlone")}</option>
                  <option value="Outdoors in yard">{t("profile.optOutdoorsYard")}</option>
                  <option value="Mix of indoor/outdoor">{t("profile.optMixIndoor")}</option>
                </select>
                {errors.dayLocation && <p className={errorClass}>{errors.dayLocation}</p>}
              </div>
              <div>
                <label className={labelClass}>{t("profile.labelNightLocation")} *</label>
                <select className={fieldClass} value={form.nightLocation} onChange={e => set("nightLocation", e.target.value)}>
                  <option value="">{t("profile.selectDots")}</option>
                  <option value="In bedroom">{t("profile.optBedroom")}</option>
                  <option value="In living room">{t("profile.optLivingRoom")}</option>
                  <option value="In crate">{t("profile.optCrate")}</option>
                  <option value="Outdoors">{t("profile.optOutdoors")}</option>
                  <option value="Dedicated pet room">{t("profile.optPetRoom")}</option>
                </select>
                {errors.nightLocation && <p className={errorClass}>{errors.nightLocation}</p>}
              </div>
              <div>
                <label className={labelClass}>{t("profile.exerciseHoursDay")} *</label>
                <input type="number" min={0} max={24} className={fieldClass} placeholder={t("profile.placeholderExercise")} value={form.exerciseHours} onChange={e => set("exerciseHours", e.target.value)} />
                {errors.exerciseHours && <p className={errorClass}>{errors.exerciseHours}</p>}
              </div>
              <div>
                <label className={labelClass}>{t("profile.currentPets")}</label>
                <input className={fieldClass} placeholder={t("profile.placeholderCurrentPets")} value={form.currentPets} onChange={e => set("currentPets", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>{t("profile.previousPetExperience")}</label>
                <textarea rows={3} className={fieldClass} placeholder={t("profile.placeholderPrevExperience")} value={form.previousPetExperience} onChange={e => set("previousPetExperience", e.target.value)} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className={labelClass}>{t("profile.labelAdoptionReason")} *</label>
                <textarea rows={3} className={fieldClass} placeholder={t("profile.placeholderAdoptReason")} value={form.adoptionReason} onChange={e => set("adoptionReason", e.target.value)} />
                {errors.adoptionReason && <p className={errorClass}>{errors.adoptionReason}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>{t("profile.labelFinancialResp")} *</label>
                <select className={fieldClass} value={form.financialResponsibility} onChange={e => set("financialResponsibility", e.target.value)}>
                  <option value="">{t("profile.selectDots")}</option>
                  <option value="Myself">{t("profile.optMyself")}</option>
                  <option value="Partner / Spouse">{t("profile.optPartnerSpouse")}</option>
                  <option value="Shared">{t("profile.optShared")}</option>
                  <option value="Family">{t("profile.optFamily")}</option>
                </select>
                {errors.financialResponsibility && <p className={errorClass}>{errors.financialResponsibility}</p>}
              </div>
              <div>
                <label className={labelClass}>{t("profile.labelMonthlyCost")} *</label>
                <input type="number" min={0} className={fieldClass} placeholder={t("profile.placeholderMonthlyCost")} value={form.monthlyCostEstimation} onChange={e => set("monthlyCostEstimation", e.target.value)} />
                {errors.monthlyCostEstimation && <p className={errorClass}>{errors.monthlyCostEstimation}</p>}
              </div>
              <div>
                <label className={labelClass}>{t("profile.labelBreedingIntent")} *</label>
                <select className={fieldClass} value={form.breedingIntention} onChange={e => set("breedingIntention", e.target.value)}>
                  <option value="">{t("profile.selectDots")}</option>
                  <option value="No, not planning to breed">{t("profile.optNoBreed")}</option>
                  <option value="Possibly in the future">{t("profile.optMaybeBreed")}</option>
                  <option value="Yes, planning to breed">{t("profile.optYesBreed")}</option>
                </select>
                {errors.breedingIntention && <p className={errorClass}>{errors.breedingIntention}</p>}
              </div>
              <div className="sm:col-span-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="spay"
                  checked={form.spayNeuterCommitment}
                  onChange={e => set("spayNeuterCommitment", e.target.checked)}
                  className="w-4 h-4 accent-[#FA8D29]"
                />
                <label htmlFor="spay" className="text-sm text-foreground">
                  {t("profile.labelSpayCommit")}
                </label>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <label className={labelClass}>{t("profile.labelActivities")} *</label>
                {errors.activities && <p className={errorClass}>{errors.activities}</p>}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  {ACTIVITY_OPTION_KEYS.map(({ value, key }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleArray("activities", value)}
                      className={`text-left px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                        form.activities.includes(value)
                          ? "bg-primary text-white border-primary"
                          : "bg-white border-border hover:border-primary/50"
                      }`}
                    >
                      {t(key)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>{t("profile.labelPetPrefs")} *</label>
                {errors.petPreferences && <p className={errorClass}>{errors.petPreferences}</p>}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  {PET_PREFERENCE_OPTION_KEYS.map(({ value, key }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleArray("petPreferences", value)}
                      className={`text-left px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                        form.petPreferences.includes(value)
                          ? "bg-secondary text-white border-secondary"
                          : "bg-white border-border hover:border-secondary/50"
                      }`}
                    >
                      {t(key)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>{t("profile.labelTrainingExp")} *</label>
                {errors.trainingExpectations && <p className={errorClass}>{errors.trainingExpectations}</p>}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  {TRAINING_EXPECTATION_OPTION_KEYS.map(({ value, key }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleArray("trainingExpectations", value)}
                      className={`text-left px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                        form.trainingExpectations.includes(value)
                          ? "bg-[#333E48] text-white border-[#333E48]"
                          : "bg-white border-border hover:border-[#333E48]/50"
                      }`}
                    >
                      {t(key)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>{t("profile.allergies")}</label>
                <input className={fieldClass} placeholder={t("profile.placeholderAllergies")} value={form.allergies} onChange={e => set("allergies", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>{t("profile.labelBehaviorTolerance")}</label>
                <select className={fieldClass} value={form.behaviorTolerance} onChange={e => set("behaviorTolerance", e.target.value)}>
                  <option value="">{t("profile.selectDots")}</option>
                  <option value="None — I prefer a well-behaved pet">{t("profile.optBehavNone")}</option>
                  <option value="Minor issues (chewing, jumping)">{t("profile.optBehavMinor")}</option>
                  <option value="Moderate issues with proper training">{t("profile.optBehavModerate")}</option>
                  <option value="Significant behavioral challenges">{t("profile.optBehavSignificant")}</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>{t("profile.labelTraumaComfort")}</label>
                <select className={fieldClass} value={form.traumaHandlingComfort} onChange={e => set("traumaHandlingComfort", e.target.value)}>
                  <option value="">{t("profile.selectDots")}</option>
                  <option value="Not comfortable">{t("profile.optTraumaNot")}</option>
                  <option value="Somewhat comfortable">{t("profile.optTraumaSomewhat")}</option>
                  <option value="Comfortable with guidance">{t("profile.optTraumaComfort")}</option>
                  <option value="Very comfortable">{t("profile.optTraumaVery")}</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>{t("profile.travelPlan")}</label>
                <input className={fieldClass} placeholder={t("profile.placeholderTravelPlan")} value={form.travelPlan} onChange={e => set("travelPlan", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>{t("profile.dailyCarePlan")} *</label>
                <textarea rows={3} className={fieldClass} placeholder={t("profile.placeholderDailyCare")} value={form.dailyCarePlan} onChange={e => set("dailyCarePlan", e.target.value)} />
                {errors.dailyCarePlan && <p className={errorClass}>{errors.dailyCarePlan}</p>}
              </div>
              <div className="sm:col-span-2 bg-primary/5 border border-primary/20 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="confirmed"
                    checked={form.confirmed}
                    onChange={e => set("confirmed", e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-[#FA8D29]"
                  />
                  <label htmlFor="confirmed" className="text-sm text-foreground leading-relaxed">
                    {t("profile.labelConfirm")}
                  </label>
                </div>
                {errors.confirmed && <p className={errorClass}>{errors.confirmed}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-border shrink-0">
          <div className="flex items-center gap-3">
            {step > 0 ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border hover:bg-muted/50 text-sm font-semibold transition-colors"
              >
                <ChevronLeft className="w-4 h-4 rtl:rotate-180" /> {t("common.back")}
              </button>
            ) : (
              <button
                onClick={handleSkip}
                className="text-sm text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors"
              >
                {t("onboarding.skipForNow")}
              </button>
            )}
          </div>

          {step < STEP_TITLE_KEYS.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
            >
              {t("common.next")} <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !form.confirmed}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {t("onboarding.submitApp")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

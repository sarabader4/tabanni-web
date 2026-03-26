import React, { useState } from "react";
import { X, ChevronRight, ChevronLeft, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth, apiFetch } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

interface OnboardingModalProps {
  onClose: () => void;
}

const ACTIVITY_OPTIONS = [
  "Morning walks", "Evening runs", "Hiking", "Swimming", "Dog park visits",
  "Training sessions", "Playtime indoors", "Agility sports", "Camping", "Road trips",
];

const PET_PREFERENCE_OPTIONS = [
  "Dogs", "Cats", "Rabbits", "Birds", "Small animals",
  "Senior pets", "Puppies/kittens", "Mixed breeds", "Purebreds", "Special needs pets",
];

const TRAINING_EXPECTATION_OPTIONS = [
  "Basic obedience", "House training", "Leash training", "Socialization",
  "Advanced commands", "Behavioral correction", "Agility training", "No training expected",
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

const STEPS = [
  { title: "Personal Info", fields: ["areaOfResidence", "homeAddress", "occupation", "age", "mainCaregiver"] },
  { title: "Home & Lifestyle", fields: ["homeType", "ownershipType", "yardType", "childrenCount", "householdObjection"] },
  { title: "Pet Care", fields: ["dayLocation", "nightLocation", "exerciseHours", "currentPets", "previousPetExperience"] },
  { title: "Adoption Intent", fields: ["adoptionReason", "financialResponsibility", "monthlyCostEstimation", "breedingIntention", "spayNeuterCommitment"] },
  { title: "Activities & Preferences", fields: ["activities", "petPreferences", "trainingExpectations"] },
  { title: "Commitments", fields: ["allergies", "behaviorTolerance", "traumaHandlingComfort", "dailyCarePlan", "travelPlan", "confirmed"] },
];

type FormErrors = Partial<Record<keyof FormData, string>>;

function validateStep(step: number, form: FormData): FormErrors {
  const errors: FormErrors = {};
  if (step === 0) {
    if (!form.areaOfResidence.trim()) errors.areaOfResidence = "Required";
    if (!form.homeAddress.trim()) errors.homeAddress = "Required";
    if (!form.occupation.trim()) errors.occupation = "Required";
    if (!form.age || Number(form.age) < 18) errors.age = "Must be at least 18";
    if (!form.mainCaregiver.trim()) errors.mainCaregiver = "Required";
  }
  if (step === 1) {
    if (!form.homeType) errors.homeType = "Required";
    if (!form.ownershipType) errors.ownershipType = "Required";
    if (!form.yardType) errors.yardType = "Required";
    if (!form.householdObjection) errors.householdObjection = "Required";
  }
  if (step === 2) {
    if (!form.dayLocation.trim()) errors.dayLocation = "Required";
    if (!form.nightLocation.trim()) errors.nightLocation = "Required";
    if (form.exerciseHours === "" || Number(form.exerciseHours) < 0) errors.exerciseHours = "Required";
  }
  if (step === 3) {
    if (!form.adoptionReason.trim()) errors.adoptionReason = "Required";
    if (!form.financialResponsibility.trim()) errors.financialResponsibility = "Required";
    if (form.monthlyCostEstimation === "" || Number(form.monthlyCostEstimation) < 0) errors.monthlyCostEstimation = "Required";
    if (!form.breedingIntention) errors.breedingIntention = "Required";
  }
  if (step === 4) {
    if (form.activities.length === 0) errors.activities = "Select at least one activity";
    if (form.petPreferences.length === 0) errors.petPreferences = "Select at least one preference";
  }
  if (step === 5) {
    if (!form.dailyCarePlan.trim()) errors.dailyCarePlan = "Required";
    if (!form.confirmed) errors.confirmed = "You must confirm to proceed";
  }
  return errors;
}

const fieldClass = "w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all";
const labelClass = "block text-sm font-semibold text-foreground mb-1";
const errorClass = "text-xs text-red-500 mt-1";

export default function OnboardingModal({ onClose }: OnboardingModalProps) {
  const { markOnboardingComplete, skipOnboarding } = useAuth();
  const { toast } = useToast();
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
    const errs = validateStep(step, form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setErrors({});
    setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    const errs = validateStep(step, form);
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
      toast({ title: "Onboarding complete!", description: "You can now submit adoption and foster requests." });
      setTimeout(() => {
        markOnboardingComplete();
      }, 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      if (msg.includes("already")) {
        toast({ title: "Already submitted", description: "Your onboarding form has already been submitted." });
        markOnboardingComplete();
      } else {
        toast({ title: "Error", description: msg, variant: "destructive" });
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
        <div className="bg-[#FFF8F3] rounded-3xl p-12 text-center max-w-md w-full shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-secondary" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">All set!</h2>
          <p className="text-muted-foreground">Your adoption profile is complete. You're ready to submit adoption and foster requests.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#FFF8F3] rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-4 shrink-0">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Adoption Readiness Form</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Step {step + 1} of {STEPS.length} — {STEPS[step].title}</p>
          </div>
          <button
            onClick={handleSkip}
            className="p-2 rounded-full hover:bg-muted/50 text-muted-foreground transition-colors"
            aria-label="Skip"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-8 pb-4 shrink-0">
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {STEPS.map((s, i) => (
              <span
                key={i}
                className={`text-xs font-medium hidden sm:block transition-colors ${i <= step ? "text-primary" : "text-muted-foreground"}`}
              >
                {s.title}
              </span>
            ))}
          </div>
        </div>

        {/* Form content */}
        <div className="flex-1 overflow-y-auto px-8 pb-4">
          {step === 0 && (
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Area of Residence *</label>
                <input className={fieldClass} placeholder="e.g. Amman, Khalda" value={form.areaOfResidence} onChange={e => set("areaOfResidence", e.target.value)} />
                {errors.areaOfResidence && <p className={errorClass}>{errors.areaOfResidence}</p>}
              </div>
              <div>
                <label className={labelClass}>Home Address *</label>
                <input className={fieldClass} placeholder="Street, neighborhood" value={form.homeAddress} onChange={e => set("homeAddress", e.target.value)} />
                {errors.homeAddress && <p className={errorClass}>{errors.homeAddress}</p>}
              </div>
              <div>
                <label className={labelClass}>Occupation *</label>
                <input className={fieldClass} placeholder="e.g. Software Engineer" value={form.occupation} onChange={e => set("occupation", e.target.value)} />
                {errors.occupation && <p className={errorClass}>{errors.occupation}</p>}
              </div>
              <div>
                <label className={labelClass}>Age *</label>
                <input type="number" min={18} max={120} className={fieldClass} placeholder="Must be 18+" value={form.age} onChange={e => set("age", e.target.value)} />
                {errors.age && <p className={errorClass}>{errors.age}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Main Caregiver *</label>
                <select className={fieldClass} value={form.mainCaregiver} onChange={e => set("mainCaregiver", e.target.value)}>
                  <option value="">Select...</option>
                  <option>Myself</option>
                  <option>Spouse / Partner</option>
                  <option>Family member</option>
                  <option>Shared responsibility</option>
                </select>
                {errors.mainCaregiver && <p className={errorClass}>{errors.mainCaregiver}</p>}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Home Type *</label>
                <select className={fieldClass} value={form.homeType} onChange={e => set("homeType", e.target.value)}>
                  <option value="">Select...</option>
                  <option>Apartment</option>
                  <option>Villa</option>
                  <option>House</option>
                  <option>Townhouse</option>
                  <option>Studio</option>
                </select>
                {errors.homeType && <p className={errorClass}>{errors.homeType}</p>}
              </div>
              <div>
                <label className={labelClass}>Ownership Type *</label>
                <select className={fieldClass} value={form.ownershipType} onChange={e => set("ownershipType", e.target.value)}>
                  <option value="">Select...</option>
                  <option>Owner</option>
                  <option>Renting</option>
                  <option>Family home</option>
                </select>
                {errors.ownershipType && <p className={errorClass}>{errors.ownershipType}</p>}
              </div>
              <div>
                <label className={labelClass}>Yard / Outdoor Space *</label>
                <select className={fieldClass} value={form.yardType} onChange={e => set("yardType", e.target.value)}>
                  <option value="">Select...</option>
                  <option>No outdoor space</option>
                  <option>Small balcony</option>
                  <option>Large balcony</option>
                  <option>Small yard</option>
                  <option>Large yard / garden</option>
                </select>
                {errors.yardType && <p className={errorClass}>{errors.yardType}</p>}
              </div>
              <div>
                <label className={labelClass}>Number of Children in Home</label>
                <input type="number" min={0} className={fieldClass} value={form.childrenCount} onChange={e => set("childrenCount", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Any household member object to having a pet? *</label>
                <select className={fieldClass} value={form.householdObjection} onChange={e => set("householdObjection", e.target.value)}>
                  <option value="">Select...</option>
                  <option>No, everyone agrees</option>
                  <option>Some are hesitant but open</option>
                  <option>Yes, there may be resistance</option>
                </select>
                {errors.householdObjection && <p className={errorClass}>{errors.householdObjection}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Where will the pet spend daytime? *</label>
                <select className={fieldClass} value={form.dayLocation} onChange={e => set("dayLocation", e.target.value)}>
                  <option value="">Select...</option>
                  <option>Indoors with family</option>
                  <option>Indoors alone</option>
                  <option>Outdoors in yard</option>
                  <option>Mix of indoor/outdoor</option>
                </select>
                {errors.dayLocation && <p className={errorClass}>{errors.dayLocation}</p>}
              </div>
              <div>
                <label className={labelClass}>Where will the pet sleep at night? *</label>
                <select className={fieldClass} value={form.nightLocation} onChange={e => set("nightLocation", e.target.value)}>
                  <option value="">Select...</option>
                  <option>In bedroom</option>
                  <option>In living room</option>
                  <option>In crate</option>
                  <option>Outdoors</option>
                  <option>Dedicated pet room</option>
                </select>
                {errors.nightLocation && <p className={errorClass}>{errors.nightLocation}</p>}
              </div>
              <div>
                <label className={labelClass}>Exercise hours per day for the pet *</label>
                <input type="number" min={0} max={24} className={fieldClass} placeholder="e.g. 2" value={form.exerciseHours} onChange={e => set("exerciseHours", e.target.value)} />
                {errors.exerciseHours && <p className={errorClass}>{errors.exerciseHours}</p>}
              </div>
              <div>
                <label className={labelClass}>Current pets at home</label>
                <input className={fieldClass} placeholder="e.g. 1 dog, 2 cats (or None)" value={form.currentPets} onChange={e => set("currentPets", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Previous pet experience</label>
                <textarea rows={3} className={fieldClass} placeholder="Describe your experience with pets..." value={form.previousPetExperience} onChange={e => set("previousPetExperience", e.target.value)} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className={labelClass}>Why do you want to adopt? *</label>
                <textarea rows={3} className={fieldClass} placeholder="Share your motivation..." value={form.adoptionReason} onChange={e => set("adoptionReason", e.target.value)} />
                {errors.adoptionReason && <p className={errorClass}>{errors.adoptionReason}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Who will be financially responsible for the pet? *</label>
                <select className={fieldClass} value={form.financialResponsibility} onChange={e => set("financialResponsibility", e.target.value)}>
                  <option value="">Select...</option>
                  <option>Myself</option>
                  <option>Partner / Spouse</option>
                  <option>Shared</option>
                  <option>Family</option>
                </select>
                {errors.financialResponsibility && <p className={errorClass}>{errors.financialResponsibility}</p>}
              </div>
              <div>
                <label className={labelClass}>Estimated monthly cost (JD) *</label>
                <input type="number" min={0} className={fieldClass} placeholder="e.g. 50" value={form.monthlyCostEstimation} onChange={e => set("monthlyCostEstimation", e.target.value)} />
                {errors.monthlyCostEstimation && <p className={errorClass}>{errors.monthlyCostEstimation}</p>}
              </div>
              <div>
                <label className={labelClass}>Intention to breed? *</label>
                <select className={fieldClass} value={form.breedingIntention} onChange={e => set("breedingIntention", e.target.value)}>
                  <option value="">Select...</option>
                  <option>No, not planning to breed</option>
                  <option>Possibly in the future</option>
                  <option>Yes, planning to breed</option>
                </select>
                {errors.breedingIntention && <p className={errorClass}>{errors.breedingIntention}</p>}
              </div>
              <div className="sm:col-span-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="spay"
                  checked={form.spayNeuterCommitment}
                  onChange={e => set("spayNeuterCommitment", e.target.checked)}
                  className="w-4 h-4 accent-[#FF6B35]"
                />
                <label htmlFor="spay" className="text-sm text-foreground">
                  I commit to spaying/neutering the pet if not already done
                </label>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Activities you enjoy (select all that apply) *</label>
                {errors.activities && <p className={errorClass}>{errors.activities}</p>}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  {ACTIVITY_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleArray("activities", opt)}
                      className={`text-left px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                        form.activities.includes(opt)
                          ? "bg-primary text-white border-primary"
                          : "bg-white border-border hover:border-primary/50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>Pet preferences (select all that apply) *</label>
                {errors.petPreferences && <p className={errorClass}>{errors.petPreferences}</p>}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  {PET_PREFERENCE_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleArray("petPreferences", opt)}
                      className={`text-left px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                        form.petPreferences.includes(opt)
                          ? "bg-secondary text-white border-secondary"
                          : "bg-white border-border hover:border-secondary/50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>Training expectations (select all that apply)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  {TRAINING_EXPECTATION_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleArray("trainingExpectations", opt)}
                      className={`text-left px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                        form.trainingExpectations.includes(opt)
                          ? "bg-[#1E2A3A] text-white border-[#1E2A3A]"
                          : "bg-white border-border hover:border-[#1E2A3A]/50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Do you or anyone have allergies to animals?</label>
                <input className={fieldClass} placeholder="Describe or write None" value={form.allergies} onChange={e => set("allergies", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Behavior challenges you can tolerate</label>
                <select className={fieldClass} value={form.behaviorTolerance} onChange={e => set("behaviorTolerance", e.target.value)}>
                  <option value="">Select...</option>
                  <option>None — I prefer a well-behaved pet</option>
                  <option>Minor issues (chewing, jumping)</option>
                  <option>Moderate issues with proper training</option>
                  <option>Significant behavioral challenges</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Comfort handling a pet with trauma</label>
                <select className={fieldClass} value={form.traumaHandlingComfort} onChange={e => set("traumaHandlingComfort", e.target.value)}>
                  <option value="">Select...</option>
                  <option>Not comfortable</option>
                  <option>Somewhat comfortable</option>
                  <option>Comfortable with guidance</option>
                  <option>Very comfortable</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Travel plan for your pet *</label>
                <input className={fieldClass} placeholder="e.g. Stay with family, pet hotel..." value={form.travelPlan} onChange={e => set("travelPlan", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Daily care plan *</label>
                <textarea rows={3} className={fieldClass} placeholder="Describe your daily routine for the pet..." value={form.dailyCarePlan} onChange={e => set("dailyCarePlan", e.target.value)} />
                {errors.dailyCarePlan && <p className={errorClass}>{errors.dailyCarePlan}</p>}
              </div>
              <div className="sm:col-span-2 bg-primary/5 border border-primary/20 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="confirmed"
                    checked={form.confirmed}
                    onChange={e => set("confirmed", e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-[#FF6B35]"
                  />
                  <label htmlFor="confirmed" className="text-sm text-foreground leading-relaxed">
                    I confirm that all information provided is accurate and that I understand the responsibilities of pet adoption/fostering. I commit to providing a safe, loving, and permanent home.
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
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <button
                onClick={handleSkip}
                className="text-sm text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors"
              >
                Skip for now
              </button>
            )}
          </div>

          {step < STEPS.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !form.confirmed}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Submit Application
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

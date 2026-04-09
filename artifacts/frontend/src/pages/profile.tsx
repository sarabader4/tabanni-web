import { useState, useEffect, useRef, useMemo } from "react";
import {
  User, PawPrint, FileText, Heart, Bell, Users, MapPin, Edit2, Loader2, CheckCircle2, Clock, XCircle, ChevronDown, Search, X, Eye, EyeOff, LogOut, Plus, Camera, Inbox, Trash2, ChevronRight, ChevronLeft, ClipboardList, Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Link, useLocation } from "wouter";
import {
  useGetMyProfile, useUpdateMyProfile, useGetMyPets, useGetMyApplications, useGetMyFavourites, useListLostFoundReports, useDeleteLostFoundReport, useResolveLostFoundReport, useCreatePet, useDeletePet, useUpdatePet, useAiGenerateDescription, type Pet,
} from "@workspace/api-client-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import i18next from "i18next";

interface PetNotification {
  id: number;
  userId: number;
  petId: number | null;
  petName: string | null;
  status: "accepted" | "rejected";
  message: string;
  read: boolean;
  createdAt: string;
}

function useGetMyNotifications() {
  return useQuery<PetNotification[]>({
    queryKey: ["/api/users/me/notifications"],
    queryFn: async () => {
      const res = await fetch("/api/users/me/notifications", { credentials: "include" });
      if (!res.ok) throw new Error(i18next.t("profile.failedFetchNotifications"));
      return res.json();
    },
  });
}

function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/users/me/notifications/${id}/read`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) throw new Error(i18next.t("profile.failedMarkRead"));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/me/notifications"] });
    },
  });
}

interface UserProfile {
  id: number;
  userId: number;
  areaOfResidence: string;
  homeAddress: string;
  occupation: string;
  age: number;
  mainCaregiver: string;
  adoptionReason: string;
  financialResponsibility: string;
  childrenCount: number;
  yardType: string;
  dayLocation: string;
  nightLocation: string;
  allergies: string | null;
  currentPets: string | null;
  householdObjection: string;
  homeType: string;
  ownershipType: string;
  previousPetExperience: string | null;
  exerciseHours: number;
  monthlyCostEstimation: number;
  breedingIntention: string;
  spayNeuterCommitment: boolean;
  behaviorTolerance: string | null;
  traumaHandlingComfort: string | null;
  dailyCarePlan: string;
  travelPlan: string | null;
  activities: string[];
  petPreferences: string[];
  trainingExpectations: string[];
  confirmed: boolean;
  createdAt: string;
}

interface IncomingRequest {
  id: number;
  petId: number;
  requesterId: number;
  message: string | null;
  status: "pending" | "approved" | "rejected";
  petName: string | null;
  petImageUrl: string | null;
  requesterName: string | null;
  requesterCity: string | null;
  createdAt: string;
  requesterProfile: UserProfile | null;
}

function useGetIncomingAdoptionRequests() {
  return useQuery<IncomingRequest[]>({
    queryKey: ["/api/adoption-requests/incoming"],
    queryFn: async () => {
      const res = await fetch("/api/adoption-requests/incoming", { credentials: "include" });
      if (!res.ok) throw new Error(i18next.t("profile.failedFetchIncomingAdoption"));
      return res.json();
    },
  });
}

function useGetIncomingFosterRequests() {
  return useQuery<IncomingRequest[]>({
    queryKey: ["/api/foster-requests/incoming"],
    queryFn: async () => {
      const res = await fetch("/api/foster-requests/incoming", { credentials: "include" });
      if (!res.ok) throw new Error(i18next.t("profile.failedFetchIncomingFoster"));
      return res.json();
    },
  });
}

function useUpdateAdoptionRequestStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "approved" | "rejected" }) => {
      const res = await fetch(`/api/adoption-requests/${id}/status`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw Object.assign(new Error(body.message ?? i18next.t("profile.failedUpdateAdoptionStatus")), { code: body.error });
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/adoption-requests/incoming"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/me/pets"] });
    },
  });
}

function useUpdateFosterRequestStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "approved" | "rejected" }) => {
      const res = await fetch(`/api/foster-requests/${id}/status`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw Object.assign(new Error(body.message ?? i18next.t("profile.failedUpdateFosterStatus")), { code: body.error });
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/foster-requests/incoming"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/me/pets"] });
    },
  });
}

function useDeleteAdoptionRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/adoption-requests/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(i18next.t("profile.failedDeleteAdoption"));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/me/applications"] });
    },
  });
}

function useDeleteFosterRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/foster-requests/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(i18next.t("profile.failedDeleteFoster"));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/me/applications"] });
    },
  });
}

function useUpdateAdoptionRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, message }: { id: number; message: string }) => {
      const res = await fetch(`/api/adoption-requests/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error(i18next.t("profile.failedUpdateAdoption"));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/me/applications"] });
    },
  });
}

function useUpdateFosterRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, message }: { id: number; message: string }) => {
      const res = await fetch(`/api/foster-requests/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error(i18next.t("profile.failedUpdateFoster"));
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/me/applications"] });
    },
  });
}

interface RequesterProfileModalProps {
  request: IncomingRequest;
  requestType: "adoption" | "foster";
  onClose: () => void;
  onAccept: () => void;
  onReject: () => void;
  isLoading?: boolean;
}

function RequesterProfileModal({ request, requestType, onClose, onAccept, onReject, isLoading }: RequesterProfileModalProps) {
  const { t } = useTranslation();
  const profile = request.requesterProfile;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-[#1E2A3A]">{t("profile.adoptionReadinessTitle")} — {request.requesterName || t("profile.requester")}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {requestType === "adoption" ? t("profile.adoption") : t("profile.foster")} {t("profile.requestFor")} {request.petName}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Pet banner */}
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3">
            <img
              src={request.petImageUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200"}
              alt={request.petName || "Pet"}
              className="w-12 h-12 rounded-xl object-cover shrink-0"
            />
            <div>
              <p className="text-xs font-semibold text-blue-600 mb-0.5 uppercase tracking-wide">{t("profile.petRequested")}</p>
              <p className="font-bold text-sm text-[#1E2A3A]">{request.petName || t("profile.unknownPet")}</p>
              <p className="text-xs text-gray-500 capitalize">{requestType === "adoption" ? t("profile.adoption") : t("profile.foster")} {t("profile.requestFor")}</p>
            </div>
          </div>

          {request.message && (
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-orange-700 mb-1">{t("profile.messageFromRequester")}</p>
              <p className="text-sm text-gray-700">{request.message}</p>
            </div>
          )}

          {!profile ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">{t("profile.noReadinessProfile")}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              {[
                [t("profile.areaOfResidence"), profile.areaOfResidence],
                [t("profile.homeAddress"), profile.homeAddress],
                [t("profile.occupation"), profile.occupation],
                [t("petDetail.age"), String(profile.age)],
                [t("profile.mainCaregiver"), profile.mainCaregiver],
                [t("profile.homeType"), profile.homeType],
                [t("profile.ownershipType"), profile.ownershipType],
                [t("profile.yardOutdoorSpace"), profile.yardType],
                [t("profile.numberOfChildren"), String(profile.childrenCount)],
                [t("profile.householdObjection"), profile.householdObjection],
                [t("profile.daytimePetLocation"), profile.dayLocation],
                [t("profile.nighttimePetLocation"), profile.nightLocation],
                [t("profile.exerciseHoursDay"), `${profile.exerciseHours} hr${profile.exerciseHours !== 1 ? "s" : ""}`],
                [t("profile.currentPets"), profile.currentPets || "—"],
                [t("profile.monthlyCostEstimate"), `${profile.monthlyCostEstimation} JD`],
                [t("profile.financialResponsibility"), profile.financialResponsibility],
                [t("profile.breedingIntention"), profile.breedingIntention],
                [t("profile.spayNeuterCommitment"), profile.spayNeuterCommitment ? t("common.yes") : t("common.no")],
                [t("profile.behaviorTolerance"), profile.behaviorTolerance || "—"],
                [t("profile.traumaHandlingComfort"), profile.traumaHandlingComfort || "—"],
                [t("profile.allergies"), profile.allergies || "—"],
              ].map(([label, value]) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-500 mb-0.5">{label}</p>
                  <p className="text-sm text-[#1E2A3A]">{value}</p>
                </div>
              ))}

              <div className="sm:col-span-2 bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-gray-500 mb-0.5">{t("profile.adoptionReason")}</p>
                <p className="text-sm text-[#1E2A3A]">{profile.adoptionReason}</p>
              </div>
              <div className="sm:col-span-2 bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-gray-500 mb-0.5">{t("profile.dailyCarePlan")}</p>
                <p className="text-sm text-[#1E2A3A]">{profile.dailyCarePlan}</p>
              </div>
              {profile.previousPetExperience && (
                <div className="sm:col-span-2 bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-500 mb-0.5">{t("profile.previousPetExperience")}</p>
                  <p className="text-sm text-[#1E2A3A]">{profile.previousPetExperience}</p>
                </div>
              )}
              {profile.travelPlan && (
                <div className="sm:col-span-2 bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-500 mb-0.5">{t("profile.travelPlan")}</p>
                  <p className="text-sm text-[#1E2A3A]">{profile.travelPlan}</p>
                </div>
              )}

              {(profile.activities?.length ?? 0) > 0 && (
                <div className="sm:col-span-2 bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-500 mb-2">{t("profile.activities")}</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.activities?.map(a => (
                      <span key={a} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">{a}</span>
                    ))}
                  </div>
                </div>
              )}
              {(profile.petPreferences?.length ?? 0) > 0 && (
                <div className="sm:col-span-2 bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-500 mb-2">{t("profile.petPreferences")}</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.petPreferences?.map(p => (
                      <span key={p} className="px-2 py-0.5 bg-secondary/10 text-secondary rounded-full text-xs font-medium">{p}</span>
                    ))}
                  </div>
                </div>
              )}
              {(profile.trainingExpectations?.length ?? 0) > 0 && (
                <div className="sm:col-span-2 bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-500 mb-2">{t("profile.trainingExpectations")}</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.trainingExpectations?.map(exp => (
                      <span key={exp} className="px-2 py-0.5 bg-[#1E2A3A]/10 text-[#1E2A3A] rounded-full text-xs font-medium">{exp}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {request.status === "pending" && (
          <div className="flex gap-3 p-5 border-t border-gray-100 shrink-0">
            <button
              onClick={onReject}
              disabled={isLoading}
              className="flex-1 py-2.5 border border-red-200 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : t("profile.reject")}
            </button>
            <button
              onClick={onAccept}
              disabled={isLoading}
              className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : t("profile.accept")}
            </button>
          </div>
        )}
        {request.status !== "pending" && (
          <div className="p-5 border-t border-gray-100 shrink-0 text-center">
            <StatusBadge status={request.status} />
            <p className="text-xs text-gray-400 mt-2">{t("profile.requestAlreadyProcessed")} {request.status}.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ReadinessProfileSection() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);
  const [profileData, setProfileData] = useState<ReadinessFormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<ReadinessFormData | null>(null);
  const [editStep, setEditStep] = useState(0);
  const [editErrors, setEditErrors] = useState<ReadinessFormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  const emptyForm: ReadinessFormData = {
    areaOfResidence: "", homeAddress: "", occupation: "", age: "", mainCaregiver: "",
    adoptionReason: "", financialResponsibility: "", childrenCount: "0", yardType: "",
    dayLocation: "", nightLocation: "", allergies: "", currentPets: "", householdObjection: "",
    homeType: "", ownershipType: "", previousPetExperience: "", exerciseHours: "",
    monthlyCostEstimation: "", breedingIntention: "", spayNeuterCommitment: false,
    behaviorTolerance: "", traumaHandlingComfort: "", dailyCarePlan: "", travelPlan: "",
    activities: [], petPreferences: [], trainingExpectations: [], confirmed: false,
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/profile", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      const mapped: ReadinessFormData = {
        areaOfResidence: data.areaOfResidence ?? "",
        homeAddress: data.homeAddress ?? "",
        occupation: data.occupation ?? "",
        age: String(data.age ?? ""),
        mainCaregiver: data.mainCaregiver ?? "",
        adoptionReason: data.adoptionReason ?? "",
        financialResponsibility: data.financialResponsibility ?? "",
        childrenCount: String(data.childrenCount ?? "0"),
        yardType: data.yardType ?? "",
        dayLocation: data.dayLocation ?? "",
        nightLocation: data.nightLocation ?? "",
        allergies: data.allergies ?? "",
        currentPets: data.currentPets ?? "",
        householdObjection: data.householdObjection ?? "",
        homeType: data.homeType ?? "",
        ownershipType: data.ownershipType ?? "",
        previousPetExperience: data.previousPetExperience ?? "",
        exerciseHours: String(data.exerciseHours ?? ""),
        monthlyCostEstimation: String(data.monthlyCostEstimation ?? ""),
        breedingIntention: data.breedingIntention ?? "",
        spayNeuterCommitment: data.spayNeuterCommitment ?? false,
        behaviorTolerance: data.behaviorTolerance ?? "",
        traumaHandlingComfort: data.traumaHandlingComfort ?? "",
        dailyCarePlan: data.dailyCarePlan ?? "",
        travelPlan: data.travelPlan ?? "",
        activities: Array.isArray(data.activities) ? data.activities : [],
        petPreferences: Array.isArray(data.petPreferences) ? data.petPreferences : [],
        trainingExpectations: Array.isArray(data.trainingExpectations) ? data.trainingExpectations : [],
        confirmed: data.confirmed ?? false,
      };
      setProfileData(mapped);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isExpanded) loadProfile();
  }, [isExpanded]);

  const isComplete = Boolean(
    profileData?.areaOfResidence && profileData?.occupation && profileData?.homeType && profileData?.dailyCarePlan
  );

  const startEdit = () => {
    setEditForm(profileData ? { ...profileData } : { ...emptyForm });
    setEditStep(0);
    setEditErrors({});
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditForm(null);
    setEditStep(0);
    setEditErrors({});
  };

  const set = (key: keyof ReadinessFormData, value: ReadinessFormData[keyof ReadinessFormData]) => {
    setEditForm(prev => prev ? { ...prev, [key]: value } : prev);
    setEditErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const toggleArr = (key: "activities" | "petPreferences" | "trainingExpectations", value: string) => {
    setEditForm(prev => {
      if (!prev) return prev;
      const arr = prev[key] as string[];
      return { ...prev, [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
    });
    setEditErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const handleNext = () => {
    if (!editForm) return;
    const errs = validateReadinessStep(editStep, editForm, t);
    if (Object.keys(errs).length > 0) { setEditErrors(errs); return; }
    setEditErrors({});
    setEditStep(s => s + 1);
  };

  const handleBack = () => {
    setEditErrors({});
    setEditStep(s => s - 1);
  };

  const handleSave = async () => {
    if (!editForm) return;
    const errs = validateReadinessStep(editStep, editForm, t);
    if (Object.keys(errs).length > 0) { setEditErrors(errs); return; }
    setIsSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          age: Number(editForm.age),
          childrenCount: Number(editForm.childrenCount),
          exerciseHours: Number(editForm.exerciseHours),
          monthlyCostEstimation: Number(editForm.monthlyCostEstimation),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to save profile");
      }
      queryClient.invalidateQueries({ queryKey: ["/api/users/me/applications"] });
      toast({ title: t("profile.readinessFormSaved") });
      setProfileData({ ...editForm });
      cancelEdit();

      const pendingRaw = sessionStorage.getItem("pendingRequest");
      if (pendingRaw) {
        sessionStorage.removeItem("pendingRequest");
        try {
          const pending = JSON.parse(pendingRaw) as { petId: number; type: "adoption" | "foster" };
          const endpoint = pending.type === "adoption" ? "/api/adoption-requests" : "/api/foster-requests";
          const requestRes = await fetch(endpoint, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ petId: pending.petId, message: pending.type === "adoption" ? "I would love to adopt this pet." : "I would love to foster this pet." }),
          });
          if (requestRes.ok) {
            toast({ title: pending.type === "adoption" ? t("petDetail.adoptionSent") : t("petDetail.fosterSent"), description: t("petDetail.ownerContact") });
            queryClient.invalidateQueries({ queryKey: ["/api/users/me/applications"] });
          } else {
            const errData = await requestRes.json().catch(() => ({}));
            if (errData?.error === "duplicate_request") {
              toast({ title: t("petDetail.requestExists"), description: t("petDetail.requestExistsDesc"), variant: "destructive" });
            } else {
              toast({ title: t("petDetail.error"), description: t("petDetail.failedRequest"), variant: "destructive" });
            }
          }
        } catch {
          toast({ title: t("petDetail.error"), description: t("petDetail.failedRequest"), variant: "destructive" });
        }
      }
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Failed to save", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <button
        onClick={() => setIsExpanded(v => !v)}
        className="w-full flex items-center gap-4 p-4 hover:bg-gray-50/70 transition-colors text-start"
      >
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <ClipboardList className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-[#1E2A3A]">{t("profile.adoptionReadiness")}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {loading ? t("common.loading") : isComplete ? t("profile.readinessCompleted") : t("profile.viewReadinessProfile")}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {profileData && (
            isComplete ? (
              <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                <CheckCircle2 className="w-3 h-3" /> {t("profile.complete")}
              </span>
            ) : (
              <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                <Clock className="w-3 h-3" /> {t("profile.incomplete")}
              </span>
            )
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-100 p-5">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : isEditing && editForm ? (
            <AdoptionReadinessFormContent
              step={editStep}
              profileForm={editForm}
              formErrors={editErrors}
              isSaving={isSaving}
              set={set}
              toggleArr={toggleArr}
              onNext={handleNext}
              onBack={handleBack}
              onSave={handleSave}
              onCancel={cancelEdit}
            />
          ) : !profileData?.areaOfResidence ? (
            <div className="text-center py-8 text-gray-400">
              <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm text-[#1E2A3A] font-semibold mb-1">{t("profile.readinessNotCompleted")}</p>
              <p className="text-xs mb-4">{t("profile.viewReadinessProfile")}</p>
              <button
                onClick={startEdit}
                className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
              >
                {t("profile.editReadinessProfile")}
              </button>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-3 text-sm mb-5">
                {([
                  [t("profile.areaOfResidence"), profileData.areaOfResidence],
                  [t("profile.homeAddress"), profileData.homeAddress],
                  [t("profile.occupation"), profileData.occupation],
                  [t("petDetail.age"), profileData.age],
                  [t("profile.mainCaregiver"), profileData.mainCaregiver],
                  [t("profile.homeType"), profileData.homeType],
                  [t("profile.ownershipType"), profileData.ownershipType],
                  [t("profile.yardOutdoorSpace"), profileData.yardType],
                  [t("profile.numberOfChildren"), profileData.childrenCount],
                  [t("profile.householdObjection"), profileData.householdObjection],
                  [t("profile.daytimePetLocation"), profileData.dayLocation],
                  [t("profile.nighttimePetLocation"), profileData.nightLocation],
                  [t("profile.exerciseHoursDay"), profileData.exerciseHours ? `${profileData.exerciseHours} hrs` : ""],
                  [t("profile.currentPets"), profileData.currentPets || "—"],
                  [t("profile.monthlyCostEstimate"), profileData.monthlyCostEstimation ? `${profileData.monthlyCostEstimation} JD` : ""],
                  [t("profile.financialResponsibility"), profileData.financialResponsibility],
                  [t("profile.breedingIntention"), profileData.breedingIntention],
                  [t("profile.spayNeuterCommitment"), profileData.spayNeuterCommitment ? t("common.yes") : t("common.no")],
                  [t("profile.allergies"), profileData.allergies || "—"],
                  [t("profile.behaviorTolerance"), profileData.behaviorTolerance || "—"],
                  [t("profile.traumaHandlingComfort"), profileData.traumaHandlingComfort || "—"],
                ] as [string, string][]).filter(([, v]) => v).map(([label, value]) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-gray-500 mb-0.5">{label}</p>
                    <p className="text-sm text-[#1E2A3A]">{value}</p>
                  </div>
                ))}

                {profileData.adoptionReason && (
                  <div className="sm:col-span-2 bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-gray-500 mb-0.5">{t("profile.adoptionReason")}</p>
                    <p className="text-sm text-[#1E2A3A]">{profileData.adoptionReason}</p>
                  </div>
                )}
                {profileData.dailyCarePlan && (
                  <div className="sm:col-span-2 bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-gray-500 mb-0.5">{t("profile.dailyCarePlan")}</p>
                    <p className="text-sm text-[#1E2A3A]">{profileData.dailyCarePlan}</p>
                  </div>
                )}
                {profileData.previousPetExperience && (
                  <div className="sm:col-span-2 bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-gray-500 mb-0.5">{t("profile.previousPetExperience")}</p>
                    <p className="text-sm text-[#1E2A3A]">{profileData.previousPetExperience}</p>
                  </div>
                )}
                {(profileData.activities?.length ?? 0) > 0 && (
                  <div className="sm:col-span-2 bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-gray-500 mb-2">{t("profile.activities")}</p>
                    <div className="flex flex-wrap gap-1">
                      {profileData.activities.map(a => (
                        <span key={a} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">{a}</span>
                      ))}
                    </div>
                  </div>
                )}
                {(profileData.petPreferences?.length ?? 0) > 0 && (
                  <div className="sm:col-span-2 bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-gray-500 mb-2">{t("profile.petPreferences")}</p>
                    <div className="flex flex-wrap gap-1">
                      {profileData.petPreferences.map(p => (
                        <span key={p} className="px-2 py-0.5 bg-secondary/10 text-secondary rounded-full text-xs font-medium">{p}</span>
                      ))}
                    </div>
                  </div>
                )}
                {(profileData.trainingExpectations?.length ?? 0) > 0 && (
                  <div className="sm:col-span-2 bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-gray-500 mb-2">{t("profile.trainingExpectations")}</p>
                    <div className="flex flex-wrap gap-1">
                      {profileData.trainingExpectations.map(exp => (
                        <span key={exp} className="px-2 py-0.5 bg-[#1E2A3A]/10 text-[#1E2A3A] rounded-full text-xs font-medium">{exp}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={startEdit}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
                >
                  <Edit2 className="w-4 h-4" /> {t("profile.editReadinessProfile")}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function PetDetailModal({ request, requestType, onClose }: { request: MyRequestItem; requestType: "adoption" | "foster"; onClose: () => void }) {
  const ageLabel = request.petAgeMonths != null
    ? request.petAgeMonths < 12
      ? `${request.petAgeMonths} month${request.petAgeMonths !== 1 ? "s" : ""}`
      : `${Math.floor(request.petAgeMonths / 12)} year${Math.floor(request.petAgeMonths / 12) !== 1 ? "s" : ""}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="relative h-56 shrink-0">
          <img
            src={request.petImageUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600"}
            alt={request.petName || "Pet"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 end-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm"
          >
            <X className="w-4 h-4 text-gray-700" />
          </button>
          <div className="absolute bottom-3 start-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${requestType === "adoption" ? "bg-primary" : "bg-secondary"}`}>
              {requestType === "adoption" ? t("profile.adoptionRequestLabel") : t("profile.fosterRequestLabel")}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h2 className="text-xl font-bold text-[#1E2A3A]">{request.petName || t("profile.unknownPet")}</h2>
            <StatusBadge status={request.status} />
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {request.petType && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-xl text-xs font-semibold text-gray-600 capitalize">
                <PawPrint className="w-3 h-3" /> {request.petType}
              </span>
            )}
            {ageLabel && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-xl text-xs font-semibold text-gray-600">
                <Clock className="w-3 h-3" /> {ageLabel}
              </span>
            )}
            {request.petCity && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-xl text-xs font-semibold text-gray-600">
                <MapPin className="w-3 h-3" /> {request.petCity}
              </span>
            )}
            {request.petGender && (
              <span className="px-3 py-1.5 bg-gray-100 rounded-xl text-xs font-semibold text-gray-600 capitalize">
                {request.petGender}
              </span>
            )}
          </div>

          {request.petStory && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">About</p>
              <p className="text-sm text-gray-700 leading-relaxed">{request.petStory}</p>
            </div>
          )}

          <hr className="border-gray-100 mb-4" />

          <div className="flex items-center justify-between text-xs text-gray-400">
            <p>Request submitted {new Date(request.createdAt).toLocaleDateString()}</p>
            <Link href={`/pets/${request.petId}`} className="text-primary font-semibold hover:underline">
              View full profile →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MyRequestItem {
  id: number;
  petId: number;
  petName: string | null | undefined;
  petImageUrl: string | null | undefined;
  petType: string | null | undefined;
  petBreed: string | null | undefined;
  petAgeMonths: number | null | undefined;
  petGender: string | null | undefined;
  petStory: string | null | undefined;
  petCity: string | null | undefined;
  status: string;
  message: string | null | undefined;
  createdAt: string;
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

const READINESS_STEPS = [
  { title: "profile.stepPersonalInfo", fields: ["areaOfResidence", "homeAddress", "occupation", "age", "mainCaregiver"] },
  { title: "profile.stepHomeLifestyle", fields: ["homeType", "ownershipType", "yardType", "childrenCount", "householdObjection"] },
  { title: "profile.stepPetCare", fields: ["dayLocation", "nightLocation", "exerciseHours", "currentPets", "previousPetExperience"] },
  { title: "profile.stepAdoptionIntent", fields: ["adoptionReason", "financialResponsibility", "monthlyCostEstimation", "breedingIntention", "spayNeuterCommitment"] },
  { title: "profile.stepActivitiesPrefs", fields: ["activities", "petPreferences", "trainingExpectations"] },
  { title: "profile.stepCommitments", fields: ["allergies", "behaviorTolerance", "traumaHandlingComfort", "dailyCarePlan", "travelPlan", "confirmed"] },
];

interface ReadinessFormData {
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

type ReadinessFormErrors = Partial<Record<keyof ReadinessFormData, string>>;

function validateReadinessStep(step: number, form: ReadinessFormData, t: (key: string) => string): ReadinessFormErrors {
  const errors: ReadinessFormErrors = {};
  const req = t("profile.errRequired");
  if (step === 0) {
    if (!form.areaOfResidence.trim()) errors.areaOfResidence = req;
    if (!form.homeAddress.trim()) errors.homeAddress = req;
    if (!form.occupation.trim()) errors.occupation = req;
    if (!form.age || Number(form.age) < 18) errors.age = t("profile.errAge18");
    if (!form.mainCaregiver.trim()) errors.mainCaregiver = req;
  }
  if (step === 1) {
    if (!form.homeType) errors.homeType = req;
    if (!form.ownershipType) errors.ownershipType = req;
    if (!form.yardType) errors.yardType = req;
    if (!form.householdObjection) errors.householdObjection = req;
  }
  if (step === 2) {
    if (!form.dayLocation.trim()) errors.dayLocation = req;
    if (!form.nightLocation.trim()) errors.nightLocation = req;
    if (form.exerciseHours === "" || Number(form.exerciseHours) < 0) errors.exerciseHours = req;
  }
  if (step === 3) {
    if (!form.adoptionReason.trim()) errors.adoptionReason = req;
    if (!form.financialResponsibility.trim()) errors.financialResponsibility = req;
    if (form.monthlyCostEstimation === "" || Number(form.monthlyCostEstimation) < 0) errors.monthlyCostEstimation = req;
    if (!form.breedingIntention) errors.breedingIntention = req;
  }
  if (step === 4) {
    if (form.activities.length === 0) errors.activities = t("profile.errSelectActivity");
    if (form.petPreferences.length === 0) errors.petPreferences = t("profile.errSelectPreference");
    if (form.trainingExpectations.length === 0) errors.trainingExpectations = t("profile.errSelectTraining");
  }
  if (step === 5) {
    if (!form.dailyCarePlan.trim()) errors.dailyCarePlan = req;
    if (!form.confirmed) errors.confirmed = t("profile.errConfirm");
  }
  return errors;
}

const rfFieldClass = "w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all";
const rfLabelClass = "block text-sm font-semibold text-foreground mb-1";
const rfErrorClass = "text-xs text-red-500 mt-1";

interface AdoptionReadinessFormContentProps {
  step: number;
  profileForm: ReadinessFormData;
  formErrors: ReadinessFormErrors;
  isSaving: boolean;
  set: (key: keyof ReadinessFormData, value: ReadinessFormData[keyof ReadinessFormData]) => void;
  toggleArr: (key: "activities" | "petPreferences" | "trainingExpectations", value: string) => void;
  onNext: () => void;
  onBack: () => void;
  onSave: () => void;
  onCancel: () => void;
}

function AdoptionReadinessFormContent({
  step,
  profileForm,
  formErrors,
  isSaving,
  set,
  toggleArr,
  onNext,
  onBack,
  onSave,
  onCancel,
}: AdoptionReadinessFormContentProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-[#FFF8F3] rounded-2xl border border-orange-100">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div>
          <h3 className="font-display text-base font-bold text-[#1E2A3A]">{t("profile.adoptionReadinessFormTitle")}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{t("profile.stepOf", { n: step + 1, total: READINESS_STEPS.length })} — {t(READINESS_STEPS[step].title)}</p>
        </div>
        <button onClick={onCancel} className="p-2 rounded-full hover:bg-muted/50 text-muted-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-5 pb-3">
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / READINESS_STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="px-5 pb-4">
        {step === 0 && (
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className={rfLabelClass}>{t("profile.areaOfResidence")} *</label>
              <input className={rfFieldClass} value={profileForm.areaOfResidence} onChange={e => set("areaOfResidence", e.target.value)} />
              {formErrors.areaOfResidence && <p className={rfErrorClass}>{formErrors.areaOfResidence}</p>}
            </div>
            <div>
              <label className={rfLabelClass}>{t("profile.homeAddress")} *</label>
              <input className={rfFieldClass} value={profileForm.homeAddress} onChange={e => set("homeAddress", e.target.value)} />
              {formErrors.homeAddress && <p className={rfErrorClass}>{formErrors.homeAddress}</p>}
            </div>
            <div>
              <label className={rfLabelClass}>{t("profile.occupation")} *</label>
              <input className={rfFieldClass} value={profileForm.occupation} onChange={e => set("occupation", e.target.value)} />
              {formErrors.occupation && <p className={rfErrorClass}>{formErrors.occupation}</p>}
            </div>
            <div>
              <label className={rfLabelClass}>{t("profile.labelAge")} *</label>
              <input type="number" min={18} max={120} className={rfFieldClass} value={profileForm.age} onChange={e => set("age", e.target.value)} />
              {formErrors.age && <p className={rfErrorClass}>{formErrors.age}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className={rfLabelClass}>{t("profile.mainCaregiver")} *</label>
              <select className={rfFieldClass} value={profileForm.mainCaregiver} onChange={e => set("mainCaregiver", e.target.value)}>
                <option value="">{t("profile.selectDots")}</option>
                <option value="Myself">{t("profile.optMyself")}</option>
                <option value="Spouse / Partner">{t("profile.optSpousePartner")}</option>
                <option value="Family member">{t("profile.optFamilyMember")}</option>
                <option value="Shared responsibility">{t("profile.optSharedResp")}</option>
              </select>
              {formErrors.mainCaregiver && <p className={rfErrorClass}>{formErrors.mainCaregiver}</p>}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className={rfLabelClass}>{t("profile.homeType")} *</label>
              <select className={rfFieldClass} value={profileForm.homeType} onChange={e => set("homeType", e.target.value)}>
                <option value="">{t("profile.selectDots")}</option>
                <option value="Apartment">{t("profile.optApartment")}</option>
                <option value="Villa">{t("profile.optVilla")}</option>
                <option value="House">{t("profile.optHouse")}</option>
                <option value="Townhouse">{t("profile.optTownhouse")}</option>
                <option value="Studio">{t("profile.optStudio")}</option>
              </select>
              {formErrors.homeType && <p className={rfErrorClass}>{formErrors.homeType}</p>}
            </div>
            <div>
              <label className={rfLabelClass}>{t("profile.ownershipType")} *</label>
              <select className={rfFieldClass} value={profileForm.ownershipType} onChange={e => set("ownershipType", e.target.value)}>
                <option value="">{t("profile.selectDots")}</option>
                <option value="Owner">{t("profile.optOwner")}</option>
                <option value="Renting">{t("profile.optRenting")}</option>
                <option value="Family home">{t("profile.optFamilyHome")}</option>
              </select>
              {formErrors.ownershipType && <p className={rfErrorClass}>{formErrors.ownershipType}</p>}
            </div>
            <div>
              <label className={rfLabelClass}>{t("profile.yardOutdoorSpace")} *</label>
              <select className={rfFieldClass} value={profileForm.yardType} onChange={e => set("yardType", e.target.value)}>
                <option value="">{t("profile.selectDots")}</option>
                <option value="No outdoor space">{t("profile.optNoOutdoor")}</option>
                <option value="Small balcony">{t("profile.optSmallBalcony")}</option>
                <option value="Large balcony">{t("profile.optLargeBalcony")}</option>
                <option value="Small yard">{t("profile.optSmallYard")}</option>
                <option value="Large yard / garden">{t("profile.optLargeYard")}</option>
              </select>
              {formErrors.yardType && <p className={rfErrorClass}>{formErrors.yardType}</p>}
            </div>
            <div>
              <label className={rfLabelClass}>{t("profile.numberOfChildren")}</label>
              <input type="number" min={0} className={rfFieldClass} value={profileForm.childrenCount} onChange={e => set("childrenCount", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className={rfLabelClass}>{t("profile.labelHouseholdObjection")} *</label>
              <select className={rfFieldClass} value={profileForm.householdObjection} onChange={e => set("householdObjection", e.target.value)}>
                <option value="">{t("profile.selectDots")}</option>
                <option value="No, everyone agrees">{t("profile.optNoObjection")}</option>
                <option value="Some are hesitant but open">{t("profile.optHesitant")}</option>
                <option value="Yes, there may be resistance">{t("profile.optResistance")}</option>
              </select>
              {formErrors.householdObjection && <p className={rfErrorClass}>{formErrors.householdObjection}</p>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className={rfLabelClass}>{t("profile.labelDayLocation")} *</label>
              <select className={rfFieldClass} value={profileForm.dayLocation} onChange={e => set("dayLocation", e.target.value)}>
                <option value="">{t("profile.selectDots")}</option>
                <option value="Indoors with family">{t("profile.optIndoorsFamily")}</option>
                <option value="Indoors alone">{t("profile.optIndoorsAlone")}</option>
                <option value="Outdoors in yard">{t("profile.optOutdoorsYard")}</option>
                <option value="Mix of indoor/outdoor">{t("profile.optMixIndoor")}</option>
              </select>
              {formErrors.dayLocation && <p className={rfErrorClass}>{formErrors.dayLocation}</p>}
            </div>
            <div>
              <label className={rfLabelClass}>{t("profile.labelNightLocation")} *</label>
              <select className={rfFieldClass} value={profileForm.nightLocation} onChange={e => set("nightLocation", e.target.value)}>
                <option value="">{t("profile.selectDots")}</option>
                <option value="In bedroom">{t("profile.optBedroom")}</option>
                <option value="In living room">{t("profile.optLivingRoom")}</option>
                <option value="In crate">{t("profile.optCrate")}</option>
                <option value="Outdoors">{t("profile.optOutdoors")}</option>
                <option value="Dedicated pet room">{t("profile.optPetRoom")}</option>
              </select>
              {formErrors.nightLocation && <p className={rfErrorClass}>{formErrors.nightLocation}</p>}
            </div>
            <div>
              <label className={rfLabelClass}>{t("profile.exerciseHoursDay")} *</label>
              <input type="number" min={0} max={24} className={rfFieldClass} value={profileForm.exerciseHours} onChange={e => set("exerciseHours", e.target.value)} />
              {formErrors.exerciseHours && <p className={rfErrorClass}>{formErrors.exerciseHours}</p>}
            </div>
            <div>
              <label className={rfLabelClass}>{t("profile.currentPets")}</label>
              <input className={rfFieldClass} value={profileForm.currentPets} onChange={e => set("currentPets", e.target.value)} placeholder={t("profile.placeholderCurrentPets")} />
            </div>
            <div className="sm:col-span-2">
              <label className={rfLabelClass}>{t("profile.previousPetExperience")}</label>
              <textarea rows={3} className={rfFieldClass} value={profileForm.previousPetExperience} onChange={e => set("previousPetExperience", e.target.value)} placeholder={t("profile.placeholderPrevExperience")} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className={rfLabelClass}>{t("profile.labelAdoptionReason")} *</label>
              <textarea rows={3} className={rfFieldClass} value={profileForm.adoptionReason} onChange={e => set("adoptionReason", e.target.value)} />
              {formErrors.adoptionReason && <p className={rfErrorClass}>{formErrors.adoptionReason}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className={rfLabelClass}>{t("profile.labelFinancialResp")} *</label>
              <select className={rfFieldClass} value={profileForm.financialResponsibility} onChange={e => set("financialResponsibility", e.target.value)}>
                <option value="">{t("profile.selectDots")}</option>
                <option value="Myself">{t("profile.optMyself")}</option>
                <option value="Partner / Spouse">{t("profile.optPartnerSpouse")}</option>
                <option value="Shared">{t("profile.optShared")}</option>
                <option value="Family">{t("profile.optFamily")}</option>
              </select>
              {formErrors.financialResponsibility && <p className={rfErrorClass}>{formErrors.financialResponsibility}</p>}
            </div>
            <div>
              <label className={rfLabelClass}>{t("profile.labelMonthlyCost")} *</label>
              <input type="number" min={0} className={rfFieldClass} value={profileForm.monthlyCostEstimation} onChange={e => set("monthlyCostEstimation", e.target.value)} />
              {formErrors.monthlyCostEstimation && <p className={rfErrorClass}>{formErrors.monthlyCostEstimation}</p>}
            </div>
            <div>
              <label className={rfLabelClass}>{t("profile.labelBreedingIntent")} *</label>
              <select className={rfFieldClass} value={profileForm.breedingIntention} onChange={e => set("breedingIntention", e.target.value)}>
                <option value="">{t("profile.selectDots")}</option>
                <option value="No, not planning to breed">{t("profile.optNoBreed")}</option>
                <option value="Possibly in the future">{t("profile.optMaybeBreed")}</option>
                <option value="Yes, planning to breed">{t("profile.optYesBreed")}</option>
              </select>
              {formErrors.breedingIntention && <p className={rfErrorClass}>{formErrors.breedingIntention}</p>}
            </div>
            <div className="sm:col-span-2 flex items-center gap-3">
              <input type="checkbox" id="spay-readiness-inline" checked={profileForm.spayNeuterCommitment} onChange={e => set("spayNeuterCommitment", e.target.checked)} className="w-4 h-4 accent-[#FF6B35]" />
              <label htmlFor="spay-readiness-inline" className="text-sm text-foreground">{t("profile.labelSpayCommit")}</label>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <label className={rfLabelClass}>{t("profile.labelActivities")} *</label>
              {formErrors.activities && <p className={rfErrorClass}>{formErrors.activities}</p>}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {ACTIVITY_OPTION_KEYS.map(({ value, key }) => (
                  <button key={value} type="button" onClick={() => toggleArr("activities", value)}
                    className={`text-start px-3 py-2 rounded-xl text-sm font-medium border transition-all ${profileForm.activities.includes(value) ? "bg-primary text-white border-primary" : "bg-white border-border hover:border-primary/50"}`}>
                    {t(key)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={rfLabelClass}>{t("profile.labelPetPrefs")} *</label>
              {formErrors.petPreferences && <p className={rfErrorClass}>{formErrors.petPreferences}</p>}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {PET_PREFERENCE_OPTION_KEYS.map(({ value, key }) => (
                  <button key={value} type="button" onClick={() => toggleArr("petPreferences", value)}
                    className={`text-start px-3 py-2 rounded-xl text-sm font-medium border transition-all ${profileForm.petPreferences.includes(value) ? "bg-secondary text-white border-secondary" : "bg-white border-border hover:border-secondary/50"}`}>
                    {t(key)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={rfLabelClass}>{t("profile.labelTrainingExp")} *</label>
              {formErrors.trainingExpectations && <p className={rfErrorClass}>{formErrors.trainingExpectations}</p>}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {TRAINING_EXPECTATION_OPTION_KEYS.map(({ value, key }) => (
                  <button key={value} type="button" onClick={() => toggleArr("trainingExpectations", value)}
                    className={`text-start px-3 py-2 rounded-xl text-sm font-medium border transition-all ${profileForm.trainingExpectations.includes(value) ? "bg-[#1E2A3A] text-white border-[#1E2A3A]" : "bg-white border-border hover:border-[#1E2A3A]/50"}`}>
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
              <label className={rfLabelClass}>{t("profile.allergies")}</label>
              <input className={rfFieldClass} value={profileForm.allergies} onChange={e => set("allergies", e.target.value)} placeholder={t("profile.placeholderAllergies")} />
            </div>
            <div>
              <label className={rfLabelClass}>{t("profile.labelBehaviorTolerance")}</label>
              <select className={rfFieldClass} value={profileForm.behaviorTolerance} onChange={e => set("behaviorTolerance", e.target.value)}>
                <option value="">{t("profile.selectDots")}</option>
                <option value="None — I prefer a well-behaved pet">{t("profile.optBehavNone")}</option>
                <option value="Minor issues (chewing, jumping)">{t("profile.optBehavMinor")}</option>
                <option value="Moderate issues with proper training">{t("profile.optBehavModerate")}</option>
                <option value="Significant behavioral challenges">{t("profile.optBehavSignificant")}</option>
              </select>
            </div>
            <div>
              <label className={rfLabelClass}>{t("profile.labelTraumaComfort")}</label>
              <select className={rfFieldClass} value={profileForm.traumaHandlingComfort} onChange={e => set("traumaHandlingComfort", e.target.value)}>
                <option value="">{t("profile.selectDots")}</option>
                <option value="Not comfortable">{t("profile.optTraumaNot")}</option>
                <option value="Somewhat comfortable">{t("profile.optTraumaSomewhat")}</option>
                <option value="Comfortable with guidance">{t("profile.optTraumaComfort")}</option>
                <option value="Very comfortable">{t("profile.optTraumaVery")}</option>
              </select>
            </div>
            <div>
              <label className={rfLabelClass}>{t("profile.travelPlan")}</label>
              <input className={rfFieldClass} value={profileForm.travelPlan} onChange={e => set("travelPlan", e.target.value)} placeholder={t("profile.placeholderTravelPlan")} />
            </div>
            <div className="sm:col-span-2">
              <label className={rfLabelClass}>{t("profile.dailyCarePlan")} *</label>
              <textarea rows={3} className={rfFieldClass} value={profileForm.dailyCarePlan} onChange={e => set("dailyCarePlan", e.target.value)} placeholder={t("profile.placeholderDailyCare")} />
              {formErrors.dailyCarePlan && <p className={rfErrorClass}>{formErrors.dailyCarePlan}</p>}
            </div>
            <div className="sm:col-span-2 bg-primary/5 border border-primary/20 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <input type="checkbox" id="confirmed-readiness-inline" checked={profileForm.confirmed} onChange={e => set("confirmed", e.target.checked)} className="w-4 h-4 mt-0.5 accent-[#FF6B35]" />
                <label htmlFor="confirmed-readiness-inline" className="text-sm text-foreground leading-relaxed">
                  {t("profile.labelConfirm")}
                </label>
              </div>
              {formErrors.confirmed && <p className={rfErrorClass}>{formErrors.confirmed}</p>}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-5 py-4 border-t border-border">
        <div>
          {step > 0 && (
            <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted/50 text-sm font-semibold transition-colors">
              <ChevronLeft className="w-4 h-4 rtl:rotate-180" /> {t("common.back")}
            </button>
          )}
        </div>
        {step < READINESS_STEPS.length - 1 ? (
          <button onClick={onNext} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all">
            {t("common.next")} <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        ) : (
          <button onClick={onSave} disabled={isSaving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all disabled:opacity-50">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {t("profile.saveForm")}
          </button>
        )}
      </div>
    </div>
  );
}

interface MyRequestDetailModalProps {
  request: MyRequestItem;
  requestType: "adoption" | "foster";
  onClose: () => void;
  onDeleted: () => void;
}

function MyRequestDetailModal({ request, requestType, onClose, onDeleted }: MyRequestDetailModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [profileForm, setProfileForm] = useState<ReadinessFormData | null>(null);
  const [formErrors, setFormErrors] = useState<ReadinessFormErrors>({});
  const [requestMessage, setRequestMessage] = useState<string>(request.message ?? "");
  const [profileLoading, setProfileLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const deleteAdoption = useDeleteAdoptionRequest();
  const deleteFoster = useDeleteFosterRequest();

  const isPending = request.status === "pending";
  const isDeleting = deleteAdoption.isPending || deleteFoster.isPending;

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/user/profile", { credentials: "include" });
        if (!res.ok) {
          setProfileForm({
            areaOfResidence: "", homeAddress: "", occupation: "", age: "", mainCaregiver: "",
            adoptionReason: "", financialResponsibility: "", childrenCount: "0", yardType: "",
            dayLocation: "", nightLocation: "", allergies: "", currentPets: "", householdObjection: "",
            homeType: "", ownershipType: "", previousPetExperience: "", exerciseHours: "",
            monthlyCostEstimation: "", breedingIntention: "", spayNeuterCommitment: false,
            behaviorTolerance: "", traumaHandlingComfort: "", dailyCarePlan: "", travelPlan: "",
            activities: [], petPreferences: [], trainingExpectations: [], confirmed: false,
          });
          return;
        }
        const data = await res.json();
        setProfileForm({
          areaOfResidence: data.areaOfResidence ?? "",
          homeAddress: data.homeAddress ?? "",
          occupation: data.occupation ?? "",
          age: String(data.age ?? ""),
          mainCaregiver: data.mainCaregiver ?? "",
          adoptionReason: data.adoptionReason ?? "",
          financialResponsibility: data.financialResponsibility ?? "",
          childrenCount: String(data.childrenCount ?? "0"),
          yardType: data.yardType ?? "",
          dayLocation: data.dayLocation ?? "",
          nightLocation: data.nightLocation ?? "",
          allergies: data.allergies ?? "",
          currentPets: data.currentPets ?? "",
          householdObjection: data.householdObjection ?? "",
          homeType: data.homeType ?? "",
          ownershipType: data.ownershipType ?? "",
          previousPetExperience: data.previousPetExperience ?? "",
          exerciseHours: String(data.exerciseHours ?? ""),
          monthlyCostEstimation: String(data.monthlyCostEstimation ?? ""),
          breedingIntention: data.breedingIntention ?? "",
          spayNeuterCommitment: data.spayNeuterCommitment ?? false,
          behaviorTolerance: data.behaviorTolerance ?? "",
          traumaHandlingComfort: data.traumaHandlingComfort ?? "",
          dailyCarePlan: data.dailyCarePlan ?? "",
          travelPlan: data.travelPlan ?? "",
          activities: Array.isArray(data.activities) ? data.activities : [],
          petPreferences: Array.isArray(data.petPreferences) ? data.petPreferences : [],
          trainingExpectations: Array.isArray(data.trainingExpectations) ? data.trainingExpectations : [],
          confirmed: data.confirmed ?? false,
        });
      } finally {
        setProfileLoading(false);
      }
    }
    loadProfile();
  }, []);

  const set = (key: keyof ReadinessFormData, value: ReadinessFormData[keyof ReadinessFormData]) => {
    setProfileForm(prev => prev ? { ...prev, [key]: value } : prev);
    setFormErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const toggleArr = (key: "activities" | "petPreferences" | "trainingExpectations", value: string) => {
    setProfileForm(prev => {
      if (!prev) return prev;
      const arr = prev[key] as string[];
      return { ...prev, [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
    });
    setFormErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const handleNext = () => {
    if (!profileForm) return;
    const errs = validateReadinessStep(step, profileForm, t);
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    setFormErrors({});
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setFormErrors({});
    setStep(s => s - 1);
  };

  const handleSave = async () => {
    if (!profileForm) return;
    const errs = validateReadinessStep(step, profileForm, t);
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    setIsSaving(true);
    try {
      const reqPath = requestType === "adoption" ? "adoption-requests" : "foster-requests";
      const [profileRes, requestRes] = await Promise.all([
        fetch("/api/user/profile", {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...profileForm,
            age: Number(profileForm.age),
            childrenCount: Number(profileForm.childrenCount),
            exerciseHours: Number(profileForm.exerciseHours),
            monthlyCostEstimation: Number(profileForm.monthlyCostEstimation),
          }),
        }),
        fetch(`/api/${reqPath}/${request.id}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: requestMessage }),
        }),
      ]);
      if (!profileRes.ok) {
        const err = await profileRes.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to save profile");
      }
      if (!requestRes.ok) {
        const err = await requestRes.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to update request");
      }
      queryClient.invalidateQueries({ queryKey: ["/api/users/me/applications"] });
      toast({ title: t("profile.requestUpdated") });
      onClose();
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Failed to save", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (requestType === "adoption") {
        await deleteAdoption.mutateAsync(request.id);
      } else {
        await deleteFoster.mutateAsync(request.id);
      }
      toast({ title: t("profile.requestDeletedSuccess") });
      onDeleted();
    } catch {
      toast({ title: t("profile.deleteRequestFailed"), variant: "destructive" });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#FFF8F3] rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-3 shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <img
                src={request.petImageUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200"}
                alt={request.petName || "Pet"}
                className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
              />
              <div>
                <h2 className="font-display text-lg font-bold text-[#1E2A3A]">
                  {requestType === "adoption" ? t("profile.adoption") : t("profile.foster")} — {request.petName || t("petDetail.unknown")}
                </h2>
                <div className="flex items-center gap-2">
                  <StatusBadge status={request.status} />
                  {!isPending && <span className="text-xs text-gray-400">{t("profile.readOnlyNote")}</span>}
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{t("profile.stepOf", { n: step + 1, total: READINESS_STEPS.length })} — {t(READINESS_STEPS[step].title)}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted/50 text-muted-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-3 shrink-0">
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / READINESS_STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {profileLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : profileForm && (
            <>
              {step === 0 && (
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className={rfLabelClass}>{t("profile.labelMessageOwner")}</label>
                    <textarea
                      rows={3}
                      className={rfFieldClass}
                      disabled={!isPending}
                      value={requestMessage}
                      onChange={e => setRequestMessage(e.target.value)}
                      placeholder={t("profile.placeholderMessageOwner")}
                    />
                    <p className="text-xs text-muted-foreground mt-1">{t("profile.hintMessageOwner")}</p>
                  </div>
                  <div>
                    <label className={rfLabelClass}>{t("profile.areaOfResidence")} *</label>
                    <input className={rfFieldClass} disabled={!isPending} value={profileForm.areaOfResidence} onChange={e => set("areaOfResidence", e.target.value)} />
                    {formErrors.areaOfResidence && <p className={rfErrorClass}>{formErrors.areaOfResidence}</p>}
                  </div>
                  <div>
                    <label className={rfLabelClass}>{t("profile.homeAddress")} *</label>
                    <input className={rfFieldClass} disabled={!isPending} value={profileForm.homeAddress} onChange={e => set("homeAddress", e.target.value)} />
                    {formErrors.homeAddress && <p className={rfErrorClass}>{formErrors.homeAddress}</p>}
                  </div>
                  <div>
                    <label className={rfLabelClass}>{t("profile.occupation")} *</label>
                    <input className={rfFieldClass} disabled={!isPending} value={profileForm.occupation} onChange={e => set("occupation", e.target.value)} />
                    {formErrors.occupation && <p className={rfErrorClass}>{formErrors.occupation}</p>}
                  </div>
                  <div>
                    <label className={rfLabelClass}>{t("profile.labelAge")} *</label>
                    <input type="number" min={18} max={120} className={rfFieldClass} disabled={!isPending} value={profileForm.age} onChange={e => set("age", e.target.value)} />
                    {formErrors.age && <p className={rfErrorClass}>{formErrors.age}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className={rfLabelClass}>{t("profile.mainCaregiver")} *</label>
                    <select className={rfFieldClass} disabled={!isPending} value={profileForm.mainCaregiver} onChange={e => set("mainCaregiver", e.target.value)}>
                      <option value="">{t("profile.selectDots")}</option>
                      <option value="Myself">{t("profile.optMyself")}</option>
                      <option value="Spouse / Partner">{t("profile.optSpousePartner")}</option>
                      <option value="Family member">{t("profile.optFamilyMember")}</option>
                      <option value="Shared responsibility">{t("profile.optSharedResp")}</option>
                    </select>
                    {formErrors.mainCaregiver && <p className={rfErrorClass}>{formErrors.mainCaregiver}</p>}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className={rfLabelClass}>{t("profile.homeType")} *</label>
                    <select className={rfFieldClass} disabled={!isPending} value={profileForm.homeType} onChange={e => set("homeType", e.target.value)}>
                      <option value="">{t("profile.selectDots")}</option>
                      <option value="Apartment">{t("profile.optApartment")}</option>
                      <option value="Villa">{t("profile.optVilla")}</option>
                      <option value="House">{t("profile.optHouse")}</option>
                      <option value="Townhouse">{t("profile.optTownhouse")}</option>
                      <option value="Studio">{t("profile.optStudio")}</option>
                    </select>
                    {formErrors.homeType && <p className={rfErrorClass}>{formErrors.homeType}</p>}
                  </div>
                  <div>
                    <label className={rfLabelClass}>{t("profile.ownershipType")} *</label>
                    <select className={rfFieldClass} disabled={!isPending} value={profileForm.ownershipType} onChange={e => set("ownershipType", e.target.value)}>
                      <option value="">{t("profile.selectDots")}</option>
                      <option value="Owner">{t("profile.optOwner")}</option>
                      <option value="Renting">{t("profile.optRenting")}</option>
                      <option value="Family home">{t("profile.optFamilyHome")}</option>
                    </select>
                    {formErrors.ownershipType && <p className={rfErrorClass}>{formErrors.ownershipType}</p>}
                  </div>
                  <div>
                    <label className={rfLabelClass}>{t("profile.yardOutdoorSpace")} *</label>
                    <select className={rfFieldClass} disabled={!isPending} value={profileForm.yardType} onChange={e => set("yardType", e.target.value)}>
                      <option value="">{t("profile.selectDots")}</option>
                      <option value="No outdoor space">{t("profile.optNoOutdoor")}</option>
                      <option value="Small balcony">{t("profile.optSmallBalcony")}</option>
                      <option value="Large balcony">{t("profile.optLargeBalcony")}</option>
                      <option value="Small yard">{t("profile.optSmallYard")}</option>
                      <option value="Large yard / garden">{t("profile.optLargeYard")}</option>
                    </select>
                    {formErrors.yardType && <p className={rfErrorClass}>{formErrors.yardType}</p>}
                  </div>
                  <div>
                    <label className={rfLabelClass}>{t("profile.numberOfChildren")}</label>
                    <input type="number" min={0} className={rfFieldClass} disabled={!isPending} value={profileForm.childrenCount} onChange={e => set("childrenCount", e.target.value)} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={rfLabelClass}>{t("profile.labelHouseholdObjection")} *</label>
                    <select className={rfFieldClass} disabled={!isPending} value={profileForm.householdObjection} onChange={e => set("householdObjection", e.target.value)}>
                      <option value="">{t("profile.selectDots")}</option>
                      <option value="No, everyone agrees">{t("profile.optNoObjection")}</option>
                      <option value="Some are hesitant but open">{t("profile.optHesitant")}</option>
                      <option value="Yes, there may be resistance">{t("profile.optResistance")}</option>
                    </select>
                    {formErrors.householdObjection && <p className={rfErrorClass}>{formErrors.householdObjection}</p>}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className={rfLabelClass}>{t("profile.labelDayLocation")} *</label>
                    <select className={rfFieldClass} disabled={!isPending} value={profileForm.dayLocation} onChange={e => set("dayLocation", e.target.value)}>
                      <option value="">{t("profile.selectDots")}</option>
                      <option value="Indoors with family">{t("profile.optIndoorsFamily")}</option>
                      <option value="Indoors alone">{t("profile.optIndoorsAlone")}</option>
                      <option value="Outdoors in yard">{t("profile.optOutdoorsYard")}</option>
                      <option value="Mix of indoor/outdoor">{t("profile.optMixIndoor")}</option>
                    </select>
                    {formErrors.dayLocation && <p className={rfErrorClass}>{formErrors.dayLocation}</p>}
                  </div>
                  <div>
                    <label className={rfLabelClass}>{t("profile.labelNightLocation")} *</label>
                    <select className={rfFieldClass} disabled={!isPending} value={profileForm.nightLocation} onChange={e => set("nightLocation", e.target.value)}>
                      <option value="">{t("profile.selectDots")}</option>
                      <option value="In bedroom">{t("profile.optBedroom")}</option>
                      <option value="In living room">{t("profile.optLivingRoom")}</option>
                      <option value="In crate">{t("profile.optCrate")}</option>
                      <option value="Outdoors">{t("profile.optOutdoors")}</option>
                      <option value="Dedicated pet room">{t("profile.optPetRoom")}</option>
                    </select>
                    {formErrors.nightLocation && <p className={rfErrorClass}>{formErrors.nightLocation}</p>}
                  </div>
                  <div>
                    <label className={rfLabelClass}>{t("profile.exerciseHoursDay")} *</label>
                    <input type="number" min={0} max={24} className={rfFieldClass} disabled={!isPending} value={profileForm.exerciseHours} onChange={e => set("exerciseHours", e.target.value)} />
                    {formErrors.exerciseHours && <p className={rfErrorClass}>{formErrors.exerciseHours}</p>}
                  </div>
                  <div>
                    <label className={rfLabelClass}>{t("profile.currentPets")}</label>
                    <input className={rfFieldClass} disabled={!isPending} value={profileForm.currentPets} onChange={e => set("currentPets", e.target.value)} placeholder={t("profile.placeholderCurrentPets")} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={rfLabelClass}>{t("profile.previousPetExperience")}</label>
                    <textarea rows={3} className={rfFieldClass} disabled={!isPending} value={profileForm.previousPetExperience} onChange={e => set("previousPetExperience", e.target.value)} placeholder={t("profile.placeholderPrevExperience")} />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className={rfLabelClass}>{t("profile.labelAdoptionReason")} *</label>
                    <textarea rows={3} className={rfFieldClass} disabled={!isPending} value={profileForm.adoptionReason} onChange={e => set("adoptionReason", e.target.value)} />
                    {formErrors.adoptionReason && <p className={rfErrorClass}>{formErrors.adoptionReason}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className={rfLabelClass}>{t("profile.labelFinancialResp")} *</label>
                    <select className={rfFieldClass} disabled={!isPending} value={profileForm.financialResponsibility} onChange={e => set("financialResponsibility", e.target.value)}>
                      <option value="">{t("profile.selectDots")}</option>
                      <option value="Myself">{t("profile.optMyself")}</option>
                      <option value="Partner / Spouse">{t("profile.optPartnerSpouse")}</option>
                      <option value="Shared">{t("profile.optShared")}</option>
                      <option value="Family">{t("profile.optFamily")}</option>
                    </select>
                    {formErrors.financialResponsibility && <p className={rfErrorClass}>{formErrors.financialResponsibility}</p>}
                  </div>
                  <div>
                    <label className={rfLabelClass}>{t("profile.labelMonthlyCost")} *</label>
                    <input type="number" min={0} className={rfFieldClass} disabled={!isPending} value={profileForm.monthlyCostEstimation} onChange={e => set("monthlyCostEstimation", e.target.value)} />
                    {formErrors.monthlyCostEstimation && <p className={rfErrorClass}>{formErrors.monthlyCostEstimation}</p>}
                  </div>
                  <div>
                    <label className={rfLabelClass}>{t("profile.labelBreedingIntent")} *</label>
                    <select className={rfFieldClass} disabled={!isPending} value={profileForm.breedingIntention} onChange={e => set("breedingIntention", e.target.value)}>
                      <option value="">{t("profile.selectDots")}</option>
                      <option value="No, not planning to breed">{t("profile.optNoBreed")}</option>
                      <option value="Possibly in the future">{t("profile.optMaybeBreed")}</option>
                      <option value="Yes, planning to breed">{t("profile.optYesBreed")}</option>
                    </select>
                    {formErrors.breedingIntention && <p className={rfErrorClass}>{formErrors.breedingIntention}</p>}
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-3">
                    <input type="checkbox" id="spay-modal" checked={profileForm.spayNeuterCommitment} disabled={!isPending} onChange={e => set("spayNeuterCommitment", e.target.checked)} className="w-4 h-4 accent-[#FF6B35]" />
                    <label htmlFor="spay-modal" className="text-sm text-foreground">{t("profile.labelSpayCommit")}</label>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <label className={rfLabelClass}>{t("profile.labelActivities")} *</label>
                    {formErrors.activities && <p className={rfErrorClass}>{formErrors.activities}</p>}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                      {ACTIVITY_OPTION_KEYS.map(({ value, key }) => (
                        <button key={value} type="button" disabled={!isPending} onClick={() => toggleArr("activities", value)}
                          className={`text-start px-3 py-2 rounded-xl text-sm font-medium border transition-all ${profileForm.activities.includes(value) ? "bg-primary text-white border-primary" : "bg-white border-border hover:border-primary/50"} ${!isPending ? "opacity-60 cursor-not-allowed" : ""}`}>
                          {t(key)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={rfLabelClass}>{t("profile.labelPetPrefs")} *</label>
                    {formErrors.petPreferences && <p className={rfErrorClass}>{formErrors.petPreferences}</p>}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                      {PET_PREFERENCE_OPTION_KEYS.map(({ value, key }) => (
                        <button key={value} type="button" disabled={!isPending} onClick={() => toggleArr("petPreferences", value)}
                          className={`text-start px-3 py-2 rounded-xl text-sm font-medium border transition-all ${profileForm.petPreferences.includes(value) ? "bg-secondary text-white border-secondary" : "bg-white border-border hover:border-secondary/50"} ${!isPending ? "opacity-60 cursor-not-allowed" : ""}`}>
                          {t(key)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={rfLabelClass}>{t("profile.labelTrainingExp")} *</label>
                    {formErrors.trainingExpectations && <p className={rfErrorClass}>{formErrors.trainingExpectations}</p>}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                      {TRAINING_EXPECTATION_OPTION_KEYS.map(({ value, key }) => (
                        <button key={value} type="button" disabled={!isPending} onClick={() => toggleArr("trainingExpectations", value)}
                          className={`text-start px-3 py-2 rounded-xl text-sm font-medium border transition-all ${profileForm.trainingExpectations.includes(value) ? "bg-[#1E2A3A] text-white border-[#1E2A3A]" : "bg-white border-border hover:border-[#1E2A3A]/50"} ${!isPending ? "opacity-60 cursor-not-allowed" : ""}`}>
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
                    <label className={rfLabelClass}>{t("profile.allergies")}</label>
                    <input className={rfFieldClass} disabled={!isPending} value={profileForm.allergies} onChange={e => set("allergies", e.target.value)} placeholder={t("profile.placeholderAllergies")} />
                  </div>
                  <div>
                    <label className={rfLabelClass}>{t("profile.labelBehaviorTolerance")}</label>
                    <select className={rfFieldClass} disabled={!isPending} value={profileForm.behaviorTolerance} onChange={e => set("behaviorTolerance", e.target.value)}>
                      <option value="">{t("profile.selectDots")}</option>
                      <option value="None — I prefer a well-behaved pet">{t("profile.optBehavNone")}</option>
                      <option value="Minor issues (chewing, jumping)">{t("profile.optBehavMinor")}</option>
                      <option value="Moderate issues with proper training">{t("profile.optBehavModerate")}</option>
                      <option value="Significant behavioral challenges">{t("profile.optBehavSignificant")}</option>
                    </select>
                  </div>
                  <div>
                    <label className={rfLabelClass}>{t("profile.labelTraumaComfort")}</label>
                    <select className={rfFieldClass} disabled={!isPending} value={profileForm.traumaHandlingComfort} onChange={e => set("traumaHandlingComfort", e.target.value)}>
                      <option value="">{t("profile.selectDots")}</option>
                      <option value="Not comfortable">{t("profile.optTraumaNot")}</option>
                      <option value="Somewhat comfortable">{t("profile.optTraumaSomewhat")}</option>
                      <option value="Comfortable with guidance">{t("profile.optTraumaComfort")}</option>
                      <option value="Very comfortable">{t("profile.optTraumaVery")}</option>
                    </select>
                  </div>
                  <div>
                    <label className={rfLabelClass}>{t("profile.travelPlan")}</label>
                    <input className={rfFieldClass} disabled={!isPending} value={profileForm.travelPlan} onChange={e => set("travelPlan", e.target.value)} placeholder={t("profile.placeholderTravelPlan")} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={rfLabelClass}>{t("profile.dailyCarePlan")} *</label>
                    <textarea rows={3} className={rfFieldClass} disabled={!isPending} value={profileForm.dailyCarePlan} onChange={e => set("dailyCarePlan", e.target.value)} placeholder={t("profile.placeholderDailyCare")} />
                    {formErrors.dailyCarePlan && <p className={rfErrorClass}>{formErrors.dailyCarePlan}</p>}
                  </div>
                  <div className="sm:col-span-2 bg-primary/5 border border-primary/20 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <input type="checkbox" id="confirmed-modal" checked={profileForm.confirmed} disabled={!isPending} onChange={e => set("confirmed", e.target.checked)} className="w-4 h-4 mt-0.5 accent-[#FF6B35]" />
                      <label htmlFor="confirmed-modal" className="text-sm text-foreground leading-relaxed">
                        {t("profile.labelConfirm")}
                      </label>
                    </div>
                    {formErrors.confirmed && <p className={rfErrorClass}>{formErrors.confirmed}</p>}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-border shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {t("profile.deleteRequest")}
            </button>
            {step > 0 && (
              <button onClick={handleBack} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted/50 text-sm font-semibold transition-colors">
                <ChevronLeft className="w-4 h-4 rtl:rotate-180" /> {t("common.back")}
              </button>
            )}
          </div>

          {step < READINESS_STEPS.length - 1 ? (
            <button onClick={handleNext} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all">
              {t("common.next")} <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          ) : isPending ? (
            <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all disabled:opacity-50">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {t("profile.saveChanges")}
            </button>
          ) : (
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-300 transition-all">
              {t("common.close")}
            </button>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-[#1E2A3A]">{t("profile.deleteRequest")}</h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">{t("profile.deleteConfirmDesc")}</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-[#1E2A3A] hover:bg-gray-50 transition-colors">
                {t("common.cancel")}
              </button>
              <button onClick={handleDelete} disabled={isDeleting} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50">
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function AdoptionReadinessFormModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [profileForm, setProfileForm] = useState<ReadinessFormData | null>(null);
  const [formErrors, setFormErrors] = useState<ReadinessFormErrors>({});
  const [profileLoading, setProfileLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/user/profile", { credentials: "include" });
        if (!res.ok) {
          setProfileForm({
            areaOfResidence: "", homeAddress: "", occupation: "", age: "", mainCaregiver: "",
            adoptionReason: "", financialResponsibility: "", childrenCount: "0", yardType: "",
            dayLocation: "", nightLocation: "", allergies: "", currentPets: "", householdObjection: "",
            homeType: "", ownershipType: "", previousPetExperience: "", exerciseHours: "",
            monthlyCostEstimation: "", breedingIntention: "", spayNeuterCommitment: false,
            behaviorTolerance: "", traumaHandlingComfort: "", dailyCarePlan: "", travelPlan: "",
            activities: [], petPreferences: [], trainingExpectations: [], confirmed: false,
          });
          return;
        }
        const data = await res.json();
        setProfileForm({
          areaOfResidence: data.areaOfResidence ?? "",
          homeAddress: data.homeAddress ?? "",
          occupation: data.occupation ?? "",
          age: String(data.age ?? ""),
          mainCaregiver: data.mainCaregiver ?? "",
          adoptionReason: data.adoptionReason ?? "",
          financialResponsibility: data.financialResponsibility ?? "",
          childrenCount: String(data.childrenCount ?? "0"),
          yardType: data.yardType ?? "",
          dayLocation: data.dayLocation ?? "",
          nightLocation: data.nightLocation ?? "",
          allergies: data.allergies ?? "",
          currentPets: data.currentPets ?? "",
          householdObjection: data.householdObjection ?? "",
          homeType: data.homeType ?? "",
          ownershipType: data.ownershipType ?? "",
          previousPetExperience: data.previousPetExperience ?? "",
          exerciseHours: String(data.exerciseHours ?? ""),
          monthlyCostEstimation: String(data.monthlyCostEstimation ?? ""),
          breedingIntention: data.breedingIntention ?? "",
          spayNeuterCommitment: data.spayNeuterCommitment ?? false,
          behaviorTolerance: data.behaviorTolerance ?? "",
          traumaHandlingComfort: data.traumaHandlingComfort ?? "",
          dailyCarePlan: data.dailyCarePlan ?? "",
          travelPlan: data.travelPlan ?? "",
          activities: Array.isArray(data.activities) ? data.activities : [],
          petPreferences: Array.isArray(data.petPreferences) ? data.petPreferences : [],
          trainingExpectations: Array.isArray(data.trainingExpectations) ? data.trainingExpectations : [],
          confirmed: data.confirmed ?? false,
        });
      } finally {
        setProfileLoading(false);
      }
    }
    loadProfile();
  }, []);

  const set = (key: keyof ReadinessFormData, value: ReadinessFormData[keyof ReadinessFormData]) => {
    setProfileForm(prev => prev ? { ...prev, [key]: value } : prev);
    setFormErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const toggleArr = (key: "activities" | "petPreferences" | "trainingExpectations", value: string) => {
    setProfileForm(prev => {
      if (!prev) return prev;
      const arr = prev[key] as string[];
      return { ...prev, [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
    });
    setFormErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const handleNext = () => {
    if (!profileForm) return;
    const errs = validateReadinessStep(step, profileForm, t);
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    setFormErrors({});
    setStep(s => s + 1);
  };

  const handleBack = () => {
    setFormErrors({});
    setStep(s => s - 1);
  };

  const handleSave = async () => {
    if (!profileForm) return;
    const errs = validateReadinessStep(step, profileForm, t);
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    setIsSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profileForm,
          age: Number(profileForm.age),
          childrenCount: Number(profileForm.childrenCount),
          exerciseHours: Number(profileForm.exerciseHours),
          monthlyCostEstimation: Number(profileForm.monthlyCostEstimation),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to save profile");
      }
      queryClient.invalidateQueries({ queryKey: ["/api/users/me/applications"] });
      toast({ title: t("profile.readinessFormSaved") });

      const pendingRaw = sessionStorage.getItem("pendingRequest");
      if (pendingRaw) {
        sessionStorage.removeItem("pendingRequest");
        try {
          const pending = JSON.parse(pendingRaw) as { petId: number; type: "adoption" | "foster" };
          const endpoint = pending.type === "adoption" ? "/api/adoption-requests" : "/api/foster-requests";
          const requestRes = await fetch(endpoint, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ petId: pending.petId, message: pending.type === "adoption" ? "I would love to adopt this pet." : "I would love to foster this pet." }),
          });
          if (requestRes.ok) {
            toast({ title: pending.type === "adoption" ? t("petDetail.adoptionSent") : t("petDetail.fosterSent"), description: t("petDetail.ownerContact") });
            queryClient.invalidateQueries({ queryKey: ["/api/users/me/applications"] });
          } else {
            const errData = await requestRes.json().catch(() => ({}));
            if (errData?.error === "duplicate_request") {
              toast({ title: t("petDetail.requestExists"), description: t("petDetail.requestExistsDesc"), variant: "destructive" });
            } else {
              toast({ title: t("petDetail.error"), description: t("petDetail.failedRequest"), variant: "destructive" });
            }
          }
        } catch {
          toast({ title: t("petDetail.error"), description: t("petDetail.failedRequest"), variant: "destructive" });
        }
      }

      onClose();
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Failed to save", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#FFF8F3] rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {profileLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : profileForm ? (
          <div className="flex-1 overflow-y-auto">
            <AdoptionReadinessFormContent
              step={step}
              profileForm={profileForm}
              formErrors={formErrors}
              isSaving={isSaving}
              set={set}
              toggleArr={toggleArr}
              onNext={handleNext}
              onBack={handleBack}
              onSave={handleSave}
              onCancel={onClose}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

import {
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";
import {
  CountryPhoneDropdown,
  ALL_COUNTRIES,
  findCountryByName,
  findCountryByCode,
  type CountryOption,
} from "@/components/country-phone-dropdown";
import WhatsAppPhoneInput from "@/components/whatsapp-phone-input";

const adoptionFosterTabs = ["My Pets", "Applications", "My Requests"];

const sidebarLinks = [
  { label: "Profile", tabKey: "tabProfile", icon: User },
  { label: "Favourite", tabKey: "tabFavourite", icon: Heart },
  { label: "Notifications", tabKey: "tabNotifications", icon: Bell },
  { label: "Volunteer", tabKey: "tabVolunteer", icon: Users },
  { label: "Lost&Found", tabKey: "tabLostFound", icon: MapPin },
];

const adoptionFosterLinks = [
  { label: "My Pets", tabKey: "tabMyPets", icon: PawPrint },
  { label: "Applications", tabKey: "tabApplications", icon: Inbox },
  { label: "My Requests", tabKey: "tabMyRequests", icon: FileText },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
    approved:  { color: "bg-green-100 text-green-600", icon: CheckCircle2 },
    pending:   { color: "bg-yellow-100 text-yellow-600", icon: Clock },
    rejected:  { color: "bg-red-100 text-red-500", icon: XCircle },
    active:    { color: "bg-green-100 text-green-600", icon: CheckCircle2 },
    completed: { color: "bg-blue-100 text-blue-500", icon: CheckCircle2 },
  };
  const conf = map[status] ?? { color: "bg-gray-100 text-gray-500", icon: Clock };
  const Icon = conf.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold capitalize ${conf.color}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
}

interface FormState {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  country: CountryOption;
  city: string;
}

interface TouchedState {
  fullName: boolean;
  email: boolean;
  password: boolean;
  phone: boolean;
  country: boolean;
  city: boolean;
}

interface ErrorsState {
  fullName?: string;
  email?: string;
  password?: string;
  phone?: string;
  city?: string;
}

function validateEmail(email: string): string | undefined {
  if (!email.trim()) return i18next.t("profile.errEmailRequired");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return i18next.t("profile.errEmailInvalid");
  return undefined;
}

function validatePhone(phone: string, countryCode: CountryCode): string | undefined {
  if (!phone.trim()) return undefined;
  const parsed = parsePhoneNumberFromString(phone, countryCode);
  if (!parsed || !parsed.isValid()) return i18next.t("profile.errPhoneInvalid");
  return undefined;
}

function validatePassword(password: string): string | undefined {
  if (!password || password === PASSWORD_SENTINEL) return undefined;
  if (password.length < 8) return i18next.t("profile.errPasswordLength");
  return undefined;
}

type PasswordStrength = "weak" | "medium" | "strong";

function getPasswordStrength(password: string): PasswordStrength | null {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  if (score <= 2) return "weak";
  if (score <= 3) return "medium";
  return "strong";
}

const STRENGTH_CONFIG: Record<PasswordStrength, { labelKey: string; color: string; bg: string; width: string }> = {
  weak:   { labelKey: "profile.strengthWeak",   color: "text-red-500",    bg: "bg-red-400",    width: "w-1/3" },
  medium: { labelKey: "profile.strengthMedium", color: "text-yellow-500",  bg: "bg-yellow-400", width: "w-2/3" },
  strong: { labelKey: "profile.strengthStrong", color: "text-green-500",   bg: "bg-green-500",  width: "w-full" },
};

function validateForm(form: FormState): ErrorsState {
  const errors: ErrorsState = {};
  if (!form.fullName.trim()) errors.fullName = i18next.t("profile.errFullNameRequired");
  const emailErr = validateEmail(form.email);
  if (emailErr) errors.email = emailErr;
  const pwErr = validatePassword(form.password);
  if (pwErr) errors.password = pwErr;
  const phoneErr = validatePhone(form.phone, form.country.code);
  if (phoneErr) errors.phone = phoneErr;
  return errors;
}

const PASSWORD_SENTINEL = "\x00\x00UNCHANGED\x00\x00";

const DEFAULT_COUNTRY = findCountryByName("Jordan") ?? ALL_COUNTRIES[0];

function calculateAge(birthday: string): string {
  if (!birthday) return "";
  const birth = new Date(birthday);
  const now = new Date();
  const totalMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (totalMonths < 0) return "";
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (years === 0) return `${months} month${months !== 1 ? "s" : ""}`;
  if (months === 0) return `${years} year${years !== 1 ? "s" : ""}`;
  return `${years} yr${years !== 1 ? "s" : ""} ${months} mo`;
}

interface AddPetModalProps {
  onClose: () => void;
  onSuccess: () => void;
  userName: string;
  userPhone?: string;
  initialData?: Pet;
}

function AddPetModal({ onClose, onSuccess, userName, userPhone, initialData }: AddPetModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const createPet = useCreatePet();
  const updatePet = useUpdatePet();
  const isEditMode = !!initialData;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [section, setSection] = useState<1 | 2>(1);

  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    type: initialData?.type ?? "dog",
    breed: initialData?.breed ?? "",
    birthday: initialData?.birthday ?? "",
    gender: initialData?.gender ?? "male",
    weightKg: initialData?.weightKg ?? "",
    sterilized: initialData?.sterilized ?? false as boolean,
    yearlyVaccines: initialData?.yearlyVaccines ?? false as boolean,
    story: initialData?.story ?? "",
    whatsappUrl: initialData?.whatsappUrl ?? "",
    purpose: (initialData?.purpose ?? "adopt") as "adopt" | "foster" | "both",
  });

  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(initialData?.imageUrls ?? []);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const aiGenerateMutation = useAiGenerateDescription({
    mutation: {
      onSuccess: (data) => {
        const text = data.description ?? data.story;
        if (text) setForm(f => ({ ...f, story: text }));
      },
      onError: () => {
        toast({ title: t("profile.aiGenerateFailed", "Failed to generate story. Please try again."), variant: "destructive" });
      },
    },
  });
  const generatingStory = aiGenerateMutation.isPending;

  const generateAIStory = () => {
    const ageMonths = form.birthday
      ? Math.max(0, (new Date().getFullYear() - new Date(form.birthday).getFullYear()) * 12 + (new Date().getMonth() - new Date(form.birthday).getMonth()))
      : 0;
    aiGenerateMutation.mutate({
      data: {
        pet: {
          name: form.name || "this pet",
          type: form.type as "dog" | "cat" | "rabbit" | "bird" | "other",
          breed: form.breed || undefined,
          gender: form.gender as "male" | "female",
          ageMonths,
        },
      },
    });
  };

  const allDisplayedImages = [...existingImageUrls, ...imagePreviews];

  const ageDisplay = useMemo(() => calculateAge(form.birthday), [form.birthday]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setImageFiles(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeImage = (idx: number) => {
    if (idx < existingImageUrls.length) {
      setExistingImageUrls(prev => prev.filter((_, i) => i !== idx));
    } else {
      const localIdx = idx - existingImageUrls.length;
      setImageFiles(prev => prev.filter((_, i) => i !== localIdx));
      setImagePreviews(prev => prev.filter((_, i) => i !== localIdx));
    }
  };

  const validateSection1 = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = t("profile.addPetErrName");
    if (!form.type) e.type = t("profile.addPetErrType");
    if (!form.breed.trim()) e.breed = t("profile.addPetErrBreed");
    if (!form.birthday) e.birthday = t("profile.addPetErrBirthday");
    if (!form.gender) e.gender = t("profile.addPetErrGender");
    if (!form.weightKg.trim()) e.weightKg = t("profile.addPetErrWeight");
    if (!form.story.trim()) e.story = t("profile.addPetErrStory");
    if (existingImageUrls.length === 0 && imageFiles.length === 0) e.images = t("profile.addPetErrImages");
    return e;
  };

  const validateSection2 = () => {
    const e: Record<string, string> = {};
    if (!form.whatsappUrl.trim()) e.whatsappUrl = t("profile.addPetErrWhatsapp");
    if (!form.purpose) e.purpose = t("profile.addPetErrPurpose");
    return e;
  };

  const handleNext = () => {
    const e = validateSection1();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      const touchAll: Record<string, boolean> = {};
      Object.keys(e).forEach(k => { touchAll[k] = true; });
      setTouched(touchAll);
      return;
    }
    setErrors({});
    setSection(2);
  };

  const filesToBase64 = (files: File[]): Promise<string[]> => {
    return Promise.all(
      files.map(
        file =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const e2 = validateSection2();
    if (Object.keys(e2).length > 0) {
      setErrors(e2);
      const touchAll: Record<string, boolean> = {};
      Object.keys(e2).forEach(k => { touchAll[k] = true; });
      setTouched(touchAll);
      return;
    }

    let newBase64: string[] = [];
    try {
      if (imageFiles.length > 0) {
        newBase64 = await filesToBase64(imageFiles);
      }
    } catch {
      newBase64 = [];
    }
    const imageUrls: string[] = [...existingImageUrls, ...newBase64];

    const ageMonths = (() => {
      if (!form.birthday) return 0;
      const birth = new Date(form.birthday);
      const now = new Date();
      return Math.max(0, (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth()));
    })();

    const petData = {
      name: form.name,
      type: form.type as Pet["type"],
      breed: form.breed || undefined,
      gender: form.gender as "male" | "female",
      ageMonths,
      weightKg: form.weightKg || undefined,
      size: "medium",
      city: "Jordan",
      purpose: form.purpose,
      sterilized: form.sterilized,
      yearlyVaccines: form.yearlyVaccines,
      birthday: form.birthday || undefined,
      story: form.story || undefined,
      imageUrls,
      whatsappUrl: form.whatsappUrl || undefined,
    };

    if (isEditMode && initialData) {
      updatePet.mutate(
        { id: initialData.id, data: petData },
        {
          onSuccess: () => {
            toast({ title: t("profile.updatePetSuccess") });
            onSuccess();
            onClose();
          },
          onError: () => {
            toast({ title: t("profile.addPetError"), variant: "destructive" });
          },
        }
      );
    } else {
      createPet.mutate(
        { data: petData },
        {
          onSuccess: () => {
            toast({ title: t("profile.addPetSuccess") });
            onSuccess();
            onClose();
          },
          onError: () => {
            toast({ title: t("profile.addPetError"), variant: "destructive" });
          },
        }
      );
    }
  };

  const inputCls = (field: string) =>
    `w-full border rounded-xl px-3 py-2.5 text-sm text-[#1E2A3A] outline-none focus:ring-2 transition-colors ${
      touched[field] && errors[field]
        ? "border-red-400 focus:ring-red-200"
        : "border-gray-200 focus:ring-primary/20"
    }`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-[#1E2A3A]">{isEditMode ? t("profile.editPet") : t("profile.addPet")}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {section === 1 ? t("profile.addPetSection1") : t("profile.addPetSection2")}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {section === 1 && (
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t("profile.addPetName")} *</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
                    className={inputCls("name")}
                    placeholder={t("profile.addPetPlaceholderName")}
                  />
                  {touched.name && errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t("profile.addPetType")} *</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className={inputCls("type")}
                  >
                    {["dog", "cat", "rabbit", "bird", "other"].map(tp => (
                      <option key={tp} value={tp} className="capitalize">{tp.charAt(0).toUpperCase() + tp.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t("profile.addPetBreed")} *</label>
                  <input
                    value={form.breed}
                    onChange={e => setForm(f => ({ ...f, breed: e.target.value }))}
                    onBlur={() => setTouched(prev => ({ ...prev, breed: true }))}
                    className={inputCls("breed")}
                    placeholder="e.g. Labrador"
                  />
                  {touched.breed && errors.breed && <p className="text-xs text-red-500 mt-0.5">{errors.breed}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t("profile.addPetBirthdate")} *</label>
                  <input
                    type="date"
                    value={form.birthday}
                    onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))}
                    onBlur={() => setTouched(prev => ({ ...prev, birthday: true }))}
                    max={new Date().toISOString().split("T")[0]}
                    className={inputCls("birthday")}
                  />
                  {touched.birthday && errors.birthday && <p className="text-xs text-red-500 mt-0.5">{errors.birthday}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t("profile.addPetAge")}</label>
                  <input
                    value={ageDisplay}
                    readOnly
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-500 cursor-default outline-none"
                    placeholder={t("profile.addPetSelectBirthdate")}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t("profile.addPetGender")} *</label>
                  <select
                    value={form.gender}
                    onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                    className={inputCls("gender")}
                  >
                    <option value="male">{t("profile.male")}</option>
                    <option value="female">{t("profile.female")}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t("profile.addPetWeight")} *</label>
                  <input
                    value={form.weightKg}
                    onChange={e => setForm(f => ({ ...f, weightKg: e.target.value }))}
                    onBlur={() => setTouched(prev => ({ ...prev, weightKg: true }))}
                    className={inputCls("weightKg")}
                    placeholder="e.g. 5.2"
                    type="number"
                    step="0.1"
                    min="0"
                  />
                  {touched.weightKg && errors.weightKg && <p className="text-xs text-red-500 mt-0.5">{errors.weightKg}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">{t("profile.addPetSterilized")} *</label>
                  <div className="flex gap-2">
                    {[true, false].map(val => (
                      <button
                        key={String(val)}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, sterilized: val }))}
                        className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                          form.sterilized === val
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {val ? t("common.yes") : t("common.no")}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">{t("profile.addPetYearlyVaccines")} *</label>
                  <div className="flex gap-2">
                    {[true, false].map(val => (
                      <button
                        key={String(val)}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, yearlyVaccines: val }))}
                        className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                          form.yearlyVaccines === val
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {val ? t("common.yes") : t("common.no")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-gray-500">{t("profile.addPetStory")} *</label>
                  <button
                    type="button"
                    onClick={generateAIStory}
                    disabled={generatingStory}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ background: "#FF6B35" }}
                  >
                    {generatingStory ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    {t("profile.generateWithAI", "Generate with AI")}
                  </button>
                </div>
                <textarea
                  value={form.story}
                  onChange={e => setForm(f => ({ ...f, story: e.target.value }))}
                  onBlur={() => setTouched(prev => ({ ...prev, story: true }))}
                  rows={3}
                  className={`${inputCls("story")} resize-none`}
                  placeholder={t("profile.addPetStoryPlaceholder")}
                />
                {touched.story && errors.story && <p className="text-xs text-red-500 mt-0.5">{errors.story}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">{t("profile.addPetPhotos")} *</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors hover:bg-gray-50 ${
                    touched.images && errors.images ? "border-red-400" : "border-gray-200"
                  }`}
                >
                  <Camera className="w-6 h-6 mx-auto mb-1.5 text-gray-300" />
                  <p className="text-sm text-gray-500">{t("profile.addPetClickUpload")}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t("profile.addPetMultiplePhotos")}</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
                {touched.images && errors.images && <p className="text-xs text-red-500 mt-0.5">{errors.images}</p>}
                {allDisplayedImages.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {allDisplayedImages.map((src, idx) => (
                      <div key={idx} className="relative">
                        <img src={src} alt={`preview ${idx}`} className="w-16 h-16 object-cover rounded-xl border border-gray-200" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
                >
                  {t("profile.addPetNext")}
                </button>
              </div>
            </div>
          )}

          {section === 2 && (
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t("profile.addPetYourName")}</label>
                <input
                  value={userName}
                  readOnly
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-500 cursor-default outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t("profile.addPetWhatsapp")} *</label>
                <WhatsAppPhoneInput
                  initialPhone={
                    isEditMode && initialData?.whatsappUrl
                      ? "+" + initialData.whatsappUrl.replace("https://wa.me/", "")
                      : userPhone
                  }
                  onChange={url => {
                    setForm(f => ({ ...f, whatsappUrl: url }));
                    if (url) setErrors(prev => ({ ...prev, whatsappUrl: "" }));
                  }}
                  error={touched.whatsappUrl ? errors.whatsappUrl : undefined}
                  touched={touched.whatsappUrl}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">{t("profile.addPetAvailability")} *</label>
                <div className="flex gap-2">
                  {[
                    { value: "adopt", label: t("profile.addPetAdoption") },
                    { value: "foster", label: t("profile.addPetFoster") },
                    { value: "both", label: t("profile.addPetBoth") },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, purpose: opt.value as "adopt" | "foster" | "both" }))}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                        form.purpose === opt.value
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setSection(1)}
                  className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
                >
                  {t("profile.addPetBack")}
                </button>
                <button
                  type="submit"
                  disabled={createPet.isPending || updatePet.isPending}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {(createPet.isPending || updatePet.isPending) ? (
                    <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> {t("common.submitting")}</span>
                  ) : isEditMode ? (
                    t("profile.saveChanges")
                  ) : (
                    t("profile.addPetSubmit")
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

interface VolunteerApplication {
  id: number;
  userId: number;
  applicationType: "member" | "volunteer_activity";
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  skills: string;
  motivation: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  updatedAt: string;
}

function useGetMyVolunteerApplication() {
  return useQuery<VolunteerApplication | null>({
    queryKey: ["/api/volunteer-applications/me"],
    queryFn: async () => {
      const res = await fetch("/api/volunteer-applications/me", { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(i18next.t("profile.failedFetchVolunteer"));
      return res.json();
    },
  });
}

function useSubmitVolunteerApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<VolunteerApplication, "id" | "userId" | "status" | "createdAt" | "updatedAt">) => {
      const res = await fetch("/api/volunteer-applications", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to submit application");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/volunteer-applications/me"] });
    },
  });
}

function useUpdateVolunteerApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<VolunteerApplication, "id" | "userId" | "status" | "createdAt" | "updatedAt">) => {
      const res = await fetch("/api/volunteer-applications/me", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to update application");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/volunteer-applications/me"] });
    },
  });
}

interface VolunteerFormData {
  applicationType: "member" | "volunteer_activity";
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  skills: string;
  motivation: string;
}

interface VolunteerApplicationModalProps {
  onClose: () => void;
  initialData?: VolunteerFormData | null;
  isResubmit?: boolean;
  profileData?: { fullName?: string | null; email?: string | null; phone?: string | null; city?: string | null } | null;
}

function VolunteerApplicationModal({ onClose, initialData, isResubmit, profileData }: VolunteerApplicationModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const submitMutation = useSubmitVolunteerApplication();
  const updateMutation = useUpdateVolunteerApplication();
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState<VolunteerFormData>(() => initialData ?? {
    applicationType: "member",
    name: profileData?.fullName ?? "",
    phone: profileData?.phone ?? "",
    email: profileData?.email ?? "",
    city: profileData?.city ?? "",
    address: "",
    skills: "",
    motivation: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof VolunteerFormData, string>>>({});
  const [touchedFields, setTouchedFields] = useState<Set<keyof VolunteerFormData>>(new Set());

  const phoneRegex = /^\+?[\d\s\-()]{7,20}$/;

  function validate(data: VolunteerFormData): Partial<Record<keyof VolunteerFormData, string>> {
    const errs: Partial<Record<keyof VolunteerFormData, string>> = {};
    if (!data.name.trim()) errs.name = t("profile.volErrName");
    if (!data.phone.trim()) errs.phone = t("profile.volErrPhone");
    else if (!phoneRegex.test(data.phone.trim())) errs.phone = t("profile.volErrPhoneFormat");
    if (!data.email.trim()) errs.email = t("profile.volErrEmail");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) errs.email = t("profile.volErrEmailFormat");
    if (!data.city.trim()) errs.city = t("profile.volErrCity");
    if (!data.address.trim()) errs.address = t("profile.volErrAddress");
    if (!data.skills.trim()) errs.skills = t("profile.volErrSkills");
    if (!data.motivation.trim()) errs.motivation = t("profile.volErrMotivation");
    return errs;
  }

  function touch(field: keyof VolunteerFormData) {
    setTouchedFields(prev => new Set([...prev, field]));
  }

  function setField<K extends keyof VolunteerFormData>(key: K, value: VolunteerFormData[K]) {
    const next = { ...form, [key]: value };
    setForm(next);
    if (touchedFields.has(key)) {
      setFormErrors(validate(next));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const allTouched = new Set(Object.keys(form) as Array<keyof VolunteerFormData>);
    setTouchedFields(allTouched);
    const errs = validate(form);
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      if (isResubmit) {
        await updateMutation.mutateAsync(form);
        toast({ title: t("profile.volResubmitted"), description: t("profile.volReviewSoon") });
      } else {
        await submitMutation.mutateAsync(form);
        toast({ title: t("profile.volSubmitted"), description: t("profile.volReviewSoon") });
      }
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("profile.volSubmitError");
      toast({ title: msg, variant: "destructive" });
    }
  }

  const isLoading = submitMutation.isPending || updateMutation.isPending;

  const inputCls = (field: keyof VolunteerFormData) =>
    `w-full border rounded-xl px-3 py-2.5 text-sm text-[#1E2A3A] outline-none focus:ring-2 transition-colors ${
      touchedFields.has(field) && formErrors[field]
        ? "border-red-400 focus:ring-red-200"
        : "border-gray-200 focus:ring-primary/20"
    }`;

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-[#1E2A3A] mb-2">{t("profile.volSubmitted")}</h2>
          <p className="text-sm text-gray-500 mb-6">
            {t("profile.volSubmittedDesc")}
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
          >
            {t("common.close")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-[#1E2A3A]">
              {isResubmit ? t("profile.editResubmitApplication") : t("profile.joinOrganization")}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">{t("profile.volModalSubtitle")}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-5">
            {/* Application Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">{t("profile.applicationType")} *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setField("applicationType", "member")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    form.applicationType === "member"
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-primary/40"
                  }`}
                >
                  <Users className={`w-6 h-6 ${form.applicationType === "member" ? "text-primary" : "text-gray-400"}`} />
                  <span className={`text-sm font-semibold ${form.applicationType === "member" ? "text-primary" : "text-gray-600"}`}>
                    {t("profile.becomeAMember")}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setField("applicationType", "volunteer_activity")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    form.applicationType === "volunteer_activity"
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-primary/40"
                  }`}
                >
                  <Heart className={`w-6 h-6 ${form.applicationType === "volunteer_activity" ? "text-primary" : "text-gray-400"}`} />
                  <span className={`text-sm font-semibold ${form.applicationType === "volunteer_activity" ? "text-primary" : "text-gray-600"}`}>
                    {t("profile.oneTimeActivity")}
                  </span>
                </button>
              </div>
            </div>

            {/* Auto-filled fields */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t("profile.fullName")} *</label>
                <input
                  className={inputCls("name")}
                  value={form.name}
                  onChange={e => setField("name", e.target.value)}
                  onBlur={() => touch("name")}
                  placeholder={t("profile.fullName")}
                />
                {touchedFields.has("name") && formErrors.name && (
                  <p className="text-xs text-red-500 mt-0.5">{formErrors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t("profile.phone")} *</label>
                <input
                  className={inputCls("phone")}
                  value={form.phone}
                  onChange={e => setField("phone", e.target.value)}
                  onBlur={() => touch("phone")}
                  placeholder="+962 79 000 0000"
                />
                {touchedFields.has("phone") && formErrors.phone && (
                  <p className="text-xs text-red-500 mt-0.5">{formErrors.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t("profile.email")} *</label>
                <input
                  type="email"
                  className={inputCls("email")}
                  value={form.email}
                  onChange={e => setField("email", e.target.value)}
                  onBlur={() => touch("email")}
                  placeholder="you@email.com"
                />
                {touchedFields.has("email") && formErrors.email && (
                  <p className="text-xs text-red-500 mt-0.5">{formErrors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t("profile.city")} *</label>
                <input
                  className={inputCls("city")}
                  value={form.city}
                  onChange={e => setField("city", e.target.value)}
                  onBlur={() => touch("city")}
                  placeholder="e.g. Amman"
                />
                {touchedFields.has("city") && formErrors.city && (
                  <p className="text-xs text-red-500 mt-0.5">{formErrors.city}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t("profile.address")} *</label>
              <input
                className={inputCls("address")}
                value={form.address}
                onChange={e => setField("address", e.target.value)}
                onBlur={() => touch("address")}
                placeholder={t("profile.address")}
              />
              {touchedFields.has("address") && formErrors.address && (
                <p className="text-xs text-red-500 mt-0.5">{formErrors.address}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t("profile.skills")} *</label>
              <input
                className={inputCls("skills")}
                value={form.skills}
                onChange={e => setField("skills", e.target.value)}
                onBlur={() => touch("skills")}
                placeholder={t("profile.volSkillsPlaceholder")}
              />
              {touchedFields.has("skills") && formErrors.skills && (
                <p className="text-xs text-red-500 mt-0.5">{formErrors.skills}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t("profile.volWhyJoin")} *</label>
              <textarea
                rows={4}
                className={inputCls("motivation")}
                value={form.motivation}
                onChange={e => setField("motivation", e.target.value)}
                onBlur={() => touch("motivation")}
                placeholder={t("profile.volMotivationPlaceholder")}
              />
              {touchedFields.has("motivation") && formErrors.motivation && (
                <p className="text-xs text-red-500 mt-0.5">{formErrors.motivation}</p>
              )}
            </div>
          </div>

          <div className="p-5 border-t border-gray-100 shrink-0 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> {t("common.submitting")}
                </span>
              ) : isResubmit ? t("profile.volResubmitBtn") : t("profile.volSubmitBtn")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function VolunteerSection({ profile }: { profile: { fullName?: string | null; email?: string | null; phone?: string | null; city?: string | null } | null }) {
  const { t } = useTranslation();
  const { data: application, isLoading } = useGetMyVolunteerApplication();
  const [showModal, setShowModal] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display font-bold text-lg text-[#1E2A3A]">{t("profile.tabVolunteer")}</h2>

      {!application ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-bold text-[#1E2A3A] mb-2">{t("profile.volunteerMakeDifference")}</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            {t("profile.volunteerDescription")}
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
          >
            {t("profile.joinOrganization")}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">{t("profile.applicationType")}</p>
              <p className="font-bold text-[#1E2A3A]">
                {application.applicationType === "member" ? t("profile.becomeAMember") : t("profile.oneTimeVolunteer")}
              </p>
            </div>
            <div className="shrink-0">
              {application.status === "pending" && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                  <Clock className="w-3.5 h-3.5" /> {t("profile.pendingReview")}
                </span>
              )}
              {application.status === "accepted" && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {t("profile.accepted")}
                </span>
              )}
              {application.status === "rejected" && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-600 rounded-full text-xs font-bold">
                  <XCircle className="w-3.5 h-3.5" /> {t("profile.rejected")}
                </span>
              )}
            </div>
          </div>

          {application.status === "pending" && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-sm text-yellow-800">
              {t("profile.applicationPendingMsg")}
            </div>
          )}

          {application.status === "accepted" && (
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-800">
              {t("profile.applicationAcceptedMsg")}
            </div>
          )}

          {application.status === "rejected" && (
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-800">
                {t("profile.applicationRejectedMsg")}
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="w-full py-2.5 border-2 border-primary text-primary rounded-xl font-bold text-sm hover:bg-primary/5 transition-colors"
              >
                {t("profile.editResubmitApplication")}
              </button>
            </div>
          )}

          <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
            {[
              [t("profile.name"), application.name],
              [t("profile.email"), application.email],
              [t("profile.phone"), application.phone],
              [t("profile.city"), application.city],
            ].map(([label, value]) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-gray-500 mb-0.5">{label}</p>
                <p className="text-sm text-[#1E2A3A]">{value}</p>
              </div>
            ))}
            <div className="sm:col-span-2 bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-500 mb-0.5">{t("profile.address")}</p>
              <p className="text-sm text-[#1E2A3A]">{application.address}</p>
            </div>
            <div className="sm:col-span-2 bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-500 mb-0.5">{t("profile.skills")}</p>
              <p className="text-sm text-[#1E2A3A]">{application.skills}</p>
            </div>
            <div className="sm:col-span-2 bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-500 mb-0.5">{t("profile.motivation")}</p>
              <p className="text-sm text-[#1E2A3A]">{application.motivation}</p>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-4">
            {t("profile.submittedOn")} {new Date(application.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      )}

      {showModal && (
        <VolunteerApplicationModal
          onClose={() => setShowModal(false)}
          isResubmit={application?.status === "rejected"}
          initialData={application?.status === "rejected" ? {
            applicationType: application.applicationType,
            name: application.name,
            phone: application.phone,
            email: application.email,
            city: application.city,
            address: application.address,
            skills: application.skills,
            motivation: application.motivation,
          } : null}
          profileData={profile}
        />
      )}
    </div>
  );
}

function buildInitialForm(profile: { fullName?: string | null; email?: string | null; phone?: string | null; country?: string | null; city?: string | null } | null): FormState {
  const countryObj = profile?.country ? (findCountryByName(profile.country) ?? DEFAULT_COUNTRY) : DEFAULT_COUNTRY;
  return {
    fullName: profile?.fullName ?? "",
    email: profile?.email ?? "",
    password: PASSWORD_SENTINEL,
    phone: profile?.phone ?? "",
    country: countryObj,
    city: profile?.city ?? "",
  };
}

const NO_TOUCHED: TouchedState = {
  fullName: false,
  email: false,
  password: false,
  phone: false,
  country: false,
  city: false,
};

export default function Profile() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { logout, user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("Profile");
  const [adoptionFosterOpen, setAdoptionFosterOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const { data: profile, isLoading } = useGetMyProfile();
  const updateMutation = useUpdateMyProfile();
  const { data: myPets, isLoading: petsLoading, refetch: refetchPets } = useGetMyPets();
  const { data: applications, isLoading: appLoading } = useGetMyApplications();
  const { data: favourites, isLoading: favLoading } = useGetMyFavourites();
  const { data: notifications, isLoading: notifLoading } = useGetMyNotifications();
  const markRead = useMarkNotificationRead();
  const { data: lostFoundData, isLoading: lfLoading, refetch: refetchLF } = useListLostFoundReports(
    user?.id ? { reporterId: user.id, limit: 50 } : { limit: 0 }
  );
  const deleteLFMutation = useDeleteLostFoundReport();
  const deletePetMutation = useDeletePet();
  const resolveLFMutation = useResolveLostFoundReport();

  const { data: incomingAdoptionRequests, isLoading: incomingAdoptionLoading } = useGetIncomingAdoptionRequests();
  const { data: incomingFosterRequests, isLoading: incomingFosterLoading } = useGetIncomingFosterRequests();
  const updateAdoptionStatus = useUpdateAdoptionRequestStatus();
  const updateFosterStatus = useUpdateFosterRequestStatus();

  const deleteAdoptionMutation = useDeleteAdoptionRequest();
  const deleteFosterMutation = useDeleteFosterRequest();

  const [selectedIncomingRequest, setSelectedIncomingRequest] = useState<{ request: IncomingRequest; type: "adoption" | "foster" } | null>(null);
  const [showReadinessForm, setShowReadinessForm] = useState(false);
  const [deletingRequest, setDeletingRequest] = useState<{ id: number; type: "adoption" | "foster" } | null>(null);
  const [selectedPetRequest, setSelectedPetRequest] = useState<{ request: MyRequestItem; type: "adoption" | "foster" } | null>(null);

  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [petToEdit, setPetToEdit] = useState<Pet | null>(null);
  const [petToDelete, setPetToDelete] = useState<Pet | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [savedForm, setSavedForm] = useState<FormState>(() => buildInitialForm(null));
  const [form, setForm] = useState<FormState>(() => buildInitialForm(null));
  const [touched, setTouched] = useState<TouchedState>(NO_TOUCHED);

  useEffect(() => {
    if (profile) {
      const initial = buildInitialForm(profile);
      setForm(initial);
      setSavedForm(initial);
    }
  }, [profile]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    const openForm = params.get("openForm");
    if (tab) {
      setActiveTab(tab);
      if (adoptionFosterTabs.includes(tab)) setAdoptionFosterOpen(true);
    }
    if (openForm === "true") setShowReadinessForm(true);
  }, []);

  const errors = useMemo(() => validateForm(form), [form]);
  const isFormValid = Object.keys(errors).length === 0;

  const handleEdit = () => {
    setIsEditing(true);
    setShowPassword(false);
    setPasswordChanged(false);
    setTouched(NO_TOUCHED);
  };

  const handleCancel = () => {
    setForm({ ...savedForm, password: PASSWORD_SENTINEL });
    setIsEditing(false);
    setShowPassword(false);
    setPasswordChanged(false);
    setTouched(NO_TOUCHED);
  };

  const handleBlur = (field: keyof TouchedState) => {
    setTouched((t) => ({ ...t, [field]: true }));
  };

  const handlePasswordChange = (value: string) => {
    if (!passwordChanged) {
      setPasswordChanged(true);
      setForm({ ...form, password: value.endsWith(PASSWORD_SENTINEL) ? value.replace(PASSWORD_SENTINEL, "") : value });
    } else {
      setForm({ ...form, password: value });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ fullName: true, email: true, password: false, phone: true, country: true, city: true });
    if (!isFormValid) return;

    const updateData: Record<string, string> = {
      fullName: form.fullName,
      email: form.email,
      country: form.country.name,
      city: form.city,
    };

    if (form.phone.trim()) {
      const parsedPhone = parsePhoneNumberFromString(form.phone, form.country.code);
      updateData.phone = parsedPhone?.format("E.164") ?? `${form.country.dialCode}${form.phone.replace(/\D/g, "")}`;
    }

    if (passwordChanged && form.password) {
      updateData.password = form.password;
    }

    try {
      await updateMutation.mutateAsync({ data: updateData as any });
      setSavedForm({ ...form, password: PASSWORD_SENTINEL });
      setForm({ ...form, password: PASSWORD_SENTINEL });
      setIsEditing(false);
      setShowPassword(false);
      setPasswordChanged(false);
      setTouched(NO_TOUCHED);
      toast({ title: t("profile.profileSaved") });
    } catch {
      toast({ title: t("profile.profileSaveError"), variant: "destructive" });
    }
  };

  const handleLogoutConfirm = async () => {
    await logout();
    setLocation("/");
  };

  const displayName = profile?.fullName || t("profile.user");
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const readOnlyClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#1E2A3A] outline-none bg-gray-50 text-gray-500 cursor-default";
  const editClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#1E2A3A] outline-none focus:ring-2 focus:ring-primary/30 bg-white";
  const errorClass = "w-full border border-red-400 rounded-xl px-4 py-2.5 text-sm text-[#1E2A3A] outline-none focus:ring-2 focus:ring-red-200 bg-white";

  function fieldClass(field: keyof ErrorsState) {
    if (!isEditing) return readOnlyClass;
    if (touched[field as keyof TouchedState] && errors[field]) return errorClass;
    return editClass;
  }

  return (
    <div>
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Sidebar */}
          <div
            className="w-full md:w-64 flex-shrink-0 rounded-2xl p-5 text-white"
            style={{ backgroundColor: "#1E2A3A" }}
          >
            <div className="flex flex-col items-center mb-6 pt-2">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-3 text-2xl font-bold text-white overflow-hidden">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span>{avatarLetter}</span>
                )}
              </div>
              <p className="font-bold text-base">{displayName}</p>
              <button
                type="button"
                onClick={() => { setActiveTab("Profile"); setAdoptionFosterOpen(false); handleEdit(); }}
                className="flex items-center gap-1 mt-1.5 bg-white/10 hover:bg-white/20 rounded-full px-3 py-1 text-xs transition-colors"
              >
                <Edit2 className="w-3 h-3" /> {t("profile.editProfile")}
              </button>
            </div>

            <nav className="space-y-1">
              {/* Profile link (always first) */}
              {sidebarLinks.slice(0, 1).map((link) => {
                const Icon = link.icon;
                const isActive = activeTab === link.label;
                return (
                  <button
                    key={link.label}
                    onClick={() => { setActiveTab(link.label); setAdoptionFosterOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive ? "bg-white text-[#1E2A3A]" : "text-white/70 hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {t(`profile.${link.tabKey}`)}
                  </button>
                );
              })}

              {/* Adoption & Foster dropdown group */}
              <div>
                <button
                  onClick={() => setAdoptionFosterOpen(v => !v)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    adoptionFosterTabs.includes(activeTab) ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10"
                  }`}
                >
                  <PawPrint className="w-4 h-4 shrink-0" />
                  <span className="flex-1 text-start">{t("profile.tabAdoptionFoster")}</span>
                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${adoptionFosterOpen ? "rotate-180" : ""}`} />
                </button>
                {adoptionFosterOpen && (
                  <div className="mt-0.5 ml-3 space-y-0.5 border-l border-white/20 pl-3">
                    {adoptionFosterLinks.map((link) => {
                      const Icon = link.icon;
                      const isActive = activeTab === link.label;
                      return (
                        <button
                          key={link.label}
                          onClick={() => setActiveTab(link.label)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                            isActive ? "bg-white text-[#1E2A3A]" : "text-white/60 hover:bg-white/10 hover:text-white/90"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {t(`profile.${link.tabKey}`)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Remaining flat links */}
              {sidebarLinks.slice(1).map((link) => {
                const Icon = link.icon;
                const isActive = activeTab === link.label;
                return (
                  <button
                    key={link.label}
                    onClick={() => { setActiveTab(link.label); setAdoptionFosterOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive ? "bg-white text-[#1E2A3A]" : "text-white/70 hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {t(`profile.${link.tabKey}`)}
                  </button>
                );
              })}
              <div className="pt-2 border-t border-white/10 mt-2">
                <button
                  onClick={() => setShowLogoutDialog(true)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors text-red-300 hover:bg-red-500/20 hover:text-red-200"
                >
                  <LogOut className="w-4 h-4" />
                  {t("profile.logOut")}
                </button>
              </div>
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">

            {/* ── Profile Tab ── */}
            {activeTab === "Profile" && (
              isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="flex justify-center mb-8">
                    <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden text-3xl font-bold text-primary">
                      {profile?.avatarUrl ? (
                        <img src={profile.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{avatarLetter}</span>
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500">{t("profile.fullName")}</label>
                      <input
                        value={form.fullName}
                        disabled={!isEditing}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        onBlur={() => handleBlur("fullName")}
                        className={fieldClass("fullName")}
                        placeholder={isEditing ? t("profile.placeholderFullName") : ""}
                      />
                      {isEditing && touched.fullName && errors.fullName && (
                        <p className="text-xs text-red-500">{errors.fullName}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500">{t("profile.email")}</label>
                      <input
                        type="email"
                        value={form.email}
                        disabled={!isEditing}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        onBlur={() => handleBlur("email")}
                        className={fieldClass("email")}
                        placeholder={isEditing ? t("profile.placeholderEmail") : ""}
                      />
                      {isEditing && touched.email && errors.email && (
                        <p className="text-xs text-red-500">{errors.email}</p>
                      )}
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                      <div className="flex items-baseline justify-between">
                        <label className="text-xs font-semibold text-gray-500">{t("profile.password")}</label>
                        {isEditing && (
                          <span className="text-[10px] text-gray-400">{t("profile.changePasswordOptional")}</span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={(showPassword && passwordChanged) ? "text" : "password"}
                          autoComplete="new-password"
                          value={passwordChanged ? form.password : "••••••••••••"}
                          disabled={!isEditing}
                          onChange={(e) => handlePasswordChange(e.target.value)}
                          onFocus={() => {
                            if (isEditing && !passwordChanged) {
                              setPasswordChanged(true);
                              setForm({ ...form, password: "" });
                            }
                          }}
                          onBlur={() => {
                            handleBlur("password");
                            if (passwordChanged && !form.password) {
                              setPasswordChanged(false);
                              setForm({ ...form, password: PASSWORD_SENTINEL });
                            }
                          }}
                          className={`${fieldClass("password")} pe-10`}
                          placeholder={isEditing && passwordChanged ? t("profile.placeholderNewPassword") : ""}
                        />
                        {isEditing && passwordChanged && (
                          <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label={showPassword ? t("profile.hidePassword") : t("profile.showPassword")}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                      {isEditing && passwordChanged && touched.password && errors.password && (
                        <p className="text-xs text-red-500">{errors.password}</p>
                      )}
                      {isEditing && passwordChanged && form.password && (() => {
                        const strength = getPasswordStrength(form.password);
                        if (!strength) return null;
                        const cfg = STRENGTH_CONFIG[strength];
                        return (
                          <div className="space-y-1 mt-1">
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full ${cfg.bg} ${cfg.width} rounded-full transition-all duration-300`} />
                            </div>
                            <p className={`text-[10px] font-semibold ${cfg.color}`}>
                              {t("profile.strengthPassword")} {t(cfg.labelKey)}
                            </p>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Phone with country code */}
                    <CountryPhoneDropdown
                      selectedCountry={form.country}
                      onCountryChange={(c) => {
                        setForm({ ...form, country: c, phone: "" });
                        setTouched((t) => ({ ...t, phone: false }));
                      }}
                      phoneValue={form.phone}
                      onPhoneChange={(val) => {
                        setForm({ ...form, phone: val });
                        setTouched((t) => ({ ...t, phone: true }));
                      }}
                      disabled={!isEditing}
                      error={errors.phone}
                      touched={touched.phone}
                    />

                    {/* Country */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500">{t("profile.country")}</label>
                      <input
                        value={form.country.name}
                        disabled
                        readOnly
                        className={readOnlyClass}
                      />
                      <p className="text-xs text-gray-400">{t("profile.countryHint")}</p>
                    </div>

                    {/* City */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500">{t("profile.city")}</label>
                      <input
                        value={form.city}
                        disabled={!isEditing}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        onBlur={() => handleBlur("city")}
                        className={fieldClass("city")}
                        placeholder={isEditing ? t("profile.placeholderCity") : ""}
                      />
                      {isEditing && touched.city && errors.city && (
                        <p className="text-xs text-red-500">{errors.city}</p>
                      )}
                    </div>

                    {/* Buttons */}
                    <div className="col-span-full flex items-center justify-center gap-3 mt-2">
                      {!isEditing ? (
                        <button
                          type="button"
                          onClick={handleEdit}
                          className="px-12 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
                        >
                          {t("profile.editProfile")}
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={handleCancel}
                            className="px-8 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
                          >
                            {t("profile.cancel")}
                          </button>
                          <button
                            type="submit"
                            disabled={!isFormValid || updateMutation.isPending}
                            className="px-12 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updateMutation.isPending ? t("profile.saving") : t("profile.saveChanges")}
                          </button>
                        </>
                      )}
                    </div>
                  </form>
                </>
              )
            )}

            {/* ── My Pets Tab ── */}
            {activeTab === "My Pets" && (
              <>
                {(showAddPetModal || petToEdit) && (
                  <AddPetModal
                    onClose={() => { setShowAddPetModal(false); setPetToEdit(null); }}
                    onSuccess={() => refetchPets()}
                    userName={profile?.fullName ?? ""}
                    userPhone={profile?.phone ?? ""}
                    initialData={petToEdit ?? undefined}
                  />
                )}

                {petToDelete && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-[#1E2A3A] text-base">{t("profile.deletePetTitle")}</h3>
                          <p className="text-sm text-gray-500">{t("profile.deletePetSubtitle")}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-6">
                        {t("profile.deletePetConfirm")} <span className="font-semibold">"{petToDelete.name}"</span>?
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setPetToDelete(null)}
                          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          {t("profile.deletePetCancel")}
                        </button>
                        <button
                          onClick={() => {
                            deletePetMutation.mutate({ id: petToDelete.id }, {
                              onSuccess: () => {
                                toast({ title: t("profile.deletePetSuccess") });
                                setPetToDelete(null);
                                refetchPets();
                              },
                              onError: () => {
                                toast({ title: t("profile.deletePetError"), variant: "destructive" });
                              },
                            });
                          }}
                          disabled={deletePetMutation.isPending}
                          className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          {deletePetMutation.isPending ? t("profile.deletePetDeleting") : t("profile.deletePetConfirmBtn")}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {petsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="font-display font-bold text-lg text-[#1E2A3A]">{t("profile.myPets")}</h2>
                      <button
                        onClick={() => setShowAddPetModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
                      >
                        <Plus className="w-4 h-4" /> {t("profile.addPet")}
                      </button>
                    </div>
                    {(!myPets || (myPets as (Pet & { rejected?: boolean })[]).filter(p => p.status !== "adopted" && p.status !== "fostered").length === 0) ? (
                      <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-gray-100">
                        <PawPrint className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-base font-semibold text-[#1E2A3A]">{t("profile.noPets")}</p>
                        <p className="text-sm mt-1">{t("profile.addPet")}</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {(myPets as (Pet & { rejected?: boolean })[]).filter(p => p.status !== "adopted" && p.status !== "fostered").map((pet) => {
                          const approvalStatus = pet.rejected ? "rejected" : pet.approved ? "approved" : "pending";
                          const badgeMap = {
                            approved: { color: "bg-green-100 text-green-700", icon: CheckCircle2, label: t("profile.approved") },
                            pending: { color: "bg-yellow-100 text-yellow-700", icon: Clock, label: t("profile.pending") },
                            rejected: { color: "bg-red-100 text-red-600", icon: XCircle, label: t("profile.rejected") },
                          };
                          const badge = badgeMap[approvalStatus];
                          const BadgeIcon = badge.icon;
                          const isRejected = approvalStatus === "rejected";
                          return (
                            <div key={pet.id} className={`rounded-xl overflow-hidden border transition-all ${isRejected ? "bg-red-50 border-red-100" : "bg-gray-50 border-gray-100 hover:shadow-md"}`}>
                              <div className="relative">
                                <img
                                  src={pet.imageUrls?.[0] || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400"}
                                  alt={pet.name}
                                  className="w-full h-28 object-cover"
                                />
                                {isRejected && (
                                  <div className="absolute inset-0 bg-red-900/20 flex items-center justify-center">
                                    <XCircle className="w-8 h-8 text-white drop-shadow" />
                                  </div>
                                )}
                              </div>
                              <div className="p-3">
                                <p className="font-bold text-sm text-[#1E2A3A] truncate">{pet.name}</p>
                                <p className="text-xs text-gray-400 capitalize mb-2">{pet.type} · {pet.breed || "Mixed"}</p>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${badge.color}`}>
                                  <BadgeIcon className="w-3 h-3" />
                                  {badge.label}
                                </span>
                                {isRejected && (
                                  <p className="text-xs text-red-600 mt-2">Your submission did not meet our guidelines.</p>
                                )}
                                <div className="flex gap-2 mt-3">
                                  <button
                                    onClick={() => setPetToEdit(pet)}
                                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors"
                                  >
                                    <Edit2 className="w-3 h-3" /> Edit Pet Info
                                  </button>
                                  <button
                                    onClick={() => setPetToDelete(pet)}
                                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" /> Delete Pet
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* ── Applications Tab (owner incoming requests) ── */}
            {activeTab === "Applications" && (
              (incomingAdoptionLoading || incomingFosterLoading) ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display font-bold text-lg text-[#1E2A3A]">{t("profile.applications")}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{t("profile.noRequests")}</p>
                  </div>

                  {(() => {
                    const visibleAdoption = (incomingAdoptionRequests ?? []).filter(r => r.status !== "rejected");
                    const visibleFoster = (incomingFosterRequests ?? []).filter(r => r.status !== "rejected");
                    return visibleAdoption.length === 0 && visibleFoster.length === 0 ? (
                      <div className="text-center py-16 text-gray-400 bg-gray-50 rounded-2xl border border-gray-100">
                        <Inbox className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-lg font-semibold text-[#1E2A3A]">{t("profile.noRequests")}</p>
                        <p className="text-sm mt-1">{t("profile.noRequests")}</p>
                      </div>
                    ) : (
                      <>
                        {visibleAdoption.length > 0 && (
                          <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">{t("profile.adoptionRequests")}</h3>
                            <div className="space-y-2">
                              {visibleAdoption.map((req) => (
                                <button
                                  key={req.id}
                                  onClick={() => setSelectedIncomingRequest({ request: req, type: "adoption" })}
                                  className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-primary/30 hover:shadow-sm transition-all text-start"
                                >
                                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">
                                    {(req.requesterName || "?").charAt(0).toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-[#1E2A3A] truncate">{req.requesterName || t("profile.unknownApplicant")}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      {t("profile.wantsToAdopt")} <span className="font-semibold text-[#1E2A3A]">{req.petName || t("profile.yourPet")}</span>
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">{new Date(req.createdAt).toLocaleDateString()}</p>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <StatusBadge status={req.status} />
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {visibleFoster.length > 0 && (
                          <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">{t("profile.fosterRequests")}</h3>
                            <div className="space-y-2">
                              {visibleFoster.map((req) => (
                                <button
                                  key={req.id}
                                  onClick={() => setSelectedIncomingRequest({ request: req, type: "foster" })}
                                  className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-primary/30 hover:shadow-sm transition-all text-start"
                                >
                                  <div className="w-11 h-11 rounded-full bg-secondary/10 flex items-center justify-center shrink-0 text-secondary font-bold text-sm">
                                    {(req.requesterName || "?").charAt(0).toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-[#1E2A3A] truncate">{req.requesterName || t("profile.unknownApplicant")}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      {t("profile.wantsToFoster")} <span className="font-semibold text-[#1E2A3A]">{req.petName || t("profile.yourPet")}</span>
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">{new Date(req.createdAt).toLocaleDateString()}</p>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <StatusBadge status={req.status} />
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )
            )}

            {/* ── My Requests Tab (requester view) ── */}
            {activeTab === "My Requests" && (
              appLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display font-bold text-lg text-[#1E2A3A]">{t("profile.myRequests")}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{t("profile.noMyRequests")}</p>
                  </div>

                  <ReadinessProfileSection />

                  {!applications?.adoptionRequests?.length && !applications?.fosterRequests?.length ? (
                    <div className="text-center py-16 text-gray-400 bg-gray-50 rounded-2xl border border-gray-100">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-lg font-semibold text-[#1E2A3A]">{t("profile.noMyRequests")}</p>
                      <p className="text-sm mt-1">{t("profile.noMyRequests")}</p>
                      <Link href="/adopt" className="mt-4 inline-block px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm">
                        {t("adopt.title")}
                      </Link>
                    </div>
                  ) : (
                    <>
                      {(applications?.adoptionRequests?.length ?? 0) > 0 && (
                        <div>
                          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">{t("profile.adoptionRequests")}</h3>
                          <div className="space-y-3">
                            {applications?.adoptionRequests?.map((req) => {
                              const ageLabel = req.petAgeMonths != null
                                ? req.petAgeMonths < 12
                                  ? `${req.petAgeMonths}mo`
                                  : `${Math.floor(req.petAgeMonths / 12)}yr`
                                : null;
                              return (
                                <div
                                  key={req.id}
                                  onClick={() => setSelectedPetRequest({ request: req as MyRequestItem, type: "adoption" })}
                                  className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer"
                                >
                                  <img
                                    src={req.petImageUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200"}
                                    alt={req.petName || "Pet"}
                                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-[#1E2A3A] truncate">{req.petName || t("profile.unknownPet")}</p>
                                    <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                      {req.petType && <span className="text-xs capitalize text-gray-500">{req.petType}</span>}
                                      {ageLabel && <span className="text-xs text-gray-400">· {ageLabel}</span>}
                                      {req.petCity && <span className="text-xs text-gray-400">· {req.petCity}</span>}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5">{new Date(req.createdAt).toLocaleDateString()}</p>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <StatusBadge status={req.status} />
                                    <button
                                      onClick={e => { e.stopPropagation(); setDeletingRequest({ id: req.id, type: "adoption" }); }}
                                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                      title={t("profile.deleteRequest")}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {(applications?.fosterRequests?.length ?? 0) > 0 && (
                        <div>
                          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">{t("profile.fosterRequests")}</h3>
                          <div className="space-y-3">
                            {applications?.fosterRequests?.map((req) => {
                              const ageLabel = req.petAgeMonths != null
                                ? req.petAgeMonths < 12
                                  ? `${req.petAgeMonths}mo`
                                  : `${Math.floor(req.petAgeMonths / 12)}yr`
                                : null;
                              return (
                                <div
                                  key={req.id}
                                  onClick={() => setSelectedPetRequest({ request: req as MyRequestItem, type: "foster" })}
                                  className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer"
                                >
                                  <img
                                    src={req.petImageUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200"}
                                    alt={req.petName || "Pet"}
                                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-[#1E2A3A] truncate">{req.petName || t("profile.unknownPet")}</p>
                                    <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                      {req.petType && <span className="text-xs capitalize text-gray-500">{req.petType}</span>}
                                      {ageLabel && <span className="text-xs text-gray-400">· {ageLabel}</span>}
                                      {req.petCity && <span className="text-xs text-gray-400">· {req.petCity}</span>}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5">{new Date(req.createdAt).toLocaleDateString()}</p>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <StatusBadge status={req.status} />
                                    <button
                                      onClick={e => { e.stopPropagation(); setDeletingRequest({ id: req.id, type: "foster" }); }}
                                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                      title={t("profile.deleteRequest")}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            )}

            {/* ── Favourite Tab ── */}
            {activeTab === "Favourite" && (
              favLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : !favourites || favourites.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-lg font-semibold text-[#1E2A3A]">{t("profile.noFavourites")}</p>
                  <p className="text-sm mt-1">{t("profile.noFavourites")}</p>
                  <Link href="/adopt" className="mt-4 inline-block px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm">
                    {t("adopt.title")}
                  </Link>
                </div>
              ) : (
                <div>
                  <h2 className="font-display font-bold text-lg text-[#1E2A3A] mb-4">{t("profile.favourites")}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {favourites.map((pet) => (
                      <Link key={pet.id} href={`/pets/${pet.id}`}>
                        <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-all cursor-pointer">
                          <img
                            src={pet.imageUrls?.[0] || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400"}
                            alt={pet.name}
                            className="w-full h-28 object-cover"
                          />
                          <div className="p-3">
                            <p className="font-bold text-sm text-[#1E2A3A]">{pet.name}</p>
                            <p className="text-xs text-gray-400 capitalize">{pet.type} · {pet.city}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            )}

            {/* ── Notifications Tab ── */}
            {activeTab === "Notifications" && (
              <div className="space-y-4">
                <h2 className="font-display font-bold text-lg text-[#1E2A3A]">{t("profile.notifications")}</h2>
                {notifLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : !notifications || notifications.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100 text-gray-400">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-semibold text-[#1E2A3A]">{t("profile.noNotifications")}</p>
                    <p className="text-sm mt-1">{t("profile.noNotifications")}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => { if (!notif.read) markRead.mutate(notif.id); }}
                        className={`w-full text-start flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                          notif.read
                            ? "bg-white border-gray-100 opacity-70"
                            : "bg-primary/5 border-primary/20 hover:bg-primary/10"
                        }`}
                      >
                        <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                          notif.status === "accepted" ? "bg-green-100" : "bg-red-100"
                        }`}>
                          {notif.status === "accepted"
                            ? <CheckCircle2 className="w-5 h-5 text-green-600" />
                            : <XCircle className="w-5 h-5 text-red-500" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-[#1E2A3A]">
                              {notif.petName ?? t("profile.yourPet")}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                              notif.status === "accepted"
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-500"
                            }`}>
                              {notif.status === "accepted" ? t("profile.notifAccepted") : t("profile.notifRejected")}
                            </span>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Lost&Found Tab ── */}
            {activeTab === "Lost&Found" && (
              lfLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-display font-bold text-lg text-[#1E2A3A]">{t("profile.myLostFound")}</h2>
                      <p className="text-sm text-gray-500 mt-0.5">Your submitted reports and their current status.</p>
                    </div>
                    <Link href="/lost-found" className="text-sm font-bold text-primary hover:underline">
                      + New Report
                    </Link>
                  </div>


                  {!lostFoundData?.reports || lostFoundData.reports.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 bg-gray-50 rounded-2xl border border-gray-100">
                      <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-lg font-semibold text-[#1E2A3A]">{t("profile.noReports")}</p>
                      <p className="text-sm mt-1">Submit a report if you've lost or found a pet.</p>
                      <Link href="/lost-found" className="mt-4 inline-block px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm">
                        {t("lostFound.title")}
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {lostFoundData.reports.map((report) => {
                        const statusMap: Record<string, { label: string; className: string }> = {
                          pending: { label: "Pending", className: "bg-yellow-100 text-yellow-700" },
                          approved: { label: "Approved", className: "bg-green-100 text-green-700" },
                          rejected: { label: "Rejected", className: "bg-red-100 text-red-500" },
                          resolved: { label: "Resolved", className: "bg-gray-100 text-gray-500" },
                        };
                        const badge = statusMap[report.status] ?? { label: report.status, className: "bg-gray-100 text-gray-500" };
                        const isApproved = report.status === "approved";
                        return (
                          <div key={report.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                            <div className="relative">
                              <img
                                src={report.imageUrls?.[0] || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400"}
                                alt={report.name}
                                className="w-full h-32 object-cover"
                              />
                              <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-white text-xs font-bold ${report.reportType === "lost" ? "bg-red-500" : "bg-[#00B8A0]"}`}>
                                {report.reportType === "lost" ? t("lostFound.lost") : t("lostFound.found")}
                              </span>
                              <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold ${badge.className}`}>
                                {badge.label}
                              </span>
                            </div>
                            <div className="p-3">
                              <p className="font-bold text-sm text-[#1E2A3A]">{report.name}</p>
                              <p className="text-xs text-gray-400 capitalize">{report.type} · {[report.area, report.city].filter(Boolean).join(", ")}</p>
                              <p className="text-xs text-gray-300 mt-1">
                                {report.createdAt ? new Date(report.createdAt).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" }) : ""}
                              </p>
                              {isApproved && (
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={async () => {
                                      if (!confirm(`Mark as resolved?`)) return;
                                      try {
                                        await resolveLFMutation.mutateAsync({ id: report.id });
                                        toast({ title: "Report resolved" });
                                        refetchLF();
                                      } catch {
                                        toast({ title: "Failed to resolve", variant: "destructive" });
                                      }
                                    }}
                                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                  >
                                    {report.reportType === "lost" ? "Found My Pet" : "Found Owner"}
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (!confirm("Delete this report?")) return;
                                      try {
                                        await deleteLFMutation.mutateAsync({ id: report.id });
                                        toast({ title: "Report deleted" });
                                        refetchLF();
                                      } catch {
                                        toast({ title: "Failed to delete", variant: "destructive" });
                                      }
                                    }}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                              {!isApproved && (
                                <div className="mt-2">
                                  <button
                                    onClick={async () => {
                                      if (!confirm("Delete this report?")) return;
                                      try {
                                        await deleteLFMutation.mutateAsync({ id: report.id });
                                        toast({ title: "Report deleted" });
                                        refetchLF();
                                      } catch {
                                        toast({ title: "Failed to delete", variant: "destructive" });
                                      }
                                    }}
                                    className="w-full py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )
            )}

            {/* ── Volunteer Tab ── */}
            {activeTab === "Volunteer" && (
              <VolunteerSection profile={profile ?? null} />
            )}

          </div>
        </div>
      </div>
    </div>

    {/* Requester Profile Modal (owner view) */}
    {selectedIncomingRequest && (
      <RequesterProfileModal
        request={selectedIncomingRequest.request}
        requestType={selectedIncomingRequest.type}
        onClose={() => setSelectedIncomingRequest(null)}
        isLoading={updateAdoptionStatus.isPending || updateFosterStatus.isPending}
        onAccept={async () => {
          try {
            if (selectedIncomingRequest.type === "adoption") {
              await updateAdoptionStatus.mutateAsync({ id: selectedIncomingRequest.request.id, status: "approved" });
            } else {
              await updateFosterStatus.mutateAsync({ id: selectedIncomingRequest.request.id, status: "approved" });
            }
            const actionWord = selectedIncomingRequest.type === "adoption" ? "adopted" : "fostered";
            toast({
              title: t("profile.requestAccepted"),
              description: `This pet has been successfully ${actionWord} and removed from your profile.`,
            });
            setSelectedIncomingRequest(null);
          } catch (err: unknown) {
            const code = err instanceof Error ? (err as Error & { code?: string }).code : undefined;
            if (code === "pet_not_available") {
              toast({
                title: "Pet No Longer Available",
                description: (err as Error).message ?? "This pet has already been adopted or fostered.",
                variant: "destructive",
              });
            } else if (code === "request_not_pending") {
              toast({
                title: "Request Already Processed",
                description: (err as Error).message ?? "This request has already been processed.",
                variant: "destructive",
              });
            } else {
              toast({ title: t("profile.failedToAccept"), variant: "destructive" });
            }
          }
        }}
        onReject={async () => {
          try {
            if (selectedIncomingRequest.type === "adoption") {
              await updateAdoptionStatus.mutateAsync({ id: selectedIncomingRequest.request.id, status: "rejected" });
            } else {
              await updateFosterStatus.mutateAsync({ id: selectedIncomingRequest.request.id, status: "rejected" });
            }
            toast({ title: t("profile.requestRejected") });
            setSelectedIncomingRequest(null);
          } catch {
            toast({ title: t("profile.failedToReject"), variant: "destructive" });
          }
        }}
      />
    )}

    {/* Adoption Readiness Form (standalone) */}
    {showReadinessForm && (
      <AdoptionReadinessFormModal onClose={() => setShowReadinessForm(false)} />
    )}

    {/* Pet Detail Modal */}
    {selectedPetRequest && (
      <PetDetailModal
        request={selectedPetRequest.request}
        requestType={selectedPetRequest.type}
        onClose={() => setSelectedPetRequest(null)}
      />
    )}

    {/* Delete Request Confirmation */}
    {deletingRequest && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-[#1E2A3A]">{t("profile.deleteRequest")}</h3>
          </div>
          <p className="text-sm text-gray-500 mb-6">{t("profile.deleteRequest")}</p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeletingRequest(null)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-[#1E2A3A] hover:bg-gray-50 transition-colors"
            >
              {t("profile.cancel")}
            </button>
            <button
              onClick={async () => {
                try {
                  if (deletingRequest.type === "adoption") {
                    await deleteAdoptionMutation.mutateAsync(deletingRequest.id);
                  } else {
                    await deleteFosterMutation.mutateAsync(deletingRequest.id);
                  }
                  toast({ title: t("profile.requestDeletedToast") });
                  setDeletingRequest(null);
                } catch {
                  toast({ title: t("profile.failedToDeleteRequest"), variant: "destructive" });
                }
              }}
              disabled={deleteAdoptionMutation.isPending || deleteFosterMutation.isPending}
              className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {(deleteAdoptionMutation.isPending || deleteFosterMutation.isPending) ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : t("profile.deleteConfirmBtn")}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Log Out Confirmation Dialog */}
    {showLogoutDialog && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-[#1E2A3A]">{t("profile.logoutTitle")}</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">{t("profile.logoutDesc")}</p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowLogoutDialog(false)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-[#1E2A3A] hover:bg-gray-50 transition-colors"
            >
              {t("profile.cancel")}
            </button>
            <button
              onClick={handleLogoutConfirm}
              className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
            >
              {t("profile.logoutConfirm")}
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}

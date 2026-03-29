import { useState, useEffect, useRef, useMemo } from "react";
import {
  User, PawPrint, FileText, Heart, Bell, Users, MapPin, Edit2, Loader2, CheckCircle2, Clock, XCircle, ChevronDown, Search, X, Eye, EyeOff, LogOut, Plus, Camera, Inbox, Trash2, ChevronRight, ChevronLeft, ClipboardList,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Link, useLocation } from "wouter";
import {
  useGetMyProfile, useUpdateMyProfile, useGetMyPets, useGetMyApplications, useGetMyFavourites, useListLostFoundReports, useCreatePet, type Pet,
} from "@workspace/api-client-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

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
      if (!res.ok) throw new Error("Failed to fetch notifications");
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
      if (!res.ok) throw new Error("Failed to mark as read");
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
      if (!res.ok) throw new Error("Failed to fetch incoming adoption requests");
      return res.json();
    },
  });
}

function useGetIncomingFosterRequests() {
  return useQuery<IncomingRequest[]>({
    queryKey: ["/api/foster-requests/incoming"],
    queryFn: async () => {
      const res = await fetch("/api/foster-requests/incoming", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch incoming foster requests");
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
      if (!res.ok) throw new Error("Failed to update adoption request status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/adoption-requests/incoming"] });
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
      if (!res.ok) throw new Error("Failed to update foster request status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/foster-requests/incoming"] });
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
      if (!res.ok) throw new Error("Failed to delete adoption request");
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
      if (!res.ok) throw new Error("Failed to delete foster request");
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
      if (!res.ok) throw new Error("Failed to update adoption request");
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
      if (!res.ok) throw new Error("Failed to update foster request");
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
  const profile = request.requesterProfile;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-[#1E2A3A]">Adoption Readiness — {request.requesterName || "Requester"}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {requestType === "adoption" ? "Adoption" : "Foster"} request for {request.petName}
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
              <p className="text-xs font-semibold text-blue-600 mb-0.5 uppercase tracking-wide">Pet Requested</p>
              <p className="font-bold text-sm text-[#1E2A3A]">{request.petName || "Unknown Pet"}</p>
              <p className="text-xs text-gray-500 capitalize">{requestType === "adoption" ? "Adoption" : "Foster"} request</p>
            </div>
          </div>

          {request.message && (
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-orange-700 mb-1">Message from requester</p>
              <p className="text-sm text-gray-700">{request.message}</p>
            </div>
          )}

          {!profile ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">No adoption readiness profile found for this requester.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              {[
                ["Area of Residence", profile.areaOfResidence],
                ["Home Address", profile.homeAddress],
                ["Occupation", profile.occupation],
                ["Age", String(profile.age)],
                ["Main Caregiver", profile.mainCaregiver],
                ["Home Type", profile.homeType],
                ["Ownership Type", profile.ownershipType],
                ["Yard / Outdoor Space", profile.yardType],
                ["Number of Children", String(profile.childrenCount)],
                ["Household Objection", profile.householdObjection],
                ["Daytime Pet Location", profile.dayLocation],
                ["Nighttime Pet Location", profile.nightLocation],
                ["Exercise Hours / Day", `${profile.exerciseHours} hr${profile.exerciseHours !== 1 ? "s" : ""}`],
                ["Current Pets", profile.currentPets || "None"],
                ["Monthly Cost Estimate", `${profile.monthlyCostEstimation} JD`],
                ["Financial Responsibility", profile.financialResponsibility],
                ["Breeding Intention", profile.breedingIntention],
                ["Spay/Neuter Commitment", profile.spayNeuterCommitment ? "Yes" : "No"],
                ["Behavior Tolerance", profile.behaviorTolerance || "—"],
                ["Trauma Handling Comfort", profile.traumaHandlingComfort || "—"],
                ["Allergies", profile.allergies || "None"],
              ].map(([label, value]) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-500 mb-0.5">{label}</p>
                  <p className="text-sm text-[#1E2A3A]">{value}</p>
                </div>
              ))}

              <div className="sm:col-span-2 bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-gray-500 mb-0.5">Adoption Reason</p>
                <p className="text-sm text-[#1E2A3A]">{profile.adoptionReason}</p>
              </div>
              <div className="sm:col-span-2 bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-gray-500 mb-0.5">Daily Care Plan</p>
                <p className="text-sm text-[#1E2A3A]">{profile.dailyCarePlan}</p>
              </div>
              {profile.previousPetExperience && (
                <div className="sm:col-span-2 bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-500 mb-0.5">Previous Pet Experience</p>
                  <p className="text-sm text-[#1E2A3A]">{profile.previousPetExperience}</p>
                </div>
              )}
              {profile.travelPlan && (
                <div className="sm:col-span-2 bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-500 mb-0.5">Travel Plan</p>
                  <p className="text-sm text-[#1E2A3A]">{profile.travelPlan}</p>
                </div>
              )}

              {(profile.activities?.length ?? 0) > 0 && (
                <div className="sm:col-span-2 bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Activities</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.activities?.map(a => (
                      <span key={a} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">{a}</span>
                    ))}
                  </div>
                </div>
              )}
              {(profile.petPreferences?.length ?? 0) > 0 && (
                <div className="sm:col-span-2 bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Pet Preferences</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.petPreferences?.map(p => (
                      <span key={p} className="px-2 py-0.5 bg-secondary/10 text-secondary rounded-full text-xs font-medium">{p}</span>
                    ))}
                  </div>
                </div>
              )}
              {(profile.trainingExpectations?.length ?? 0) > 0 && (
                <div className="sm:col-span-2 bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Training Expectations</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.trainingExpectations?.map(t => (
                      <span key={t} className="px-2 py-0.5 bg-[#1E2A3A]/10 text-[#1E2A3A] rounded-full text-xs font-medium">{t}</span>
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
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Reject"}
            </button>
            <button
              onClick={onAccept}
              disabled={isLoading}
              className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Accept"}
            </button>
          </div>
        )}
        {request.status !== "pending" && (
          <div className="p-5 border-t border-gray-100 shrink-0 text-center">
            <StatusBadge status={request.status} />
            <p className="text-xs text-gray-400 mt-2">This request has already been {request.status}.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ReadinessProfileSection({ onEdit }: { onEdit: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [profileData, setProfileData] = useState<ReadinessFormData | null>(null);
  const [loading, setLoading] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/profile", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setProfileData({
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
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isExpanded) loadProfile();
  }, [isExpanded]);

  const isComplete = Boolean(
    profileData?.areaOfResidence && profileData?.occupation && profileData?.homeType && profileData?.dailyCarePlan
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <button
        onClick={() => setIsExpanded(v => !v)}
        className="w-full flex items-center gap-4 p-4 hover:bg-gray-50/70 transition-colors text-left"
      >
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <ClipboardList className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-[#1E2A3A]">Adoption Readiness Profile</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {loading ? "Loading…" : isComplete ? "Your profile is complete" : "Click to view or update your profile"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {profileData && (
            isComplete ? (
              <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                <CheckCircle2 className="w-3 h-3" /> Complete
              </span>
            ) : (
              <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                <Clock className="w-3 h-3" /> Incomplete
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
          ) : !profileData?.areaOfResidence ? (
            <div className="text-center py-8 text-gray-400">
              <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm text-[#1E2A3A] font-semibold mb-1">Profile not filled yet</p>
              <p className="text-xs mb-4">Fill in your readiness profile so shelters can review your application.</p>
              <button
                onClick={onEdit}
                className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
              >
                Fill Out Profile
              </button>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-3 text-sm mb-5">
                {([
                  ["Area of Residence", profileData.areaOfResidence],
                  ["Home Address", profileData.homeAddress],
                  ["Occupation", profileData.occupation],
                  ["Age", profileData.age],
                  ["Main Caregiver", profileData.mainCaregiver],
                  ["Home Type", profileData.homeType],
                  ["Ownership Type", profileData.ownershipType],
                  ["Yard / Outdoor Space", profileData.yardType],
                  ["Number of Children", profileData.childrenCount],
                  ["Household Objection", profileData.householdObjection],
                  ["Daytime Pet Location", profileData.dayLocation],
                  ["Nighttime Pet Location", profileData.nightLocation],
                  ["Exercise Hours / Day", profileData.exerciseHours ? `${profileData.exerciseHours} hrs` : ""],
                  ["Current Pets", profileData.currentPets || "None"],
                  ["Monthly Cost Estimate", profileData.monthlyCostEstimation ? `${profileData.monthlyCostEstimation} JD` : ""],
                  ["Financial Responsibility", profileData.financialResponsibility],
                  ["Breeding Intention", profileData.breedingIntention],
                  ["Spay/Neuter Commitment", profileData.spayNeuterCommitment ? "Yes" : "No"],
                  ["Allergies", profileData.allergies || "None"],
                  ["Behavior Tolerance", profileData.behaviorTolerance || "—"],
                  ["Trauma Handling", profileData.traumaHandlingComfort || "—"],
                ] as [string, string][]).filter(([, v]) => v).map(([label, value]) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-gray-500 mb-0.5">{label}</p>
                    <p className="text-sm text-[#1E2A3A]">{value}</p>
                  </div>
                ))}

                {profileData.adoptionReason && (
                  <div className="sm:col-span-2 bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-gray-500 mb-0.5">Adoption Reason</p>
                    <p className="text-sm text-[#1E2A3A]">{profileData.adoptionReason}</p>
                  </div>
                )}
                {profileData.dailyCarePlan && (
                  <div className="sm:col-span-2 bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-gray-500 mb-0.5">Daily Care Plan</p>
                    <p className="text-sm text-[#1E2A3A]">{profileData.dailyCarePlan}</p>
                  </div>
                )}
                {profileData.previousPetExperience && (
                  <div className="sm:col-span-2 bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-gray-500 mb-0.5">Previous Pet Experience</p>
                    <p className="text-sm text-[#1E2A3A]">{profileData.previousPetExperience}</p>
                  </div>
                )}
                {(profileData.activities?.length ?? 0) > 0 && (
                  <div className="sm:col-span-2 bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Activities</p>
                    <div className="flex flex-wrap gap-1">
                      {profileData.activities.map(a => (
                        <span key={a} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">{a}</span>
                      ))}
                    </div>
                  </div>
                )}
                {(profileData.petPreferences?.length ?? 0) > 0 && (
                  <div className="sm:col-span-2 bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Pet Preferences</p>
                    <div className="flex flex-wrap gap-1">
                      {profileData.petPreferences.map(p => (
                        <span key={p} className="px-2 py-0.5 bg-secondary/10 text-secondary rounded-full text-xs font-medium">{p}</span>
                      ))}
                    </div>
                  </div>
                )}
                {(profileData.trainingExpectations?.length ?? 0) > 0 && (
                  <div className="sm:col-span-2 bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Training Expectations</p>
                    <div className="flex flex-wrap gap-1">
                      {profileData.trainingExpectations.map(t => (
                        <span key={t} className="px-2 py-0.5 bg-[#1E2A3A]/10 text-[#1E2A3A] rounded-full text-xs font-medium">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={onEdit}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
                >
                  <Edit2 className="w-4 h-4" /> Edit Profile
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
            className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm"
          >
            <X className="w-4 h-4 text-gray-700" />
          </button>
          <div className="absolute bottom-3 left-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${requestType === "adoption" ? "bg-primary" : "bg-secondary"}`}>
              {requestType === "adoption" ? "Adoption" : "Foster"} Request
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h2 className="text-xl font-bold text-[#1E2A3A]">{request.petName || "Unknown Pet"}</h2>
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

const ACTIVITY_OPTIONS_MODAL = [
  "Morning walks", "Evening runs", "Hiking", "Swimming", "Dog park visits",
  "Training sessions", "Playtime indoors", "Agility sports", "Camping", "Road trips",
];
const PET_PREFERENCE_OPTIONS_MODAL = [
  "Dogs", "Cats", "Rabbits", "Birds", "Small animals",
  "Senior pets", "Puppies/kittens", "Mixed breeds", "Purebreds", "Special needs pets",
];
const TRAINING_EXPECTATION_OPTIONS_MODAL = [
  "Basic obedience", "House training", "Leash training", "Socialization",
  "Advanced commands", "Behavioral correction", "Agility training", "No training expected",
];

const READINESS_STEPS = [
  { title: "Personal Info", fields: ["areaOfResidence", "homeAddress", "occupation", "age", "mainCaregiver"] },
  { title: "Home & Lifestyle", fields: ["homeType", "ownershipType", "yardType", "childrenCount", "householdObjection"] },
  { title: "Pet Care", fields: ["dayLocation", "nightLocation", "exerciseHours", "currentPets", "previousPetExperience"] },
  { title: "Adoption Intent", fields: ["adoptionReason", "financialResponsibility", "monthlyCostEstimation", "breedingIntention", "spayNeuterCommitment"] },
  { title: "Activities & Preferences", fields: ["activities", "petPreferences", "trainingExpectations"] },
  { title: "Commitments", fields: ["allergies", "behaviorTolerance", "traumaHandlingComfort", "dailyCarePlan", "travelPlan", "confirmed"] },
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

function validateReadinessStep(step: number, form: ReadinessFormData): ReadinessFormErrors {
  const errors: ReadinessFormErrors = {};
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
    if (form.trainingExpectations.length === 0) errors.trainingExpectations = "Select at least one training expectation";
  }
  if (step === 5) {
    if (!form.dailyCarePlan.trim()) errors.dailyCarePlan = "Required";
    if (!form.confirmed) errors.confirmed = "You must confirm to proceed";
  }
  return errors;
}

const rfFieldClass = "w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all";
const rfLabelClass = "block text-sm font-semibold text-foreground mb-1";
const rfErrorClass = "text-xs text-red-500 mt-1";

interface MyRequestDetailModalProps {
  request: MyRequestItem;
  requestType: "adoption" | "foster";
  onClose: () => void;
  onDeleted: () => void;
}

function MyRequestDetailModal({ request, requestType, onClose, onDeleted }: MyRequestDetailModalProps) {
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
    const errs = validateReadinessStep(step, profileForm);
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
    const errs = validateReadinessStep(step, profileForm);
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
      toast({ title: "Request updated successfully" });
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
      toast({ title: "Request deleted" });
      onDeleted();
    } catch {
      toast({ title: "Failed to delete request", variant: "destructive" });
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
                  {requestType === "adoption" ? "Adoption" : "Foster"} Request — {request.petName || "Unknown Pet"}
                </h2>
                <div className="flex items-center gap-2">
                  <StatusBadge status={request.status} />
                  {!isPending && <span className="text-xs text-gray-400">Read-only — editing only available for pending requests</span>}
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Step {step + 1} of {READINESS_STEPS.length} — {READINESS_STEPS[step].title}</p>
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
                    <label className={rfLabelClass}>Message to Pet Owner</label>
                    <textarea
                      rows={3}
                      className={rfFieldClass}
                      disabled={!isPending}
                      value={requestMessage}
                      onChange={e => setRequestMessage(e.target.value)}
                      placeholder="Add a personal note to the pet owner..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">This message is specific to this request. Only editable while status is pending.</p>
                  </div>
                  <div>
                    <label className={rfLabelClass}>Area of Residence *</label>
                    <input className={rfFieldClass} disabled={!isPending} value={profileForm.areaOfResidence} onChange={e => set("areaOfResidence", e.target.value)} />
                    {formErrors.areaOfResidence && <p className={rfErrorClass}>{formErrors.areaOfResidence}</p>}
                  </div>
                  <div>
                    <label className={rfLabelClass}>Home Address *</label>
                    <input className={rfFieldClass} disabled={!isPending} value={profileForm.homeAddress} onChange={e => set("homeAddress", e.target.value)} />
                    {formErrors.homeAddress && <p className={rfErrorClass}>{formErrors.homeAddress}</p>}
                  </div>
                  <div>
                    <label className={rfLabelClass}>Occupation *</label>
                    <input className={rfFieldClass} disabled={!isPending} value={profileForm.occupation} onChange={e => set("occupation", e.target.value)} />
                    {formErrors.occupation && <p className={rfErrorClass}>{formErrors.occupation}</p>}
                  </div>
                  <div>
                    <label className={rfLabelClass}>Age *</label>
                    <input type="number" min={18} max={120} className={rfFieldClass} disabled={!isPending} value={profileForm.age} onChange={e => set("age", e.target.value)} />
                    {formErrors.age && <p className={rfErrorClass}>{formErrors.age}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className={rfLabelClass}>Main Caregiver *</label>
                    <select className={rfFieldClass} disabled={!isPending} value={profileForm.mainCaregiver} onChange={e => set("mainCaregiver", e.target.value)}>
                      <option value="">Select...</option>
                      <option>Myself</option><option>Spouse / Partner</option><option>Family member</option><option>Shared responsibility</option>
                    </select>
                    {formErrors.mainCaregiver && <p className={rfErrorClass}>{formErrors.mainCaregiver}</p>}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className={rfLabelClass}>Home Type *</label>
                    <select className={rfFieldClass} disabled={!isPending} value={profileForm.homeType} onChange={e => set("homeType", e.target.value)}>
                      <option value="">Select...</option>
                      <option>Apartment</option><option>Villa</option><option>House</option><option>Townhouse</option><option>Studio</option>
                    </select>
                    {formErrors.homeType && <p className={rfErrorClass}>{formErrors.homeType}</p>}
                  </div>
                  <div>
                    <label className={rfLabelClass}>Ownership Type *</label>
                    <select className={rfFieldClass} disabled={!isPending} value={profileForm.ownershipType} onChange={e => set("ownershipType", e.target.value)}>
                      <option value="">Select...</option>
                      <option>Owner</option><option>Renting</option><option>Family home</option>
                    </select>
                    {formErrors.ownershipType && <p className={rfErrorClass}>{formErrors.ownershipType}</p>}
                  </div>
                  <div>
                    <label className={rfLabelClass}>Yard / Outdoor Space *</label>
                    <select className={rfFieldClass} disabled={!isPending} value={profileForm.yardType} onChange={e => set("yardType", e.target.value)}>
                      <option value="">Select...</option>
                      <option>No outdoor space</option><option>Small balcony</option><option>Large balcony</option><option>Small yard</option><option>Large yard / garden</option>
                    </select>
                    {formErrors.yardType && <p className={rfErrorClass}>{formErrors.yardType}</p>}
                  </div>
                  <div>
                    <label className={rfLabelClass}>Number of Children in Home</label>
                    <input type="number" min={0} className={rfFieldClass} disabled={!isPending} value={profileForm.childrenCount} onChange={e => set("childrenCount", e.target.value)} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={rfLabelClass}>Any household member object to having a pet? *</label>
                    <select className={rfFieldClass} disabled={!isPending} value={profileForm.householdObjection} onChange={e => set("householdObjection", e.target.value)}>
                      <option value="">Select...</option>
                      <option>No, everyone agrees</option><option>Some are hesitant but open</option><option>Yes, there may be resistance</option>
                    </select>
                    {formErrors.householdObjection && <p className={rfErrorClass}>{formErrors.householdObjection}</p>}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className={rfLabelClass}>Where will the pet spend daytime? *</label>
                    <select className={rfFieldClass} disabled={!isPending} value={profileForm.dayLocation} onChange={e => set("dayLocation", e.target.value)}>
                      <option value="">Select...</option>
                      <option>Indoors with family</option><option>Indoors alone</option><option>Outdoors in yard</option><option>Mix of indoor/outdoor</option>
                    </select>
                    {formErrors.dayLocation && <p className={rfErrorClass}>{formErrors.dayLocation}</p>}
                  </div>
                  <div>
                    <label className={rfLabelClass}>Where will the pet sleep at night? *</label>
                    <select className={rfFieldClass} disabled={!isPending} value={profileForm.nightLocation} onChange={e => set("nightLocation", e.target.value)}>
                      <option value="">Select...</option>
                      <option>In bedroom</option><option>In living room</option><option>In crate</option><option>Outdoors</option><option>Dedicated pet room</option>
                    </select>
                    {formErrors.nightLocation && <p className={rfErrorClass}>{formErrors.nightLocation}</p>}
                  </div>
                  <div>
                    <label className={rfLabelClass}>Exercise hours per day *</label>
                    <input type="number" min={0} max={24} className={rfFieldClass} disabled={!isPending} value={profileForm.exerciseHours} onChange={e => set("exerciseHours", e.target.value)} />
                    {formErrors.exerciseHours && <p className={rfErrorClass}>{formErrors.exerciseHours}</p>}
                  </div>
                  <div>
                    <label className={rfLabelClass}>Current pets at home</label>
                    <input className={rfFieldClass} disabled={!isPending} value={profileForm.currentPets} onChange={e => set("currentPets", e.target.value)} placeholder="e.g. 1 dog, 2 cats (or None)" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={rfLabelClass}>Previous pet experience</label>
                    <textarea rows={3} className={rfFieldClass} disabled={!isPending} value={profileForm.previousPetExperience} onChange={e => set("previousPetExperience", e.target.value)} placeholder="Describe your experience with pets..." />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className={rfLabelClass}>Why do you want to adopt? *</label>
                    <textarea rows={3} className={rfFieldClass} disabled={!isPending} value={profileForm.adoptionReason} onChange={e => set("adoptionReason", e.target.value)} />
                    {formErrors.adoptionReason && <p className={rfErrorClass}>{formErrors.adoptionReason}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className={rfLabelClass}>Who will be financially responsible? *</label>
                    <select className={rfFieldClass} disabled={!isPending} value={profileForm.financialResponsibility} onChange={e => set("financialResponsibility", e.target.value)}>
                      <option value="">Select...</option>
                      <option>Myself</option><option>Partner / Spouse</option><option>Shared</option><option>Family</option>
                    </select>
                    {formErrors.financialResponsibility && <p className={rfErrorClass}>{formErrors.financialResponsibility}</p>}
                  </div>
                  <div>
                    <label className={rfLabelClass}>Estimated monthly cost (JD) *</label>
                    <input type="number" min={0} className={rfFieldClass} disabled={!isPending} value={profileForm.monthlyCostEstimation} onChange={e => set("monthlyCostEstimation", e.target.value)} />
                    {formErrors.monthlyCostEstimation && <p className={rfErrorClass}>{formErrors.monthlyCostEstimation}</p>}
                  </div>
                  <div>
                    <label className={rfLabelClass}>Intention to breed? *</label>
                    <select className={rfFieldClass} disabled={!isPending} value={profileForm.breedingIntention} onChange={e => set("breedingIntention", e.target.value)}>
                      <option value="">Select...</option>
                      <option>No, not planning to breed</option><option>Possibly in the future</option><option>Yes, planning to breed</option>
                    </select>
                    {formErrors.breedingIntention && <p className={rfErrorClass}>{formErrors.breedingIntention}</p>}
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-3">
                    <input type="checkbox" id="spay-modal" checked={profileForm.spayNeuterCommitment} disabled={!isPending} onChange={e => set("spayNeuterCommitment", e.target.checked)} className="w-4 h-4 accent-[#FF6B35]" />
                    <label htmlFor="spay-modal" className="text-sm text-foreground">I commit to spaying/neutering the pet if not already done</label>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <label className={rfLabelClass}>Activities you enjoy *</label>
                    {formErrors.activities && <p className={rfErrorClass}>{formErrors.activities}</p>}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                      {ACTIVITY_OPTIONS_MODAL.map(opt => (
                        <button key={opt} type="button" disabled={!isPending} onClick={() => toggleArr("activities", opt)}
                          className={`text-left px-3 py-2 rounded-xl text-sm font-medium border transition-all ${profileForm.activities.includes(opt) ? "bg-primary text-white border-primary" : "bg-white border-border hover:border-primary/50"} ${!isPending ? "opacity-60 cursor-not-allowed" : ""}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={rfLabelClass}>Pet preferences *</label>
                    {formErrors.petPreferences && <p className={rfErrorClass}>{formErrors.petPreferences}</p>}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                      {PET_PREFERENCE_OPTIONS_MODAL.map(opt => (
                        <button key={opt} type="button" disabled={!isPending} onClick={() => toggleArr("petPreferences", opt)}
                          className={`text-left px-3 py-2 rounded-xl text-sm font-medium border transition-all ${profileForm.petPreferences.includes(opt) ? "bg-secondary text-white border-secondary" : "bg-white border-border hover:border-secondary/50"} ${!isPending ? "opacity-60 cursor-not-allowed" : ""}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={rfLabelClass}>Training expectations *</label>
                    {formErrors.trainingExpectations && <p className={rfErrorClass}>{formErrors.trainingExpectations}</p>}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                      {TRAINING_EXPECTATION_OPTIONS_MODAL.map(opt => (
                        <button key={opt} type="button" disabled={!isPending} onClick={() => toggleArr("trainingExpectations", opt)}
                          className={`text-left px-3 py-2 rounded-xl text-sm font-medium border transition-all ${profileForm.trainingExpectations.includes(opt) ? "bg-[#1E2A3A] text-white border-[#1E2A3A]" : "bg-white border-border hover:border-[#1E2A3A]/50"} ${!isPending ? "opacity-60 cursor-not-allowed" : ""}`}>
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
                    <label className={rfLabelClass}>Allergies</label>
                    <input className={rfFieldClass} disabled={!isPending} value={profileForm.allergies} onChange={e => set("allergies", e.target.value)} placeholder="Describe or write None" />
                  </div>
                  <div>
                    <label className={rfLabelClass}>Behavior challenges you can tolerate</label>
                    <select className={rfFieldClass} disabled={!isPending} value={profileForm.behaviorTolerance} onChange={e => set("behaviorTolerance", e.target.value)}>
                      <option value="">Select...</option>
                      <option>None — I prefer a well-behaved pet</option>
                      <option>Minor issues (chewing, jumping)</option>
                      <option>Moderate issues with proper training</option>
                      <option>Significant behavioral challenges</option>
                    </select>
                  </div>
                  <div>
                    <label className={rfLabelClass}>Comfort handling a pet with trauma</label>
                    <select className={rfFieldClass} disabled={!isPending} value={profileForm.traumaHandlingComfort} onChange={e => set("traumaHandlingComfort", e.target.value)}>
                      <option value="">Select...</option>
                      <option>Not comfortable</option><option>Somewhat comfortable</option><option>Comfortable with guidance</option><option>Very comfortable</option>
                    </select>
                  </div>
                  <div>
                    <label className={rfLabelClass}>Travel plan for your pet</label>
                    <input className={rfFieldClass} disabled={!isPending} value={profileForm.travelPlan} onChange={e => set("travelPlan", e.target.value)} placeholder="e.g. Stay with family, pet hotel..." />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={rfLabelClass}>Daily care plan *</label>
                    <textarea rows={3} className={rfFieldClass} disabled={!isPending} value={profileForm.dailyCarePlan} onChange={e => set("dailyCarePlan", e.target.value)} placeholder="Describe your daily routine for the pet..." />
                    {formErrors.dailyCarePlan && <p className={rfErrorClass}>{formErrors.dailyCarePlan}</p>}
                  </div>
                  <div className="sm:col-span-2 bg-primary/5 border border-primary/20 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <input type="checkbox" id="confirmed-modal" checked={profileForm.confirmed} disabled={!isPending} onChange={e => set("confirmed", e.target.checked)} className="w-4 h-4 mt-0.5 accent-[#FF6B35]" />
                      <label htmlFor="confirmed-modal" className="text-sm text-foreground leading-relaxed">
                        I confirm that all information provided is accurate and that I understand the responsibilities of pet adoption/fostering.
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
              Delete Request
            </button>
            {step > 0 && (
              <button onClick={handleBack} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted/50 text-sm font-semibold transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
          </div>

          {step < READINESS_STEPS.length - 1 ? (
            <button onClick={handleNext} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : isPending ? (
            <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all disabled:opacity-50">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Save Changes
            </button>
          ) : (
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-300 transition-all">
              Close
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
              <h3 className="text-lg font-bold text-[#1E2A3A]">Delete Request</h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this request? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-[#1E2A3A] hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={isDeleting} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50">
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function AdoptionReadinessFormModal({ onClose }: { onClose: () => void }) {
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
    const errs = validateReadinessStep(step, profileForm);
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
    const errs = validateReadinessStep(step, profileForm);
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
      toast({ title: "Adoption readiness form saved!" });
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
        <div className="flex items-center justify-between px-6 pt-6 pb-3 shrink-0">
          <div>
            <h2 className="font-display text-lg font-bold text-[#1E2A3A]">Adoption Readiness Form</h2>
            <p className="text-sm text-muted-foreground">Step {step + 1} of {READINESS_STEPS.length} — {READINESS_STEPS[step].title}</p>
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
                  <div>
                    <label className={rfLabelClass}>Area of Residence *</label>
                    <input className={rfFieldClass} value={profileForm.areaOfResidence} onChange={e => set("areaOfResidence", e.target.value)} />
                    {formErrors.areaOfResidence && <p className={rfErrorClass}>{formErrors.areaOfResidence}</p>}
                  </div>
                  <div>
                    <label className={rfLabelClass}>Home Address *</label>
                    <input className={rfFieldClass} value={profileForm.homeAddress} onChange={e => set("homeAddress", e.target.value)} />
                    {formErrors.homeAddress && <p className={rfErrorClass}>{formErrors.homeAddress}</p>}
                  </div>
                  <div>
                    <label className={rfLabelClass}>Occupation *</label>
                    <input className={rfFieldClass} value={profileForm.occupation} onChange={e => set("occupation", e.target.value)} />
                    {formErrors.occupation && <p className={rfErrorClass}>{formErrors.occupation}</p>}
                  </div>
                  <div>
                    <label className={rfLabelClass}>Age *</label>
                    <input type="number" min={18} max={120} className={rfFieldClass} value={profileForm.age} onChange={e => set("age", e.target.value)} />
                    {formErrors.age && <p className={rfErrorClass}>{formErrors.age}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className={rfLabelClass}>Main Caregiver *</label>
                    <select className={rfFieldClass} value={profileForm.mainCaregiver} onChange={e => set("mainCaregiver", e.target.value)}>
                      <option value="">Select...</option>
                      <option>Myself</option><option>Spouse / Partner</option><option>Family member</option><option>Shared responsibility</option>
                    </select>
                    {formErrors.mainCaregiver && <p className={rfErrorClass}>{formErrors.mainCaregiver}</p>}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className={rfLabelClass}>Home Type *</label>
                    <select className={rfFieldClass} value={profileForm.homeType} onChange={e => set("homeType", e.target.value)}>
                      <option value="">Select...</option>
                      <option>Apartment</option><option>Villa</option><option>House</option><option>Townhouse</option><option>Studio</option>
                    </select>
                    {formErrors.homeType && <p className={rfErrorClass}>{formErrors.homeType}</p>}
                  </div>
                  <div>
                    <label className={rfLabelClass}>Ownership Type *</label>
                    <select className={rfFieldClass} value={profileForm.ownershipType} onChange={e => set("ownershipType", e.target.value)}>
                      <option value="">Select...</option>
                      <option>Owner</option><option>Renting</option><option>Family home</option>
                    </select>
                    {formErrors.ownershipType && <p className={rfErrorClass}>{formErrors.ownershipType}</p>}
                  </div>
                  <div>
                    <label className={rfLabelClass}>Yard / Outdoor Space *</label>
                    <select className={rfFieldClass} value={profileForm.yardType} onChange={e => set("yardType", e.target.value)}>
                      <option value="">Select...</option>
                      <option>No outdoor space</option><option>Small balcony</option><option>Large balcony</option><option>Small yard</option><option>Large yard / garden</option>
                    </select>
                    {formErrors.yardType && <p className={rfErrorClass}>{formErrors.yardType}</p>}
                  </div>
                  <div>
                    <label className={rfLabelClass}>Number of Children in Home</label>
                    <input type="number" min={0} className={rfFieldClass} value={profileForm.childrenCount} onChange={e => set("childrenCount", e.target.value)} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={rfLabelClass}>Any household member object to having a pet? *</label>
                    <select className={rfFieldClass} value={profileForm.householdObjection} onChange={e => set("householdObjection", e.target.value)}>
                      <option value="">Select...</option>
                      <option>No, everyone agrees</option><option>Some are hesitant but open</option><option>Yes, there may be resistance</option>
                    </select>
                    {formErrors.householdObjection && <p className={rfErrorClass}>{formErrors.householdObjection}</p>}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className={rfLabelClass}>Where will the pet spend daytime? *</label>
                    <select className={rfFieldClass} value={profileForm.dayLocation} onChange={e => set("dayLocation", e.target.value)}>
                      <option value="">Select...</option>
                      <option>Indoors with family</option><option>Indoors alone</option><option>Outdoors in yard</option><option>Mix of indoor/outdoor</option>
                    </select>
                    {formErrors.dayLocation && <p className={rfErrorClass}>{formErrors.dayLocation}</p>}
                  </div>
                  <div>
                    <label className={rfLabelClass}>Where will the pet sleep at night? *</label>
                    <select className={rfFieldClass} value={profileForm.nightLocation} onChange={e => set("nightLocation", e.target.value)}>
                      <option value="">Select...</option>
                      <option>In bedroom</option><option>In living room</option><option>In crate</option><option>Outdoors</option><option>Dedicated pet room</option>
                    </select>
                    {formErrors.nightLocation && <p className={rfErrorClass}>{formErrors.nightLocation}</p>}
                  </div>
                  <div>
                    <label className={rfLabelClass}>Exercise hours per day *</label>
                    <input type="number" min={0} max={24} className={rfFieldClass} value={profileForm.exerciseHours} onChange={e => set("exerciseHours", e.target.value)} />
                    {formErrors.exerciseHours && <p className={rfErrorClass}>{formErrors.exerciseHours}</p>}
                  </div>
                  <div>
                    <label className={rfLabelClass}>Current pets at home</label>
                    <input className={rfFieldClass} value={profileForm.currentPets} onChange={e => set("currentPets", e.target.value)} placeholder="e.g. 1 dog, 2 cats (or None)" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={rfLabelClass}>Previous pet experience</label>
                    <textarea rows={3} className={rfFieldClass} value={profileForm.previousPetExperience} onChange={e => set("previousPetExperience", e.target.value)} placeholder="Describe your experience with pets..." />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className={rfLabelClass}>Why do you want to adopt? *</label>
                    <textarea rows={3} className={rfFieldClass} value={profileForm.adoptionReason} onChange={e => set("adoptionReason", e.target.value)} />
                    {formErrors.adoptionReason && <p className={rfErrorClass}>{formErrors.adoptionReason}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className={rfLabelClass}>Who will be financially responsible? *</label>
                    <select className={rfFieldClass} value={profileForm.financialResponsibility} onChange={e => set("financialResponsibility", e.target.value)}>
                      <option value="">Select...</option>
                      <option>Myself</option><option>Partner / Spouse</option><option>Shared</option><option>Family</option>
                    </select>
                    {formErrors.financialResponsibility && <p className={rfErrorClass}>{formErrors.financialResponsibility}</p>}
                  </div>
                  <div>
                    <label className={rfLabelClass}>Estimated monthly cost (JD) *</label>
                    <input type="number" min={0} className={rfFieldClass} value={profileForm.monthlyCostEstimation} onChange={e => set("monthlyCostEstimation", e.target.value)} />
                    {formErrors.monthlyCostEstimation && <p className={rfErrorClass}>{formErrors.monthlyCostEstimation}</p>}
                  </div>
                  <div>
                    <label className={rfLabelClass}>Intention to breed? *</label>
                    <select className={rfFieldClass} value={profileForm.breedingIntention} onChange={e => set("breedingIntention", e.target.value)}>
                      <option value="">Select...</option>
                      <option>No, not planning to breed</option><option>Possibly in the future</option><option>Yes, planning to breed</option>
                    </select>
                    {formErrors.breedingIntention && <p className={rfErrorClass}>{formErrors.breedingIntention}</p>}
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-3">
                    <input type="checkbox" id="spay-readiness" checked={profileForm.spayNeuterCommitment} onChange={e => set("spayNeuterCommitment", e.target.checked)} className="w-4 h-4 accent-[#FF6B35]" />
                    <label htmlFor="spay-readiness" className="text-sm text-foreground">I commit to spaying/neutering the pet if not already done</label>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <label className={rfLabelClass}>Activities you enjoy *</label>
                    {formErrors.activities && <p className={rfErrorClass}>{formErrors.activities}</p>}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                      {ACTIVITY_OPTIONS_MODAL.map(opt => (
                        <button key={opt} type="button" onClick={() => toggleArr("activities", opt)}
                          className={`text-left px-3 py-2 rounded-xl text-sm font-medium border transition-all ${profileForm.activities.includes(opt) ? "bg-primary text-white border-primary" : "bg-white border-border hover:border-primary/50"}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={rfLabelClass}>Pet preferences *</label>
                    {formErrors.petPreferences && <p className={rfErrorClass}>{formErrors.petPreferences}</p>}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                      {PET_PREFERENCE_OPTIONS_MODAL.map(opt => (
                        <button key={opt} type="button" onClick={() => toggleArr("petPreferences", opt)}
                          className={`text-left px-3 py-2 rounded-xl text-sm font-medium border transition-all ${profileForm.petPreferences.includes(opt) ? "bg-secondary text-white border-secondary" : "bg-white border-border hover:border-secondary/50"}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={rfLabelClass}>Training expectations *</label>
                    {formErrors.trainingExpectations && <p className={rfErrorClass}>{formErrors.trainingExpectations}</p>}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                      {TRAINING_EXPECTATION_OPTIONS_MODAL.map(opt => (
                        <button key={opt} type="button" onClick={() => toggleArr("trainingExpectations", opt)}
                          className={`text-left px-3 py-2 rounded-xl text-sm font-medium border transition-all ${profileForm.trainingExpectations.includes(opt) ? "bg-[#1E2A3A] text-white border-[#1E2A3A]" : "bg-white border-border hover:border-[#1E2A3A]/50"}`}>
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
                    <label className={rfLabelClass}>Allergies</label>
                    <input className={rfFieldClass} value={profileForm.allergies} onChange={e => set("allergies", e.target.value)} placeholder="Describe or write None" />
                  </div>
                  <div>
                    <label className={rfLabelClass}>Behavior challenges you can tolerate</label>
                    <select className={rfFieldClass} value={profileForm.behaviorTolerance} onChange={e => set("behaviorTolerance", e.target.value)}>
                      <option value="">Select...</option>
                      <option>None — I prefer a well-behaved pet</option>
                      <option>Minor issues (chewing, jumping)</option>
                      <option>Moderate issues with proper training</option>
                      <option>Significant behavioral challenges</option>
                    </select>
                  </div>
                  <div>
                    <label className={rfLabelClass}>Comfort handling a pet with trauma</label>
                    <select className={rfFieldClass} value={profileForm.traumaHandlingComfort} onChange={e => set("traumaHandlingComfort", e.target.value)}>
                      <option value="">Select...</option>
                      <option>Not comfortable</option><option>Somewhat comfortable</option><option>Comfortable with guidance</option><option>Very comfortable</option>
                    </select>
                  </div>
                  <div>
                    <label className={rfLabelClass}>Travel plan for your pet</label>
                    <input className={rfFieldClass} value={profileForm.travelPlan} onChange={e => set("travelPlan", e.target.value)} placeholder="e.g. Stay with family, pet hotel..." />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={rfLabelClass}>Daily care plan *</label>
                    <textarea rows={3} className={rfFieldClass} value={profileForm.dailyCarePlan} onChange={e => set("dailyCarePlan", e.target.value)} placeholder="Describe your daily routine for the pet..." />
                    {formErrors.dailyCarePlan && <p className={rfErrorClass}>{formErrors.dailyCarePlan}</p>}
                  </div>
                  <div className="sm:col-span-2 bg-primary/5 border border-primary/20 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <input type="checkbox" id="confirmed-readiness" checked={profileForm.confirmed} onChange={e => set("confirmed", e.target.checked)} className="w-4 h-4 mt-0.5 accent-[#FF6B35]" />
                      <label htmlFor="confirmed-readiness" className="text-sm text-foreground leading-relaxed">
                        I confirm that all information provided is accurate and that I understand the responsibilities of pet adoption/fostering.
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
          <div>
            {step > 0 && (
              <button onClick={handleBack} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-muted/50 text-sm font-semibold transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
          </div>
          {step < READINESS_STEPS.length - 1 ? (
            <button onClick={handleNext} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all disabled:opacity-50">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Save Form
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import {
  parsePhoneNumberFromString,
  getCountries,
  getCountryCallingCode,
  AsYouType,
  CountryCode,
} from "libphonenumber-js";

const sidebarLinks = [
  { label: "Profile", icon: User },
  { label: "My Pets", icon: PawPrint },
  { label: "Applications", icon: Inbox },
  { label: "My Requests", icon: FileText },
  { label: "Favourite", icon: Heart },
  { label: "Notifications", icon: Bell },
  { label: "Volunteer", icon: Users },
  { label: "Lost&Found", icon: MapPin },
];

const REGION_NAMES = new Intl.DisplayNames(["en"], { type: "region" });

interface CountryOption {
  code: CountryCode;
  name: string;
  dialCode: string;
  flag: string;
}

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

const ALL_COUNTRIES: CountryOption[] = getCountries()
  .map((code) => {
    const name = REGION_NAMES.of(code) ?? code;
    const dialCode = `+${getCountryCallingCode(code)}`;
    return { code, name, dialCode, flag: getFlagEmoji(code) };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

function findCountryByName(name: string): CountryOption | undefined {
  return ALL_COUNTRIES.find((c) => c.name.toLowerCase() === name.toLowerCase());
}

function findCountryByCode(code: string): CountryOption | undefined {
  return ALL_COUNTRIES.find((c) => c.code === code);
}

interface CountryPhoneDropdownProps {
  selectedCountry: CountryOption;
  onCountryChange: (country: CountryOption) => void;
  phoneValue: string;
  onPhoneChange: (val: string) => void;
  disabled?: boolean;
  error?: string;
  touched?: boolean;
}

const LISTBOX_ID = "country-listbox";

function CountryPhoneDropdown({
  selectedCountry,
  onCountryChange,
  phoneValue,
  onPhoneChange,
  disabled,
  error,
  touched,
}: CountryPhoneDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return ALL_COUNTRIES;
    return ALL_COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.dialCode.includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [search]);

  useEffect(() => {
    if (open) {
      setFocusedIndex(Math.max(0, filtered.findIndex((c) => c.code === selectedCountry.code)));
      setTimeout(() => searchRef.current?.focus(), 50);
    } else {
      setSearch("");
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setFocusedIndex(0);
    }
  }, [search]);

  useEffect(() => {
    if (open && listRef.current) {
      const item = listRef.current.querySelectorAll("[role='option']")[focusedIndex] as HTMLElement | undefined;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [focusedIndex, open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const chosen = filtered[focusedIndex];
      if (chosen) {
        onCountryChange(chosen);
        setOpen(false);
        triggerRef.current?.focus();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  const hasError = touched && !!error;

  return (
    <div className="space-y-1">
      <label id="phone-label" className="text-xs font-semibold text-gray-500">Phone Number</label>
      <div className={`flex rounded-xl border overflow-visible ${hasError ? "border-red-400" : "border-gray-200"} ${disabled ? "bg-gray-50" : "bg-white"}`}>
        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <button
            ref={triggerRef}
            type="button"
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={open ? LISTBOX_ID : undefined}
            aria-label={`Country code: ${selectedCountry.name} ${selectedCountry.dialCode}`}
            onClick={() => !disabled && setOpen((v) => !v)}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " " || e.key === "ArrowDown") && !disabled) {
                e.preventDefault();
                setOpen(true);
              } else if (e.key === "Escape") {
                setOpen(false);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-[#1E2A3A] border-r border-gray-200 rounded-l-xl transition-colors h-full ${
              disabled ? "cursor-default opacity-60 bg-gray-50" : "hover:bg-gray-50 cursor-pointer"
            }`}
          >
            <span className="text-base leading-none" aria-hidden="true">{selectedCountry.flag}</span>
            <span className="text-xs text-gray-500">{selectedCountry.dialCode}</span>
            {!disabled && <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />}
          </button>

          {open && (
            <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="p-2 border-b border-gray-100">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                  <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" aria-hidden="true" />
                  <input
                    ref={searchRef}
                    role="combobox"
                    aria-autocomplete="list"
                    aria-controls={LISTBOX_ID}
                    aria-activedescendant={filtered[focusedIndex] ? `country-option-${filtered[focusedIndex].code}` : undefined}
                    aria-label="Search country"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Search country..."
                    className="flex-1 bg-transparent text-sm outline-none text-[#1E2A3A] placeholder-gray-400"
                  />
                  {search && (
                    <button type="button" onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600" aria-label="Clear search">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <div
                id={LISTBOX_ID}
                role="listbox"
                aria-label="Countries"
                ref={listRef}
                className="max-h-52 overflow-y-auto"
              >
                {filtered.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No results</p>
                ) : (
                  filtered.map((c, idx) => (
                    <button
                      key={c.code}
                      id={`country-option-${c.code}`}
                      role="option"
                      aria-selected={c.code === selectedCountry.code}
                      type="button"
                      onClick={() => {
                        onCountryChange(c);
                        setOpen(false);
                        triggerRef.current?.focus();
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-gray-50 ${
                        c.code === selectedCountry.code ? "bg-primary/5 font-semibold" : ""
                      } ${idx === focusedIndex ? "bg-gray-100 outline-none" : ""}`}
                    >
                      <span className="text-base" aria-hidden="true">{c.flag}</span>
                      <span className="flex-1 text-[#1E2A3A] truncate">{c.name}</span>
                      <span className="text-gray-400 text-xs font-mono">{c.dialCode}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <input
          type="tel"
          value={phoneValue}
          disabled={disabled}
          aria-labelledby="phone-label"
          aria-invalid={hasError}
          aria-describedby={hasError ? "phone-error" : undefined}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^\d\s\-().+]/g, "");
            const formatter = new AsYouType(selectedCountry.code);
            const formatted = formatter.input(raw.replace(/\D/g, ""));
            onPhoneChange(formatted);
          }}
          className={`flex-1 px-3 py-2.5 text-sm text-[#1E2A3A] outline-none rounded-r-xl focus:ring-2 focus:ring-inset ${
            hasError ? "focus:ring-red-300" : "focus:ring-primary/20"
          } ${disabled ? "bg-gray-50 text-gray-500" : "bg-white"}`}
          placeholder={disabled ? "" : `Enter phone number`}
        />
      </div>
      {hasError && <p id="phone-error" className="text-xs text-red-500 mt-0.5" role="alert">{error}</p>}
    </div>
  );
}

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
  if (!email.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email address";
  return undefined;
}

function validatePhone(phone: string, countryCode: CountryCode): string | undefined {
  if (!phone.trim()) return "Phone number is required";
  const parsed = parsePhoneNumberFromString(phone, countryCode);
  if (!parsed || !parsed.isValid()) return "Invalid phone number for selected country";
  return undefined;
}

function validatePassword(password: string): string | undefined {
  if (!password || password === PASSWORD_SENTINEL) return undefined;
  if (password.length < 8) return "Password must be at least 8 characters";
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

const STRENGTH_CONFIG: Record<PasswordStrength, { label: string; color: string; bg: string; width: string }> = {
  weak:   { label: "Weak",   color: "text-red-500",    bg: "bg-red-400",    width: "w-1/3" },
  medium: { label: "Medium", color: "text-yellow-500",  bg: "bg-yellow-400", width: "w-2/3" },
  strong: { label: "Strong", color: "text-green-500",   bg: "bg-green-500",  width: "w-full" },
};

function validateForm(form: FormState): ErrorsState {
  const errors: ErrorsState = {};
  if (!form.fullName.trim()) errors.fullName = "Full name is required";
  const emailErr = validateEmail(form.email);
  if (emailErr) errors.email = emailErr;
  const pwErr = validatePassword(form.password);
  if (pwErr) errors.password = pwErr;
  const phoneErr = validatePhone(form.phone, form.country.code);
  if (phoneErr) errors.phone = phoneErr;
  if (!form.city.trim()) errors.city = "City is required";
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
}

function AddPetModal({ onClose, onSuccess, userName }: AddPetModalProps) {
  const { toast } = useToast();
  const createPet = useCreatePet();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [section, setSection] = useState<1 | 2>(1);

  const [form, setForm] = useState({
    name: "",
    type: "dog",
    breed: "",
    birthday: "",
    gender: "male",
    weightKg: "",
    sterilized: false as boolean,
    yearlyVaccines: false as boolean,
    story: "",
    whatsappUrl: "",
    purpose: "adopt" as "adopt" | "foster" | "both",
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const ageDisplay = useMemo(() => calculateAge(form.birthday), [form.birthday]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const newFiles = [...imageFiles, ...files];
    const newPreviews = [...imagePreviews, ...files.map(f => URL.createObjectURL(f))];
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const removeImage = (idx: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== idx);
    const newPreviews = imagePreviews.filter((_, i) => i !== idx);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const validateSection1 = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Pet name is required";
    if (!form.type) e.type = "Type is required";
    if (!form.breed.trim()) e.breed = "Breed is required";
    if (!form.birthday) e.birthday = "Birthdate is required";
    if (!form.gender) e.gender = "Gender is required";
    if (!form.weightKg.trim()) e.weightKg = "Weight is required";
    if (!form.story.trim()) e.story = "Pet story is required";
    if (imageFiles.length === 0) e.images = "At least one photo is required";
    return e;
  };

  const validateSection2 = () => {
    const e: Record<string, string> = {};
    if (!form.whatsappUrl.trim()) e.whatsappUrl = "WhatsApp URL is required";
    if (!form.purpose) e.purpose = "Availability type is required";
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

    let imageUrls: string[] = imagePreviews;
    try {
      if (imageFiles.length > 0) {
        imageUrls = await filesToBase64(imageFiles);
      }
    } catch {
      imageUrls = imagePreviews;
    }

    const ageMonths = (() => {
      if (!form.birthday) return 0;
      const birth = new Date(form.birthday);
      const now = new Date();
      return Math.max(0, (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth()));
    })();

    createPet.mutate(
      {
        data: {
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
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Your pet has been submitted for review" });
          onSuccess();
          onClose();
        },
        onError: () => {
          toast({ title: "Failed to submit pet. Please try again.", variant: "destructive" });
        },
      }
    );
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
            <h2 className="text-lg font-bold text-[#1E2A3A]">Add a Pet</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {section === 1 ? "Section 1 of 2 — Pet Information" : "Section 2 of 2 — Owner Information"}
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
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Pet Name *</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    onBlur={() => setTouched(t => ({ ...t, name: true }))}
                    className={inputCls("name")}
                    placeholder="e.g. Buddy"
                  />
                  {touched.name && errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Type *</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className={inputCls("type")}
                  >
                    {["dog", "cat", "rabbit", "bird", "other"].map(t => (
                      <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Breed *</label>
                  <input
                    value={form.breed}
                    onChange={e => setForm(f => ({ ...f, breed: e.target.value }))}
                    onBlur={() => setTouched(t => ({ ...t, breed: true }))}
                    className={inputCls("breed")}
                    placeholder="e.g. Labrador"
                  />
                  {touched.breed && errors.breed && <p className="text-xs text-red-500 mt-0.5">{errors.breed}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Birthdate *</label>
                  <input
                    type="date"
                    value={form.birthday}
                    onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))}
                    onBlur={() => setTouched(t => ({ ...t, birthday: true }))}
                    max={new Date().toISOString().split("T")[0]}
                    className={inputCls("birthday")}
                  />
                  {touched.birthday && errors.birthday && <p className="text-xs text-red-500 mt-0.5">{errors.birthday}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Age (auto-calculated)</label>
                  <input
                    value={ageDisplay}
                    readOnly
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-500 cursor-default outline-none"
                    placeholder="Select birthdate"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Gender *</label>
                  <select
                    value={form.gender}
                    onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                    className={inputCls("gender")}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Weight (kg) *</label>
                  <input
                    value={form.weightKg}
                    onChange={e => setForm(f => ({ ...f, weightKg: e.target.value }))}
                    onBlur={() => setTouched(t => ({ ...t, weightKg: true }))}
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
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Sterilized *</label>
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
                        {val ? "Yes" : "No"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Yearly Vaccines *</label>
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
                        {val ? "Yes" : "No"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Pet Story *</label>
                <textarea
                  value={form.story}
                  onChange={e => setForm(f => ({ ...f, story: e.target.value }))}
                  onBlur={() => setTouched(t => ({ ...t, story: true }))}
                  rows={3}
                  className={`${inputCls("story")} resize-none`}
                  placeholder="Tell us about your pet's personality, history, and what makes them special..."
                />
                {touched.story && errors.story && <p className="text-xs text-red-500 mt-0.5">{errors.story}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">Photos *</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors hover:bg-gray-50 ${
                    touched.images && errors.images ? "border-red-400" : "border-gray-200"
                  }`}
                >
                  <Camera className="w-6 h-6 mx-auto mb-1.5 text-gray-300" />
                  <p className="text-sm text-gray-500">Click to upload photos</p>
                  <p className="text-xs text-gray-400 mt-0.5">Multiple photos allowed</p>
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
                {imagePreviews.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {imagePreviews.map((src, idx) => (
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
                  Next: Owner Info →
                </button>
              </div>
            </div>
          )}

          {section === 2 && (
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Your Name</label>
                <input
                  value={userName}
                  readOnly
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-500 cursor-default outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">WhatsApp URL *</label>
                <input
                  value={form.whatsappUrl}
                  onChange={e => setForm(f => ({ ...f, whatsappUrl: e.target.value }))}
                  onBlur={() => setTouched(t => ({ ...t, whatsappUrl: true }))}
                  className={inputCls("whatsappUrl")}
                  placeholder="https://wa.me/9627xxxxxxxx"
                  type="url"
                />
                {touched.whatsappUrl && errors.whatsappUrl && (
                  <p className="text-xs text-red-500 mt-0.5">{errors.whatsappUrl}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">Format: https://wa.me/[country code][number]</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">Availability *</label>
                <div className="flex gap-2">
                  {[
                    { value: "adopt", label: "Adoption" },
                    { value: "foster", label: "Foster" },
                    { value: "both", label: "Both" },
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
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={createPet.isPending}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {createPet.isPending ? (
                    <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</span>
                  ) : (
                    "Submit Pet"
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
      if (!res.ok) throw new Error("Failed to fetch volunteer application");
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
    if (!data.name.trim()) errs.name = "Name is required";
    if (!data.phone.trim()) errs.phone = "Phone is required";
    else if (!phoneRegex.test(data.phone.trim())) errs.phone = "Invalid phone format (digits, spaces, +, -, () allowed)";
    if (!data.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) errs.email = "Invalid email address";
    if (!data.city.trim()) errs.city = "City is required";
    if (!data.address.trim()) errs.address = "Address is required";
    if (!data.skills.trim()) errs.skills = "Skills are required";
    if (!data.motivation.trim()) errs.motivation = "Please tell us why you want to join";
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
        toast({ title: "Application resubmitted!", description: "We'll review your updated application soon." });
      } else {
        await submitMutation.mutateAsync(form);
        toast({ title: "Application submitted!", description: "We'll review your application and get back to you soon." });
      }
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit application";
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
          <h2 className="text-xl font-bold text-[#1E2A3A] mb-2">Application Submitted!</h2>
          <p className="text-sm text-gray-500 mb-6">
            Thank you for your interest in volunteering with Tabanni. We'll review your application and get back to you soon.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
          >
            Close
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
              {isResubmit ? "Edit & Resubmit Application" : "Join Organization"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Apply to volunteer with Tabanni</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-5">
            {/* Application Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Application Type *</label>
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
                    Become a Member
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
                    One-time Activity
                  </span>
                </button>
              </div>
            </div>

            {/* Auto-filled fields */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Full Name *</label>
                <input
                  className={inputCls("name")}
                  value={form.name}
                  onChange={e => setField("name", e.target.value)}
                  onBlur={() => touch("name")}
                  placeholder="Your full name"
                />
                {touchedFields.has("name") && formErrors.name && (
                  <p className="text-xs text-red-500 mt-0.5">{formErrors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Phone *</label>
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
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email *</label>
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
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">City *</label>
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
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Address *</label>
              <input
                className={inputCls("address")}
                value={form.address}
                onChange={e => setField("address", e.target.value)}
                onBlur={() => touch("address")}
                placeholder="Your full address"
              />
              {touchedFields.has("address") && formErrors.address && (
                <p className="text-xs text-red-500 mt-0.5">{formErrors.address}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Skills *</label>
              <input
                className={inputCls("skills")}
                value={form.skills}
                onChange={e => setField("skills", e.target.value)}
                onBlur={() => touch("skills")}
                placeholder="e.g. Animal care, first aid, photography..."
              />
              {touchedFields.has("skills") && formErrors.skills && (
                <p className="text-xs text-red-500 mt-0.5">{formErrors.skills}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Why do you want to join Tabanni? *</label>
              <textarea
                rows={4}
                className={inputCls("motivation")}
                value={form.motivation}
                onChange={e => setField("motivation", e.target.value)}
                onBlur={() => touch("motivation")}
                placeholder="Tell us about your motivation to volunteer..."
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                </span>
              ) : isResubmit ? "Resubmit Application" : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function VolunteerSection({ profile }: { profile: { fullName?: string | null; email?: string | null; phone?: string | null; city?: string | null } | null }) {
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
      <h2 className="font-display font-bold text-lg text-[#1E2A3A]">Volunteer</h2>

      {!application ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-bold text-[#1E2A3A] mb-2">Make a Difference</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Join the Tabanni team as a member or volunteer for a one-time activity. Help animals find their forever homes.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
          >
            Join Organization
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Application Type</p>
              <p className="font-bold text-[#1E2A3A]">
                {application.applicationType === "member" ? "Become a Member" : "One-time Volunteer Activity"}
              </p>
            </div>
            <div className="shrink-0">
              {application.status === "pending" && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                  <Clock className="w-3.5 h-3.5" /> Pending Review
                </span>
              )}
              {application.status === "accepted" && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
                </span>
              )}
              {application.status === "rejected" && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-600 rounded-full text-xs font-bold">
                  <XCircle className="w-3.5 h-3.5" /> Rejected
                </span>
              )}
            </div>
          </div>

          {application.status === "pending" && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-sm text-yellow-800">
              Your application is under review. We'll notify you once it's been processed.
            </div>
          )}

          {application.status === "accepted" && (
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-800">
              Congratulations! Your application has been accepted. Welcome to the Tabanni team!
            </div>
          )}

          {application.status === "rejected" && (
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-800">
                Unfortunately, your application was not accepted this time. You can update your details and resubmit below.
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="w-full py-2.5 border-2 border-primary text-primary rounded-xl font-bold text-sm hover:bg-primary/5 transition-colors"
              >
                Edit & Resubmit Application
              </button>
            </div>
          )}

          <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
            {[
              ["Name", application.name],
              ["Email", application.email],
              ["Phone", application.phone],
              ["City", application.city],
            ].map(([label, value]) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-gray-500 mb-0.5">{label}</p>
                <p className="text-sm text-[#1E2A3A]">{value}</p>
              </div>
            ))}
            <div className="sm:col-span-2 bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-500 mb-0.5">Address</p>
              <p className="text-sm text-[#1E2A3A]">{application.address}</p>
            </div>
            <div className="sm:col-span-2 bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-500 mb-0.5">Skills</p>
              <p className="text-sm text-[#1E2A3A]">{application.skills}</p>
            </div>
            <div className="sm:col-span-2 bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-500 mb-0.5">Motivation</p>
              <p className="text-sm text-[#1E2A3A]">{application.motivation}</p>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-4">
            Submitted on {new Date(application.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
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
  const { toast } = useToast();
  const { logout } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("Profile");
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const { data: profile, isLoading } = useGetMyProfile();
  const updateMutation = useUpdateMyProfile();
  const { data: myPets, isLoading: petsLoading, refetch: refetchPets } = useGetMyPets();
  const { data: applications, isLoading: appLoading } = useGetMyApplications();
  const { data: favourites, isLoading: favLoading } = useGetMyFavourites();
  const { data: notifications, isLoading: notifLoading } = useGetMyNotifications();
  const markRead = useMarkNotificationRead();
  const { data: lostFoundData, isLoading: lfLoading } = useListLostFoundReports({ limit: 20 });

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
    if (tab) setActiveTab(tab);
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

    const parsedPhone = parsePhoneNumberFromString(form.phone, form.country.code);
    const e164Phone = parsedPhone?.format("E.164") ?? `${form.country.dialCode}${form.phone.replace(/\D/g, "")}`;

    const updateData: Record<string, string> = {
      fullName: form.fullName,
      email: form.email,
      phone: e164Phone,
      country: form.country.name,
      city: form.city,
    };

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
      toast({ title: "Profile saved successfully." });
    } catch {
      toast({ title: "Failed to save profile", variant: "destructive" });
    }
  };

  const handleLogoutConfirm = async () => {
    await logout();
    setLocation("/");
  };

  const displayName = profile?.fullName || "User";
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
                onClick={() => { setActiveTab("Profile"); handleEdit(); }}
                className="flex items-center gap-1 mt-1.5 bg-white/10 hover:bg-white/20 rounded-full px-3 py-1 text-xs transition-colors"
              >
                <Edit2 className="w-3 h-3" /> Edit Profile
              </button>
            </div>

            <nav className="space-y-1">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                const isActive = activeTab === link.label;
                return (
                  <button
                    key={link.label}
                    onClick={() => setActiveTab(link.label)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive ? "bg-white text-[#1E2A3A]" : "text-white/70 hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </button>
                );
              })}
              <div className="pt-2 border-t border-white/10 mt-2">
                <button
                  onClick={() => setShowLogoutDialog(true)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors text-red-300 hover:bg-red-500/20 hover:text-red-200"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
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
                      <label className="text-xs font-semibold text-gray-500">Full Name</label>
                      <input
                        value={form.fullName}
                        disabled={!isEditing}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        onBlur={() => handleBlur("fullName")}
                        className={fieldClass("fullName")}
                        placeholder={isEditing ? "Your full name" : ""}
                      />
                      {isEditing && touched.fullName && errors.fullName && (
                        <p className="text-xs text-red-500">{errors.fullName}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500">Email</label>
                      <input
                        type="email"
                        value={form.email}
                        disabled={!isEditing}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        onBlur={() => handleBlur("email")}
                        className={fieldClass("email")}
                        placeholder={isEditing ? "your@email.com" : ""}
                      />
                      {isEditing && touched.email && errors.email && (
                        <p className="text-xs text-red-500">{errors.email}</p>
                      )}
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                      <div className="flex items-baseline justify-between">
                        <label className="text-xs font-semibold text-gray-500">Password</label>
                        {isEditing && (
                          <span className="text-[10px] text-gray-400">Change password (optional)</span>
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
                          className={`${fieldClass("password")} pr-10`}
                          placeholder={isEditing && passwordChanged ? "Enter new password" : ""}
                        />
                        {isEditing && passwordChanged && (
                          <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label={showPassword ? "Hide password" : "Show password"}
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
                              Password strength: {cfg.label}
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
                      <label className="text-xs font-semibold text-gray-500">Country</label>
                      <input
                        value={form.country.name}
                        disabled
                        readOnly
                        className={readOnlyClass}
                      />
                      <p className="text-xs text-gray-400">Country is set via the phone field above.</p>
                    </div>

                    {/* City */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500">City</label>
                      <input
                        value={form.city}
                        disabled={!isEditing}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        onBlur={() => handleBlur("city")}
                        className={fieldClass("city")}
                        placeholder={isEditing ? "Your city" : ""}
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
                          Edit Profile
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={handleCancel}
                            className="px-8 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={!isFormValid || updateMutation.isPending}
                            className="px-12 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updateMutation.isPending ? "Saving..." : "Save"}
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
                {showAddPetModal && (
                  <AddPetModal
                    onClose={() => setShowAddPetModal(false)}
                    onSuccess={() => refetchPets()}
                    userName={profile?.fullName ?? ""}
                  />
                )}
                {petsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="font-display font-bold text-lg text-[#1E2A3A]">My Pets</h2>
                      <button
                        onClick={() => setShowAddPetModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Add Pet
                      </button>
                    </div>
                    {(!myPets || myPets.length === 0) ? (
                      <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-gray-100">
                        <PawPrint className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-base font-semibold text-[#1E2A3A]">No pets listed yet</p>
                        <p className="text-sm mt-1">Click "Add Pet" to submit a pet for adoption or fostering.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {(myPets as (Pet & { rejected?: boolean })[]).map((pet) => {
                          const approvalStatus = pet.rejected ? "rejected" : pet.approved ? "approved" : "pending";
                          const badgeMap = {
                            approved: { color: "bg-green-100 text-green-700", icon: CheckCircle2, label: "Approved" },
                            pending: { color: "bg-yellow-100 text-yellow-700", icon: Clock, label: "Pending" },
                            rejected: { color: "bg-red-100 text-red-600", icon: XCircle, label: "Rejected" },
                          };
                          const badge = badgeMap[approvalStatus];
                          const BadgeIcon = badge.icon;
                          return (
                            <div key={pet.id} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-all">
                              <div className="relative">
                                <img
                                  src={pet.imageUrls?.[0] || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400"}
                                  alt={pet.name}
                                  className="w-full h-28 object-cover"
                                />
                              </div>
                              <div className="p-3">
                                <p className="font-bold text-sm text-[#1E2A3A] truncate">{pet.name}</p>
                                <p className="text-xs text-gray-400 capitalize mb-2">{pet.type} · {pet.breed || "Mixed"}</p>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${badge.color}`}>
                                  <BadgeIcon className="w-3 h-3" />
                                  {badge.label}
                                </span>
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
                    <h2 className="font-display font-bold text-lg text-[#1E2A3A]">Applications</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Incoming requests from people wanting to adopt or foster your pets.</p>
                  </div>

                  {(() => {
                    const visibleAdoption = (incomingAdoptionRequests ?? []).filter(r => r.status !== "rejected");
                    const visibleFoster = (incomingFosterRequests ?? []).filter(r => r.status !== "rejected");
                    return visibleAdoption.length === 0 && visibleFoster.length === 0 ? (
                      <div className="text-center py-16 text-gray-400 bg-gray-50 rounded-2xl border border-gray-100">
                        <Inbox className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-lg font-semibold text-[#1E2A3A]">No incoming requests yet</p>
                        <p className="text-sm mt-1">When someone requests to adopt or foster your pet, it will show here.</p>
                      </div>
                    ) : (
                      <>
                        {visibleAdoption.length > 0 && (
                          <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Adoption Requests</h3>
                            <div className="space-y-2">
                              {visibleAdoption.map((req) => (
                                <button
                                  key={req.id}
                                  onClick={() => setSelectedIncomingRequest({ request: req, type: "adoption" })}
                                  className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-primary/30 hover:shadow-sm transition-all text-left"
                                >
                                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">
                                    {(req.requesterName || "?").charAt(0).toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-[#1E2A3A] truncate">{req.requesterName || "Unknown Applicant"}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      Wants to adopt <span className="font-semibold text-[#1E2A3A]">{req.petName || "your pet"}</span>
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
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Foster Requests</h3>
                            <div className="space-y-2">
                              {visibleFoster.map((req) => (
                                <button
                                  key={req.id}
                                  onClick={() => setSelectedIncomingRequest({ request: req, type: "foster" })}
                                  className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-primary/30 hover:shadow-sm transition-all text-left"
                                >
                                  <div className="w-11 h-11 rounded-full bg-secondary/10 flex items-center justify-center shrink-0 text-secondary font-bold text-sm">
                                    {(req.requesterName || "?").charAt(0).toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-[#1E2A3A] truncate">{req.requesterName || "Unknown Applicant"}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      Wants to foster <span className="font-semibold text-[#1E2A3A]">{req.petName || "your pet"}</span>
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
                    <h2 className="font-display font-bold text-lg text-[#1E2A3A]">My Requests</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Your adoption and foster requests.</p>
                  </div>

                  <ReadinessProfileSection onEdit={() => setShowReadinessForm(true)} />

                  {!applications?.adoptionRequests?.length && !applications?.fosterRequests?.length ? (
                    <div className="text-center py-16 text-gray-400 bg-gray-50 rounded-2xl border border-gray-100">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-lg font-semibold text-[#1E2A3A]">No requests yet</p>
                      <p className="text-sm mt-1">You haven't submitted any adoption or foster requests yet.</p>
                      <Link href="/adopt" className="mt-4 inline-block px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm">
                        Browse Pets
                      </Link>
                    </div>
                  ) : (
                    <>
                      {(applications?.adoptionRequests?.length ?? 0) > 0 && (
                        <div>
                          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Adoption Requests</h3>
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
                                    <p className="font-bold text-sm text-[#1E2A3A] truncate">{req.petName || "Unknown Pet"}</p>
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
                                      title="Delete request"
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
                          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Foster Requests</h3>
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
                                    <p className="font-bold text-sm text-[#1E2A3A] truncate">{req.petName || "Unknown Pet"}</p>
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
                                      title="Delete request"
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
                  <p className="text-lg font-semibold text-[#1E2A3A]">No favourites yet</p>
                  <p className="text-sm mt-1">Save pets to your favourites while browsing.</p>
                  <Link href="/adopt" className="mt-4 inline-block px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm">
                    Browse Pets
                  </Link>
                </div>
              ) : (
                <div>
                  <h2 className="font-display font-bold text-lg text-[#1E2A3A] mb-4">Saved Pets</h2>
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
                <h2 className="font-display font-bold text-lg text-[#1E2A3A]">Notifications</h2>
                {notifLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : !notifications || notifications.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100 text-gray-400">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-semibold text-[#1E2A3A]">No notifications yet</p>
                    <p className="text-sm mt-1">You'll be notified when your pet submissions are reviewed.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => { if (!notif.read) markRead.mutate(notif.id); }}
                        className={`w-full text-left flex items-start gap-4 p-4 rounded-xl border transition-colors ${
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
                              {notif.petName ?? "Your pet"}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                              notif.status === "accepted"
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-500"
                            }`}>
                              {notif.status === "accepted" ? "Accepted" : "Rejected"}
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
                <div>
                  <h2 className="font-display font-bold text-lg text-[#1E2A3A] mb-4">Recent Lost & Found Reports</h2>
                  {!lostFoundData?.reports || lostFoundData.reports.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                      <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-lg font-semibold text-[#1E2A3A]">No reports yet</p>
                      <Link href="/lost-found" className="mt-4 inline-block px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm">
                        View Lost & Found
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {lostFoundData.reports.slice(0, 6).map((report) => (
                        <div key={report.id} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                          <div className="relative">
                            <img
                              src={report.imageUrls?.[0] || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400"}
                              alt={report.name}
                              className="w-full h-24 object-cover"
                            />
                            <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-white text-xs font-bold ${report.reportType === "lost" ? "bg-red-500" : "bg-[#00B8A0]"}`}>
                              {report.reportType === "lost" ? "LOST" : "FOUND"}
                            </span>
                          </div>
                          <div className="p-3">
                            <p className="font-bold text-sm text-[#1E2A3A]">{report.name}</p>
                            <p className="text-xs text-gray-400 capitalize">{report.type} · {report.city}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 text-center">
                    <Link href="/lost-found" className="text-primary text-sm font-bold hover:underline">
                      View All Reports →
                    </Link>
                  </div>
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
            toast({ title: "Request accepted", description: `${selectedIncomingRequest.request.petName} has been marked as ${selectedIncomingRequest.type === "adoption" ? "adopted" : "fostered"}.` });
            setSelectedIncomingRequest(null);
          } catch {
            toast({ title: "Failed to accept request", variant: "destructive" });
          }
        }}
        onReject={async () => {
          try {
            if (selectedIncomingRequest.type === "adoption") {
              await updateAdoptionStatus.mutateAsync({ id: selectedIncomingRequest.request.id, status: "rejected" });
            } else {
              await updateFosterStatus.mutateAsync({ id: selectedIncomingRequest.request.id, status: "rejected" });
            }
            toast({ title: "Request rejected" });
            setSelectedIncomingRequest(null);
          } catch {
            toast({ title: "Failed to reject request", variant: "destructive" });
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
            <h3 className="text-lg font-bold text-[#1E2A3A]">Delete Request</h3>
          </div>
          <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this request? This cannot be undone.</p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeletingRequest(null)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-[#1E2A3A] hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                try {
                  if (deletingRequest.type === "adoption") {
                    await deleteAdoptionMutation.mutateAsync(deletingRequest.id);
                  } else {
                    await deleteFosterMutation.mutateAsync(deletingRequest.id);
                  }
                  toast({ title: "Request deleted" });
                  setDeletingRequest(null);
                } catch {
                  toast({ title: "Failed to delete request", variant: "destructive" });
                }
              }}
              disabled={deleteAdoptionMutation.isPending || deleteFosterMutation.isPending}
              className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {(deleteAdoptionMutation.isPending || deleteFosterMutation.isPending) ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : "Delete"}
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
            <h2 className="text-lg font-bold text-[#1E2A3A]">Log Out</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">Are you sure you want to log out?</p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowLogoutDialog(false)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-[#1E2A3A] hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleLogoutConfirm}
              className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}

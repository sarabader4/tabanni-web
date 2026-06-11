import { useState } from "react";
import { useListAdoptionRequests, useUpdateAdoptionRequestStatus } from "@workspace/api-client-react";
import { Heart, CheckCircle, XCircle, Clock, Eye, X, MapPin, User, Phone, Mail } from "lucide-react";
import { AdminLayout } from "./index";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-gray-50 rounded-xl">
      <p className="text-xs text-gray-500 font-semibold mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}

function MessageModal({ message, petName, onClose }: { message: string; petName: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Message — {petName}</h3>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5">
          <p className="text-sm text-gray-600 leading-relaxed">{message || "No message provided."}</p>
        </div>
      </div>
    </div>
  );
}

function ProfileModal({ req, onClose }: { req: any; onClose: () => void }) {
  const profile = req.requesterProfile;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="font-bold text-gray-900">Requester Profile</h3>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-6">

          {/* Basic Info */}
          <div className="flex items-center gap-4">
            {req.requesterAvatar ? (
              <img src={req.requesterAvatar} alt={req.requesterName} className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                <User className="w-8 h-8 text-orange-400" />
              </div>
            )}
            <div>
              <p className="font-bold text-gray-900 text-lg">{req.requesterName ?? `User #${req.requesterId}`}</p>
              <p className="text-sm text-gray-500">ID #{req.requesterId}</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {req.requesterEmail && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{req.requesterEmail}</p>
                </div>
              </div>
            )}
            {req.requesterPhone && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Phone className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{req.requesterPhone}</p>
                </div>
              </div>
            )}
            {req.requesterCity && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <MapPin className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">City</p>
                  <p className="text-sm font-medium text-gray-900">{req.requesterCity}</p>
                </div>
              </div>
            )}
          </div>

          {/* Message */}
          {req.message && (
            <div className="p-3 bg-orange-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-1 font-semibold">Message</p>
              <p className="text-sm text-gray-700">{req.message}</p>
            </div>
          )}

          {/* Readiness Form */}
          {profile ? (
            <div>
              <h4 className="font-bold text-gray-900 mb-3 text-base border-b pb-2">Readiness Form</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.areaOfResidence && <InfoRow label="Area of Residence" value={profile.areaOfResidence} />}
                {profile.homeAddress && <InfoRow label="Home Address" value={profile.homeAddress} />}
                {profile.occupation && <InfoRow label="Occupation" value={profile.occupation} />}
                {profile.age && <InfoRow label="Age" value={String(profile.age)} />}
                {profile.mainCaregiver && <InfoRow label="Main Caregiver" value={profile.mainCaregiver} />}
                {profile.adoptionReason && <InfoRow label="Adoption Reason" value={profile.adoptionReason} />}
                {profile.financialResponsibility && <InfoRow label="Financial Responsibility" value={profile.financialResponsibility} />}
                <InfoRow label="Children Count" value={String(profile.childrenCount ?? 0)} />
                {profile.yardType && <InfoRow label="Yard Type" value={profile.yardType} />}
                {profile.dayLocation && <InfoRow label="Pet Day Location" value={profile.dayLocation} />}
                {profile.nightLocation && <InfoRow label="Pet Night Location" value={profile.nightLocation} />}
                {profile.homeType && <InfoRow label="Home Type" value={profile.homeType} />}
                {profile.ownershipType && <InfoRow label="Ownership Type" value={profile.ownershipType} />}
                {profile.allergies && <InfoRow label="Allergies" value={profile.allergies} />}
                {profile.currentPets && <InfoRow label="Current Pets" value={profile.currentPets} />}
                {profile.householdObjection && <InfoRow label="Household Objection" value={profile.householdObjection} />}
                {profile.previousPetExperience && <InfoRow label="Previous Pet Experience" value={profile.previousPetExperience} />}
                <InfoRow label="Exercise Hours/Day" value={String(profile.exerciseHours ?? 0)} />
                <InfoRow label="Monthly Cost Estimate" value={`$${profile.monthlyCostEstimation ?? 0}`} />
                {profile.breedingIntention && <InfoRow label="Breeding Intention" value={profile.breedingIntention} />}
                <InfoRow label="Spay/Neuter Commitment" value={profile.spayNeuterCommitment ? "Yes" : "No"} />
                {profile.behaviorTolerance && <InfoRow label="Behavior Tolerance" value={profile.behaviorTolerance} />}
                {profile.traumaHandlingComfort && <InfoRow label="Trauma Handling" value={profile.traumaHandlingComfort} />}
                {profile.dailyCarePlan && <InfoRow label="Daily Care Plan" value={profile.dailyCarePlan} />}
                {profile.travelPlan && <InfoRow label="Travel Plan" value={profile.travelPlan} />}
                {profile.activities && (profile.activities as string[]).length > 0 && (
                  <InfoRow label="Activities" value={(profile.activities as string[]).join(", ")} />
                )}
                {profile.petPreferences && (profile.petPreferences as string[]).length > 0 && (
                  <InfoRow label="Pet Preferences" value={(profile.petPreferences as string[]).join(", ")} />
                )}
                {profile.trainingExpectations && (profile.trainingExpectations as string[]).length > 0 && (
                  <InfoRow label="Training Expectations" value={(profile.trainingExpectations as string[]).join(", ")} />
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-xl text-center text-gray-400 text-sm">
              No Readiness Form submitted yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminAdoptions() {
  const [status, setStatus] = useState("");
  const [viewMessage, setViewMessage] = useState<{ text: string; pet: string } | null>(null);
  const [viewProfile, setViewProfile] = useState<any | null>(null);
  const { data: requests, refetch } = useListAdoptionRequests({ status: status || undefined });
  const updateStatus = useUpdateAdoptionRequestStatus();

  function handleStatus(id: number, newStatus: "approved" | "rejected") {
    updateStatus.mutate({ id, data: { status: newStatus } }, { onSuccess: () => refetch() });
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });
  }

  return (
    <AdminLayout title="Adoption Requests">
      {viewMessage && (
        <MessageModal message={viewMessage.text} petName={viewMessage.pet} onClose={() => setViewMessage(null)} />
      )}
      {viewProfile && (
        <ProfileModal req={viewProfile} onClose={() => setViewProfile(null)} />
      )}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-gray-700 mr-1">Filter:</p>
          {["", "pending", "approved", "rejected"].map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors capitalize ${status === s ? "bg-[#FA8D29] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {s || "All"}
            </button>
          ))}
          <span className="ml-auto text-xs text-gray-400">{(requests ?? []).length} requests</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Pet</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Requester</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">City</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Message</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(requests ?? []).map((req) => (
                <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {req.petImageUrl ? (
                        <img src={req.petImageUrl} alt={req.petName ?? ""} className="w-10 h-10 rounded-xl object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                          <Heart className="w-5 h-5 text-orange-300" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{req.petName ?? `Pet #${req.petId}`}</p>
                        <p className="text-xs text-gray-400">ID #{req.petId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-gray-900">{req.requesterName ?? `User #${req.requesterId}`}</p>
                    <p className="text-xs text-gray-400">ID #{req.requesterId}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    {req.requesterCity ? (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <MapPin className="w-3 h-3 text-gray-400" /> {req.requesterCity}
                      </div>
                    ) : <span className="text-xs text-gray-400">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-500 max-w-[120px] truncate">{req.message ?? "—"}</p>
                      {req.message && (
                        <button
                          onClick={() => setViewMessage({ text: req.message ?? "", pet: req.petName ?? `Pet #${req.petId}` })}
                          className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-gray-500">{formatDate(req.createdAt)}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      req.status === "approved" ? "bg-green-100 text-green-700" :
                      req.status === "rejected" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {req.status === "approved" ? <CheckCircle className="w-3 h-3" /> :
                       req.status === "rejected" ? <XCircle className="w-3 h-3" /> :
                       <Clock className="w-3 h-3" />}
                      <span className="capitalize">{req.status}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewProfile(req)}
                        className="px-3 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-semibold transition-colors"
                      >
                        View Profile
                      </button>
                      {req.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleStatus(req.id, "approved")}
                            disabled={updateStatus.isPending}
                            className="px-3 py-1.5 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatus(req.id, "rejected")}
                            disabled={updateStatus.isPending}
                            className="px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {(requests ?? []).length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400">No adoption requests found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
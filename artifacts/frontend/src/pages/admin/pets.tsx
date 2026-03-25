import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  useListPets,
  useApprovePet,
  useTogglePetFeatured,
  useDeletePet,
  useUpdatePet,
  useCreatePet,
  type Pet,
} from "@workspace/api-client-react";
import { PawPrint, Star, CheckCircle, Trash2, Eye, Search, Plus, X, Edit2 } from "lucide-react";
import { AdminLayout } from "./index";

const STATUS_COLORS: Record<string, string> = {
  available: "bg-green-100 text-green-700",
  adopted: "bg-blue-100 text-blue-700",
  fostered: "bg-teal-100 text-teal-700",
  pending: "bg-yellow-100 text-yellow-700",
  lost: "bg-red-100 text-red-700",
  found: "bg-purple-100 text-purple-700",
};

function getApprovalBadge(pet: Pet & { rejected?: boolean }) {
  if (pet.featured) return { label: "Featured", cls: "bg-amber-100 text-amber-700" };
  if (pet.rejected) return { label: "Rejected", cls: "bg-red-100 text-red-700" };
  if (pet.approved) return { label: "Approved", cls: "bg-green-100 text-green-700" };
  return { label: "Pending", cls: "bg-yellow-100 text-yellow-700" };
}

const PURPOSE_COLORS: Record<string, string> = {
  adopt: "bg-orange-100 text-orange-700",
  foster: "bg-teal-100 text-teal-700",
  both: "bg-purple-100 text-purple-700",
  lost_found: "bg-red-100 text-red-700",
};

interface PetFormData {
  name: string;
  type: string;
  breed: string;
  gender: string;
  ageMonths: string;
  size: string;
  city: string;
  purpose: string;
  status: string;
  featured: boolean;
  story: string;
  imageUrls: string;
  ownerId: string;
}

function PetModal({
  mode,
  pet,
  onClose,
  onSuccess,
}: {
  mode: "add" | "edit";
  pet?: Pet;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const createMutation = useCreatePet();
  const updateMutation = useUpdatePet();

  const [form, setForm] = useState<PetFormData>({
    name: pet?.name ?? "",
    type: pet?.type ?? "dog",
    breed: pet?.breed ?? "",
    gender: pet?.gender ?? "male",
    ageMonths: String(pet?.ageMonths ?? "0"),
    size: pet?.size ?? "medium",
    city: pet?.city ?? "Amman",
    purpose: pet?.purpose ?? "adopt",
    status: pet?.status ?? "available",
    featured: pet?.featured ?? false,
    story: pet?.story ?? "",
    imageUrls: (pet?.imageUrls ?? []).join(", "),
    ownerId: String(pet?.ownerId ?? ""),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const imageUrlsArr = form.imageUrls ? form.imageUrls.split(",").map(s => s.trim()).filter(Boolean) : [];

    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    if (mode === "add") {
      createMutation.mutate(
        {
          data: {
            name: form.name,
            type: form.type as Pet["type"],
            breed: form.breed || undefined,
            gender: form.gender as "male" | "female",
            ageMonths: parseInt(form.ageMonths) || 0,
            size: form.size as "small" | "medium" | "large",
            city: form.city,
            purpose: form.purpose as Pet["purpose"],
            imageUrls: imageUrlsArr,
            story: form.story || undefined,
            ownerId: form.ownerId ? parseInt(form.ownerId) : undefined,
          },
        },
        {
          onSuccess: async (created) => {
            await fetch(`${base}/api/admin/pets/${created.id}/settings`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: form.status, featured: form.featured, approved: true }),
            });
            onSuccess();
            onClose();
          },
        }
      );
    } else if (pet) {
      updateMutation.mutate(
        {
          id: pet.id,
          data: {
            name: form.name,
            breed: form.breed || undefined,
            gender: form.gender as "male" | "female",
            ageMonths: parseInt(form.ageMonths) || 0,
            size: form.size,
            city: form.city,
            story: form.story || undefined,
            imageUrls: imageUrlsArr,
          },
        },
        {
          onSuccess: async () => {
            await fetch(`${base}/api/admin/pets/${pet.id}/settings`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: form.status, featured: form.featured }),
            });
            onSuccess();
            onClose();
          },
        }
      );
    }
  }

  const f = (key: keyof PetFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{mode === "add" ? "Add New Pet" : "Edit Pet"}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Name *</label>
              <input value={form.name} onChange={f("name")} required className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Type</label>
              <select value={form.type} onChange={f("type")} disabled={mode === "edit"} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:bg-gray-50">
                {["dog", "cat", "rabbit", "bird", "other"].map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Breed</label>
              <input value={form.breed} onChange={f("breed")} placeholder="Mixed" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Gender</label>
              <select value={form.gender} onChange={f("gender")} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Age (months)</label>
              <input type="number" value={form.ageMonths} onChange={f("ageMonths")} min="0" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Size</label>
              <select value={form.size} onChange={f("size")} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200">
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">City</label>
              <input value={form.city} onChange={f("city")} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
            </div>
            {mode === "add" && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Purpose</label>
                <select value={form.purpose} onChange={f("purpose")} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200">
                  <option value="adopt">Adopt</option>
                  <option value="foster">Foster</option>
                  <option value="both">Both</option>
                  <option value="lost_found">Lost/Found</option>
                </select>
              </div>
            )}
            {mode === "add" && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Owner ID</label>
                <input type="number" value={form.ownerId} onChange={f("ownerId")} placeholder="User ID (optional)" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Status</label>
              <select value={form.status} onChange={f("status")} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200">
                <option value="available">Available</option>
                <option value="pending">Pending</option>
                <option value="adopted">Adopted</option>
                <option value="fostered">Fostered</option>
                <option value="lost">Lost</option>
                <option value="found">Found</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm(prev => ({ ...prev, featured: e.target.checked }))}
                  className="w-4 h-4 rounded accent-orange-500"
                />
                <span className="text-xs font-semibold text-gray-500">Featured (show on home page)</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Image URLs (comma-separated)</label>
            <input value={form.imageUrls} onChange={f("imageUrls")} placeholder="https://..." className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Story</label>
            <textarea value={form.story} onChange={f("story")} rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Cancel</button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 rounded-xl bg-[#FF6B35] text-white text-sm font-semibold hover:bg-[#e55a27] transition-colors disabled:opacity-50"
            >
              {isPending ? (mode === "add" ? "Adding..." : "Saving...") : (mode === "add" ? "Add Pet" : "Save Changes")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminPets() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "pending">("all");
  const [filterStatus, setFilterStatus] = useState("");
  const [modal, setModal] = useState<{ mode: "add" | "edit"; pet?: Pet } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("addPet") === "true") {
      setModal({ mode: "add" });
    }
  }, []);

  const { data, refetch } = useListPets({
    search: search || undefined,
    status: activeTab === "all" ? (filterStatus || undefined) : undefined,
    limit: 100,
  });

  const approveMutation = useApprovePet();
  const featureMutation = useTogglePetFeatured();
  const deleteMutation = useDeletePet();

  type EnrichedPet = Pet & { rejected?: boolean };

  const allPets = (data?.pets ?? []) as EnrichedPet[];
  const pets = activeTab === "pending"
    ? allPets.filter(p => !p.approved && !p.rejected)
    : allPets;

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });
  }

  return (
    <AdminLayout title="Pets Management">
      {modal && (
        <PetModal
          mode={modal.mode}
          pet={modal.pet}
          onClose={() => setModal(null)}
          onSuccess={() => refetch()}
        />
      )}

      <div className="flex items-center gap-3 mb-6">
        {(["all", "pending"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors capitalize ${activeTab === tab ? "bg-[#FF6B35] text-white" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}
          >
            {tab === "pending" ? "Pending Approval" : "All Pets"}
          </button>
        ))}
        <button
          onClick={() => setModal({ mode: "add" })}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF6B35] text-white text-sm font-semibold hover:bg-[#e55a27] transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Pet
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search pets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>
          {activeTab === "all" && (
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-200"
            >
              <option value="">All Status</option>
              {["available", "adopted", "fostered", "pending", "lost", "found"].map(s => (
                <option key={s} value={s} className="capitalize">{s}</option>
              ))}
            </select>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Pet</th>
                {activeTab === "pending" && (
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Owner</th>
                )}
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Type / Breed</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">City</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Purpose</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Pet Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Approval</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Created</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pets.map((pet) => (
                <tr key={pet.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {pet.imageUrls?.[0] ? (
                        <img src={pet.imageUrls[0]} alt={pet.name} className="w-10 h-10 rounded-xl object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                          <PawPrint className="w-5 h-5 text-orange-300" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{pet.name}</p>
                        <p className="text-xs text-gray-400">ID #{pet.id}</p>
                      </div>
                    </div>
                  </td>
                  {activeTab === "pending" && (
                    <td className="px-5 py-3.5">
                      {pet.ownerId ? (
                        <p className="text-sm text-gray-600">User #{pet.ownerId}</p>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  )}
                  <td className="px-5 py-3.5">
                    <p className="text-sm text-gray-700 capitalize">{pet.type}</p>
                    <p className="text-xs text-gray-400">{pet.breed || "Mixed"}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-gray-700">{pet.city}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${PURPOSE_COLORS[pet.purpose] ?? "bg-gray-100 text-gray-600"}`}>
                      {pet.purpose === "both" ? "Adopt/Foster" : pet.purpose}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[pet.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {pet.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {(() => {
                      const badge = getApprovalBadge(pet);
                      return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.cls}`}>{badge.label}</span>;
                    })()}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-gray-500">{formatDate(pet.createdAt)}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {activeTab === "pending" ? (
                        <>
                          <button
                            onClick={() => approveMutation.mutate({ id: pet.id }, { onSuccess: () => refetch() })}
                            disabled={pet.approved || approveMutation.isPending}
                            className="px-3 py-1.5 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 text-xs font-semibold transition-colors disabled:opacity-40"
                          >
                            Approve
                          </button>
                          <button
                            onClick={async () => {
                              const base = import.meta.env.BASE_URL.replace(/\/$/, "");
                              await fetch(`${base}/api/admin/pets/${pet.id}/reject`, { method: "PUT" });
                              refetch();
                            }}
                            className="px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => { if (!pet.approved) approveMutation.mutate({ id: pet.id }, { onSuccess: () => refetch() }); }}
                            title={pet.approved ? "Already approved" : "Approve"}
                            className={`p-1.5 rounded-lg text-xs transition-colors ${pet.approved ? "bg-green-100 text-green-600 cursor-default" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"}`}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => featureMutation.mutate({ id: pet.id }, { onSuccess: () => refetch() })}
                            title={pet.featured ? "Unfeature" : "Feature"}
                            className={`p-1.5 rounded-lg text-xs transition-colors ${pet.featured ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-500"} hover:bg-amber-100`}
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              const base = import.meta.env.BASE_URL.replace(/\/$/, "");
                              await fetch(`${base}/api/admin/pets/${pet.id}/reject`, { method: "PUT" });
                              refetch();
                            }}
                            title="Reject"
                            className="p-1.5 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setModal({ mode: "edit", pet })}
                        title="Edit"
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-400 hover:bg-blue-100 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <Link href={`/pets/${pet.id}`}>
                        <button title="View" className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                      <button
                        onClick={() => { if (confirm(`Delete ${pet.name}?`)) deleteMutation.mutate({ id: pet.id }, { onSuccess: () => refetch() }); }}
                        title="Delete"
                        className="p-1.5 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pets.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-gray-400">
                    {activeTab === "pending" ? "No pending pets" : "No pets found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {data && (
          <div className="px-5 py-3.5 border-t border-gray-100">
            <p className="text-xs text-gray-400">Showing {pets.length} of {data.total} pets</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

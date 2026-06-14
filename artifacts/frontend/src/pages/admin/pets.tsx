import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  useApprovePet,
  useTogglePetFeatured,
  useDeletePet,
  useUpdatePet,
  useCreatePet,
  type Pet,
} from "@workspace/api-client-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PawPrint, Star, CheckCircle, Trash2, Eye, Search, Plus, X, Edit2, Sparkles, Loader2, XCircle } from "lucide-react";
import { AdminLayout } from "./index";

interface AdminPet {
  id: number;
  name: string;
  type: string;
  breed: string | null;
  gender: string;
  ageMonths: number;
  weightKg: string | null;
  size: string;
  color: string | null;
  sterilized: boolean;
  yearlyVaccines: boolean;
  birthday: string | null;
  city: string;
  status: string;
  purpose: string;
  imageUrls: string[];
  story: string | null;
  ownerId: number | null;
  ownerName: string | null;
  ownerEmail: string | null;
  ownerAvatar: string | null;
  approved: boolean;
  rejected: boolean;
  featured: boolean;
  addedByAdmin: boolean;
  paymentProof: string | null;
  createdAt: string;
}

interface AdminPetsResponse {
  pets: AdminPet[];
  total: number;
  page: number;
  totalPages: number;
}

function useAdminPets(params: { search?: string }) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return useQuery<AdminPetsResponse>({
    queryKey: ["/api/admin/pets", params.search],
    queryFn: async () => {
      const qs = new URLSearchParams({ limit: "20" });
      if (params.search) qs.set("search", params.search);
      const res = await fetch(`${base}/api/admin/pets?${qs}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch admin pets");
      return res.json();
    },
  });
}

function useRejectPet() {
  const queryClient = useQueryClient();
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      const res = await fetch(`${base}/api/admin/pets/${id}/reject`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to reject pet");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pets"] });
    },
  });
}

const STATUS_COLORS: Record<string, string> = {
  available: "bg-green-100 text-green-700",
  adopted: "bg-blue-100 text-blue-700",
  fostered: "bg-teal-100 text-teal-700",
  pending: "bg-yellow-100 text-yellow-700",
  lost: "bg-red-100 text-red-700",
  found: "bg-purple-100 text-purple-700",
};

function getApprovalBadge(pet: AdminPet) {
  if (pet.rejected) return { label: "Rejected", cls: "bg-red-100 text-red-700" };
  if (pet.featured) return { label: "Featured", cls: "bg-amber-100 text-amber-700" };
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
  addedByAdmin: boolean;
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
  pet?: AdminPet;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const createMutation = useCreatePet();
  const updateMutation = useUpdatePet();
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [descError, setDescError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [lightboxProof, setLightboxProof] = useState(false);

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
    addedByAdmin: pet?.addedByAdmin ?? false,
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
              credentials: "include",
              body: JSON.stringify({ status: form.status, featured: form.featured, approved: true, addedByAdmin: true }),
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
              credentials: "include",
              body: JSON.stringify({ status: form.status, featured: form.featured, addedByAdmin: form.addedByAdmin }),
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

  async function generateDescription() {
    setGeneratingDesc(true);
    setDescError(null);
    try {
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      const response = await fetch(`${base}/api/ai/generate-description`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pet: {
            name: form.name || "this pet",
            type: form.type,
            breed: form.breed,
            gender: form.gender,
            ageMonths: parseInt(form.ageMonths) || 0,
            size: form.size,
            city: form.city,
          },
        }),
      });
      if (response.ok) {
        const data = await response.json() as { description: string; story: string };
        setForm(prev => ({ ...prev, story: data.description ?? data.story }));
      } else {
        setDescError("Failed to generate description. Please try again.");
      }
    } catch {
      setDescError("Could not connect to AI. Please try again.");
    } finally {
      setGeneratingDesc(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{mode === "add" ? "Add New Pet" : "Edit Pet"}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>

        {/* Payment Proof (edit mode, pending pets) */}
        {mode === "edit" && pet?.paymentProof && (
          <div className="px-6 pt-4 pb-2">
            <p className="text-xs font-semibold text-gray-500 mb-2">Payment Proof</p>
            <div className="relative inline-block">
              <img
                src={pet.paymentProof}
                alt="Payment proof"
                onClick={() => setLightboxProof(true)}
                className="h-32 w-auto object-cover rounded-xl border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
              />
              <button
                type="button"
                onClick={() => setLightboxProof(true)}
                className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded-lg"
              >
                View Full
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Pet Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Pet Name *</label>
            <input value={form.name} onChange={f("name")} required placeholder="e.g. Bella" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div className="col-span-2 flex items-center gap-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm(prev => ({ ...prev, featured: e.target.checked }))} className="w-4 h-4 rounded accent-orange-500" />
                <span className="text-xs font-semibold text-gray-500">Featured (show on home page)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.addedByAdmin} onChange={(e) => setForm(prev => ({ ...prev, addedByAdmin: e.target.checked }))} className="w-4 h-4 rounded" style={{ accentColor: "#3D937F" }} />
                <span className="text-xs font-semibold" style={{ color: "#3D937F" }}>Verified by Tabanni</span>
              </label>
            </div>
          </div>

          {/* Images Upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Pet Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploadingImage}
              onChange={async (e) => {
                const files = Array.from(e.target.files ?? []);
                if (!files.length) return;
                setUploadingImage(true);
                const urls: string[] = [];
                for (const file of files) {
                  const reader = new FileReader();
                  const base64 = await new Promise<string>((resolve) => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.readAsDataURL(file);
                  });
                  const res = await fetch("/api/upload/image", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ image: base64 }),
                  });
                  const data = await res.json();
                  if (data.url) urls.push(data.url);
                }
                if (urls.length > 0) {
                  const existing = form.imageUrls ? form.imageUrls.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
                  setForm((prev) => ({ ...prev, imageUrls: [...existing, ...urls].join(", ") }));
                }
                setUploadingImage(false);
              }}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:opacity-50"
            />
            {uploadingImage && <p className="text-xs text-orange-500 mt-1">Uploading images...</p>}
            {form.imageUrls && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.imageUrls.split(",").map((url: string, i: number) => url.trim() && (
                  <div key={i} className="relative">
                    <img src={url.trim()} alt="" className="w-16 h-16 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => {
                        const urls = form.imageUrls.split(",").map(s => s.trim()).filter((_, idx) => idx !== i);
                        setForm(prev => ({ ...prev, imageUrls: urls.join(", ") }));
                      }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                    >×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Story */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-500">Story</label>
              <button
                type="button"
                onClick={generateDescription}
                disabled={generatingDesc}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: "#FA8D29" }}
              >
                {generatingDesc ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                Generate with AI ✨
              </button>
            </div>
            <textarea value={form.story} onChange={f("story")} rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none" />
            {descError && <p className="text-red-500 text-xs mt-1">{descError}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Cancel</button>
            <button type="submit" disabled={isPending || uploadingImage} className="px-5 py-2 rounded-xl bg-[#FA8D29] text-white text-sm font-semibold hover:bg-[#e55a27] transition-colors disabled:opacity-50">
              {isPending ? (mode === "add" ? "Adding..." : "Saving...") : (mode === "add" ? "Add Pet" : "Save Changes")}
            </button>
          </div>
        </form>
      </div>

      {/* Payment Proof Lightbox */}
      {lightboxProof && pet?.paymentProof && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxProof(false)}>
          <button className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20" onClick={() => setLightboxProof(false)}>
            <X className="w-6 h-6" />
          </button>
          <img src={pet.paymentProof} alt="Payment proof" className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

export default function AdminPets() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "pending">("all");
  const [filterStatus, setFilterStatus] = useState("");
  const [modal, setModal] = useState<{ mode: "add" | "edit"; pet?: AdminPet } | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("addPet") === "true") {
      setModal({ mode: "add" });
    }
  }, []);

  const { data, refetch } = useAdminPets({ search: search || undefined });

  const approveMutation = useApprovePet();
  const rejectMutation = useRejectPet();
  const featureMutation = useTogglePetFeatured();
  const deleteMutation = useDeletePet();

  const allPets = data?.pets ?? [];

  const pets = (() => {
    let list = allPets;
    if (activeTab === "pending") {
      list = list.filter(p => !p.approved && !p.rejected);
    } else if (filterStatus) {
      list = list.filter(p => p.status === filterStatus);
    }
    return list;
  })();

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
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors capitalize ${activeTab === tab ? "bg-[#FA8D29] text-white" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}
          >
            {tab === "pending" ? (
              <span className="flex items-center gap-2">
                Pending Approval
                {allPets.filter(p => !p.approved && !p.rejected).length > 0 && (
                  <span className="px-1.5 py-0.5 bg-white/30 text-white rounded-full text-xs font-bold">
                    {allPets.filter(p => !p.approved && !p.rejected).length}
                  </span>
                )}
              </span>
            ) : "All Pets"}
          </button>
        ))}
        <button
          onClick={() => setModal({ mode: "add" })}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FA8D29] text-white text-sm font-semibold hover:bg-[#e55a27] transition-colors"
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
                {activeTab === "pending" && (
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Payment Proof</th>
                )}
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
                        <img src={pet.imageUrls[0]} alt={pet.name} loading="lazy" className="w-10 h-10 rounded-xl object-cover" />
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
                      {pet.ownerName ? (
                        <div className="flex items-center gap-2">
                          {pet.ownerAvatar ? (
                            <img src={pet.ownerAvatar} alt={pet.ownerName} className="w-8 h-8 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0 text-xs font-bold text-orange-600">
                              {pet.ownerName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-sm text-gray-700 font-medium">{pet.ownerName}</p>
                            {pet.ownerEmail && <p className="text-xs text-gray-400 truncate max-w-[110px]">{pet.ownerEmail}</p>}
                          </div>
                        </div>
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
                  {activeTab === "pending" && (
                    <td className="px-5 py-3.5">
                      {pet.paymentProof ? (
                        <a href={pet.paymentProof} target="_blank" rel="noopener noreferrer" title="View payment proof">
                          <img
                            src={pet.paymentProof}
                            alt="Payment proof"
                            className="w-12 h-12 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition-opacity cursor-pointer"
                          />
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400 italic">None</span>
                      )}
                    </td>
                  )}
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-gray-500">{formatDate(pet.createdAt)}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {activeTab === "pending" ? (
                        <>
                          <button
                            onClick={() => approveMutation.mutate({ id: pet.id }, { onSuccess: () => refetch() })}
                            disabled={approveMutation.isPending}
                            className="px-3 py-1.5 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 text-xs font-semibold transition-colors disabled:opacity-40"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Reject "${pet.name}"? The owner will be notified.`)) {
                                rejectMutation.mutate({ id: pet.id }, { onSuccess: () => refetch() });
                              }
                            }}
                            disabled={rejectMutation.isPending}
                            className="px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold transition-colors disabled:opacity-40"
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
                        onClick={() => {
                          if (confirm(`Delete ${pet.name}?`)) {
                            deleteMutation.mutate({ id: pet.id }, {
                              onSuccess: () => {
                                refetch();
                                queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
                              },
                            });
                          }
                        }}
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
                    {activeTab === "pending" ? (
                      <div>
                        <XCircle className="w-10 h-10 mx-auto mb-2 opacity-20" />
                        <p className="text-sm font-medium text-gray-500">No pets pending approval</p>
                        <p className="text-xs text-gray-400 mt-1">New user-submitted pets will appear here</p>
                      </div>
                    ) : "No pets found"}
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

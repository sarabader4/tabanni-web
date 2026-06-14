import { useState, useEffect, useRef, useMemo } from "react";
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
  whatsappUrl?: string | null;
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
  const [section, setSection] = useState<1 | 2>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: pet?.name ?? "",
    type: pet?.type ?? "dog",
    breed: pet?.breed ?? "",
    birthday: pet?.birthday ?? "",
    gender: pet?.gender ?? "male",
    weightKg: pet?.weightKg ?? "",
    sterilized: pet?.sterilized ?? false,
    yearlyVaccines: pet?.yearlyVaccines ?? false,
    story: pet?.story ?? "",
    whatsappUrl: pet?.whatsappUrl ?? "",
    purpose: (pet?.purpose ?? "adopt") as "adopt" | "foster" | "both" | "lost_found",
    status: pet?.status ?? "available",
    featured: pet?.featured ?? false,
    addedByAdmin: pet?.addedByAdmin ?? true,
    city: pet?.city ?? "Amman",
    ownerId: String(pet?.ownerId ?? ""),
  });

  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(pet?.imageUrls ?? []);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const allDisplayedImages = [...existingImageUrls, ...imagePreviews];
  const ageDisplay = useMemo(() => calculateAge(form.birthday), [form.birthday]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
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

  const inputCls = (field: string) =>
    `w-full border rounded-xl px-3 py-2.5 text-sm text-[#333E48] outline-none focus:ring-2 transition-colors ${
      touched[field] && errors[field] ? "border-red-400 focus:ring-red-200" : "border-gray-200 focus:ring-orange-200"
    }`;

  const validateSection1 = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Pet name is required";
    if (!form.breed.trim()) e.breed = "Breed is required";
    if (!form.birthday) e.birthday = "Birthdate is required";
    if (!form.weightKg) e.weightKg = "Weight is required";
    if (!form.story.trim()) e.story = "Pet story is required";
    if (existingImageUrls.length === 0 && imageFiles.length === 0) e.images = "At least one photo is required";
    return e;
  };

  const validateSection2 = () => {
    const e: Record<string, string> = {};
    if (!form.whatsappUrl.trim()) e.whatsappUrl = "WhatsApp number is required";
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

  async function generateDescription() {
    setGeneratingDesc(true);
    setDescError(null);
    try {
      const ageMonths = form.birthday
        ? Math.max(0, (new Date().getFullYear() - new Date(form.birthday).getFullYear()) * 12 + (new Date().getMonth() - new Date(form.birthday).getMonth()))
        : 0;
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      const response = await fetch(`${base}/api/ai/generate-description`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pet: { name: form.name || "this pet", type: form.type, breed: form.breed, gender: form.gender, ageMonths } }),
      });
      if (response.ok) {
        const data = await response.json() as { description: string; story: string };
        setForm(prev => ({ ...prev, story: data.description ?? data.story }));
      } else {
        setDescError("Failed to generate. Try again.");
      }
    } catch {
      setDescError("Could not connect to AI.");
    } finally {
      setGeneratingDesc(false);
    }
  }

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

    setUploadingImage(true);
    let newUrls: string[] = [];
    try {
      for (const file of imageFiles) {
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
        if (data.url) newUrls.push(data.url);
      }
    } catch {}
    setUploadingImage(false);

    const imageUrls = [...existingImageUrls, ...newUrls];
    const ageMonths = (() => {
      if (!form.birthday) return 0;
      const birth = new Date(form.birthday);
      const now = new Date();
      return Math.max(0, (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth()));
    })();

    const base = import.meta.env.BASE_URL.replace(/\/$/, "");

    if (mode === "add") {
      createMutation.mutate(
        {
          data: {
            name: form.name,
            type: form.type as Pet["type"],
            breed: form.breed || undefined,
            gender: form.gender as "male" | "female",
            ageMonths,
            weightKg: form.weightKg || undefined,
            size: "medium" as const,
            city: form.city,
            purpose: form.purpose as Pet["purpose"],
            imageUrls,
            story: form.story || undefined,
            whatsappUrl: form.whatsappUrl || undefined,
            ownerId: form.ownerId ? parseInt(form.ownerId) : undefined,
          },
        },
        {
          onSuccess: async (created) => {
            await fetch(`${base}/api/admin/pets/${created.id}/settings`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ status: form.status, featured: form.featured, approved: true, addedByAdmin: form.addedByAdmin }),
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
            ageMonths,
            weightKg: form.weightKg || undefined,
            size: "medium" as const,
            city: form.city,
            story: form.story || undefined,
            imageUrls,
            whatsappUrl: form.whatsappUrl || undefined,
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
  };

  const isPending = createMutation.isPending || updateMutation.isPending || uploadingImage;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-[#333E48]">{mode === "add" ? "Add New Pet" : "Edit Pet"}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {section === 1 ? "Section 1 of 2 — Pet Information" : "Section 2 of 2 — Owner Info"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>

        {mode === "edit" && pet?.paymentProof && (
          <div className="px-5 pt-4 pb-2">
            <p className="text-xs font-semibold text-gray-500 mb-2">Payment Proof</p>
            <div className="relative inline-block">
              <img src={pet.paymentProof} alt="Payment proof" onClick={() => setLightboxProof(true)} className="h-28 w-auto object-cover rounded-xl border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity" />
              <button type="button" onClick={() => setLightboxProof(true)} className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded-lg">View Full</button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {section === 1 && (
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Pet Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} onBlur={() => setTouched(p => ({ ...p, name: true }))} className={inputCls("name")} placeholder="e.g. Bella" />
                  {touched.name && errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Type *</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} disabled={mode === "edit"} className={`${inputCls("type")} disabled:bg-gray-50`}>
                    {["dog", "cat", "rabbit", "bird", "other"].map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Breed *</label>
                  <input value={form.breed} onChange={e => setForm(f => ({ ...f, breed: e.target.value }))} onBlur={() => setTouched(p => ({ ...p, breed: true }))} className={inputCls("breed")} placeholder="e.g. Golden Retriever" />
                  {touched.breed && errors.breed && <p className="text-xs text-red-500 mt-0.5">{errors.breed}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Birthdate *</label>
                  <input type="date" value={form.birthday} onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))} onBlur={() => setTouched(p => ({ ...p, birthday: true }))} max={new Date().toISOString().split("T")[0]} className={inputCls("birthday")} />
                  {touched.birthday && errors.birthday && <p className="text-xs text-red-500 mt-0.5">{errors.birthday}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Age (auto-calculated)</label>
                  <input value={ageDisplay} readOnly className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-500 cursor-default outline-none" placeholder="Select birthdate" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Gender *</label>
                  <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} className={inputCls("gender")}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Weight (kg) *</label>
                  <input type="number" step="0.1" min="0" value={form.weightKg} onChange={e => setForm(f => ({ ...f, weightKg: e.target.value }))} onBlur={() => setTouched(p => ({ ...p, weightKg: true }))} className={inputCls("weightKg")} placeholder="e.g. 5.2" />
                  {touched.weightKg && errors.weightKg && <p className="text-xs text-red-500 mt-0.5">{errors.weightKg}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Sterilized *</label>
                  <div className="flex gap-2">
                    {[true, false].map(val => (
                      <button key={String(val)} type="button" onClick={() => setForm(f => ({ ...f, sterilized: val }))}
                        className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${form.sterilized === val ? "bg-[#FA8D29] text-white border-[#FA8D29]" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
                        {val ? "Yes" : "No"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Yearly Vaccines *</label>
                  <div className="flex gap-2">
                    {[true, false].map(val => (
                      <button key={String(val)} type="button" onClick={() => setForm(f => ({ ...f, yearlyVaccines: val }))}
                        className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${form.yearlyVaccines === val ? "bg-[#FA8D29] text-white border-[#FA8D29]" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
                        {val ? "Yes" : "No"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-gray-500">Pet Story *</label>
                  <button type="button" onClick={generateDescription} disabled={generatingDesc}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                    style={{ background: "#FA8D29" }}>
                    {generatingDesc ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    Generate with AI ✨
                  </button>
                </div>
                <textarea value={form.story} onChange={e => setForm(f => ({ ...f, story: e.target.value }))} onBlur={() => setTouched(p => ({ ...p, story: true }))} rows={3} className={`${inputCls("story")} resize-none`} placeholder="Tell us about this pet's personality, history..." />
                {touched.story && errors.story && <p className="text-xs text-red-500 mt-0.5">{errors.story}</p>}
                {descError && <p className="text-red-500 text-xs mt-1">{descError}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">Photos *</label>
                <div onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors hover:bg-gray-50 ${touched.images && errors.images ? "border-red-400" : "border-gray-200"}`}>
                  <Plus className="w-6 h-6 mx-auto mb-1.5 text-gray-300" />
                  <p className="text-sm text-gray-500">Click to upload photos</p>
                  <p className="text-xs text-gray-400 mt-0.5">Multiple photos allowed</p>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                </div>
                {touched.images && errors.images && <p className="text-xs text-red-500 mt-0.5">{errors.images}</p>}
                {allDisplayedImages.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {allDisplayedImages.map((src, idx) => (
                      <div key={idx} className="relative">
                        <img src={src} alt="" className="w-16 h-16 object-cover rounded-xl border border-gray-200" />
                        <button type="button" onClick={() => removeImage(idx)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button type="button" onClick={handleNext} className="px-6 py-2.5 bg-[#FA8D29] text-white rounded-xl font-bold text-sm hover:bg-[#e55a27] transition-colors">
                  Next: Owner Info →
                </button>
              </div>
            </div>
          )}

          {section === 2 && (
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">WhatsApp Number *</label>
                  <input value={form.whatsappUrl} onChange={e => setForm(f => ({ ...f, whatsappUrl: e.target.value }))} onBlur={() => setTouched(p => ({ ...p, whatsappUrl: true }))} className={inputCls("whatsappUrl")} placeholder="+962 79 000 0000" />
                  {touched.whatsappUrl && errors.whatsappUrl && <p className="text-xs text-red-500 mt-0.5">{errors.whatsappUrl}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">City</label>
                  <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className={inputCls("city")} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Owner ID (optional)</label>
                  <input type="number" value={form.ownerId} onChange={e => setForm(f => ({ ...f, ownerId: e.target.value }))} placeholder="User ID" className={inputCls("ownerId")} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Availability</label>
                  <select value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value as any }))} className={inputCls("purpose")}>
                    <option value="adopt">Adopt</option>
                    <option value="foster">Foster</option>
                    <option value="both">Both</option>
                    <option value="lost_found">Lost/Found</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={inputCls("status")}>
                    <option value="available">Available</option>
                    <option value="pending">Pending</option>
                    <option value="adopted">Adopted</option>
                    <option value="fostered">Fostered</option>
                    <option value="lost">Lost</option>
                    <option value="found">Found</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl space-y-3">
                <p className="text-xs font-bold text-orange-700">Admin Options</p>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="w-4 h-4 rounded accent-orange-500" />
                  <div>
                    <span className="text-sm font-semibold text-gray-700">Featured</span>
                    <p className="text-xs text-gray-500">Show on home page</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.addedByAdmin} onChange={e => setForm(f => ({ ...f, addedByAdmin: e.target.checked }))} className="w-4 h-4 rounded" style={{ accentColor: "#3D937F" }} />
                  <div>
                    <span className="text-sm font-semibold" style={{ color: "#3D937F" }}>Verified by Tabanni</span>
                    <p className="text-xs text-gray-500">Show verification badge</p>
                  </div>
                </label>
              </div>

              <div className="flex justify-between pt-2">
                <button type="button" onClick={() => setSection(1)} className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">
                  ← Back
                </button>
                <button type="submit" disabled={isPending} className="px-6 py-2.5 rounded-xl bg-[#FA8D29] text-white text-sm font-semibold hover:bg-[#e55a27] transition-colors disabled:opacity-50">
                  {isPending ? (mode === "add" ? "Adding..." : "Saving...") : (mode === "add" ? "Add Pet" : "Save Changes")}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

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

  // Instant UI update helper
  function updatePetInCache(petId: number, updates: Partial<AdminPet>) {
    queryClient.setQueryData(
      ["/api/admin/pets", search || undefined],
      (old: AdminPetsResponse | undefined) => {
        if (!old) return old;
        return { ...old, pets: old.pets.map(p => p.id === petId ? { ...p, ...updates } : p) };
      }
    );
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
                          <img src={pet.paymentProof} alt="Payment proof" className="w-12 h-12 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition-opacity cursor-pointer" />
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
                          {pet.approved ? (
                            <span className="px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-semibold flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Approved
                            </span>
                          ) : (
                            <button
                              onClick={() => approveMutation.mutate({ id: pet.id }, {
                                onSuccess: () => {
                                  updatePetInCache(pet.id, { approved: true, rejected: false });
                                  refetch();
                                }
                              })}
                              disabled={approveMutation.isPending}
                              className="px-3 py-1.5 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 text-xs font-semibold transition-colors disabled:opacity-40"
                            >
                              Approve
                            </button>
                          )}
                          {!pet.approved && (
                            <button
                              onClick={() => {
                                if (confirm(`Reject "${pet.name}"? The owner will be notified.`)) {
                                  rejectMutation.mutate({ id: pet.id }, {
                                    onSuccess: () => {
                                      updatePetInCache(pet.id, { approved: false, rejected: true });
                                      refetch();
                                    }
                                  });
                                }
                              }}
                              disabled={rejectMutation.isPending}
                              className="px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold transition-colors disabled:opacity-40"
                            >
                              Reject
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              if (!pet.approved) {
                                approveMutation.mutate({ id: pet.id }, {
                                  onSuccess: () => {
                                    updatePetInCache(pet.id, { approved: true, rejected: false });
                                    refetch();
                                  }
                                });
                              }
                            }}
                            title={pet.approved ? "Already approved" : "Approve"}
                            className={`p-1.5 rounded-lg text-xs transition-colors ${pet.approved ? "bg-green-100 text-green-600 cursor-default" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"}`}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => featureMutation.mutate({ id: pet.id }, {
                              onSuccess: () => {
                                updatePetInCache(pet.id, { featured: !pet.featured });
                                refetch();
                              }
                            })}
                            title={pet.featured ? "Unfeature" : "Feature"}
                            className={`p-1.5 rounded-lg text-xs transition-colors ${pet.featured ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-500"} hover:bg-amber-100`}
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <button onClick={() => setModal({ mode: "edit", pet })} title="Edit" className="p-1.5 rounded-lg bg-blue-50 text-blue-400 hover:bg-blue-100 transition-colors">
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
                              }
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
import { useState, useRef } from "react";
import { Link } from "wouter";
import {
  useListLostFoundReports,
  useCreateLostFoundReport,
  useDeleteLostFoundReport,
  useResolveLostFoundReport,
} from "@workspace/api-client-react";
import { FilterBar, type FilterBarState } from "@/components/filter-bar";
import { Search, Loader2, ChevronLeft, ChevronRight, X, ImagePlus, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/auth-context";
import { useQueryClient } from "@tanstack/react-query";
import WhatsAppPhoneInput from "@/components/whatsapp-phone-input";

const MAX_IMAGES = 5;

const reportSchema = z.object({
  reportType: z.enum(["lost", "found"]),
  name: z.string().min(1, "Pet name is required"),
  gender: z.string().min(1, "Gender is required"),
  type: z.string().min(1, "Pet type is required"),
  breed: z.string().optional(),
  ageMonths: z.coerce.number().min(0, "Age is required").optional(),
  size: z.string().min(1, "Size is required"),
  city: z.string().min(1, "City is required"),
  area: z.string().min(1, "Area is required"),
  lostDate: z.string().optional(),
  foundDate: z.string().optional(),
  description: z.string().optional(),
  reporterName: z.string().min(1, "Your name is required"),
  whatsappUrl: z.string().min(1, "Please enter your WhatsApp phone number"),
}).superRefine((data, ctx) => {
  if (data.reportType === "lost" && !data.lostDate) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Date lost is required", path: ["lostDate"] });
  }
  if (data.reportType === "found" && !data.foundDate) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Date found is required", path: ["foundDate"] });
  }
});
type ReportFormValues = z.infer<typeof reportSchema>;

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    pending: { label: "Pending", className: "bg-yellow-100 text-yellow-700" },
    approved: { label: "Approved", className: "bg-green-100 text-green-700" },
    rejected: { label: "Rejected", className: "bg-red-100 text-red-500" },
    resolved: { label: "Resolved", className: "bg-gray-100 text-gray-500" },
  };
  const s = map[status] ?? { label: status, className: "bg-gray-100 text-gray-500" };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${s.className}`}>{s.label}</span>
  );
}

export default function LostFound() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [tab, setTab] = useState<"lost" | "found">("lost");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterBarState>({
    type: "", gender: "", minAge: "", maxAge: "", size: "", city: "", breed: "", month: "", sterilized: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [page, setPage] = useState(1);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const pageSize = 20;

  const isClientFiltering = !!(search || filters.month || filters.minAge);
  const { data, isLoading, isError, refetch } = useListLostFoundReports({
    reportType: tab,
    type: filters.type || undefined,
    city: filters.city || undefined,
    gender: filters.gender || undefined,
    size: filters.size || undefined,
    breed: filters.breed || undefined,
    limit: isClientFiltering ? 1000 : pageSize,
    page: isClientFiltering ? 1 : page,
  });

  const createMutation = useCreateLostFoundReport();
  const deleteMutation = useDeleteLostFoundReport();
  const resolveMutation = useResolveLostFoundReport();

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reportType: "lost",
      name: "",
      gender: "",
      type: "Dog",
      breed: "",
      size: "",
      city: "Amman",
      area: "",
      description: "",
      reporterName: user?.fullName ?? "",
      whatsappUrl: "",
    },
  });

  const reportType = form.watch("reportType");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = MAX_IMAGES - imageFiles.length;
    const toAdd = files.slice(0, remaining);
    setImageFiles(prev => [...prev, ...toAdd]);
    toAdd.forEach(f => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreviews(prev => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(f);
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (idx: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const resetForm = () => {
    form.reset({
      reportType: tab,
      name: "",
      gender: "",
      type: "Dog",
      breed: "",
      size: "",
      city: "Amman",
      area: "",
      description: "",
      reporterName: user?.fullName ?? "",
      whatsappUrl: "",
    });
    setImageFiles([]);
    setImagePreviews([]);
    setSubmitSuccess(false);
  };

  const onSubmit = async (values: ReportFormValues) => {
    if (imageFiles.length === 0) {
      toast({ title: "Please upload at least one image", variant: "destructive" });
      return;
    }

    const imageUrls = imagePreviews;

    try {
      await createMutation.mutateAsync({
        data: {
          ...values,
          imageUrls,
          reporterId: user?.id,
        },
      });
      setSubmitSuccess(true);
      refetch();
    } catch {
      toast({ title: t("lostFound.reportError"), variant: "destructive" });
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this report?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: ["/api/lost-found"] });
      toast({ title: "Report deleted" });
      refetch();
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const handleResolve = async (id: number, reportType: "lost" | "found", e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const label = reportType === "lost" ? "Found My Pet" : "Found Owner";
    if (!confirm(`Mark as resolved (${label})?`)) return;
    try {
      await resolveMutation.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: ["/api/lost-found"] });
      toast({ title: "Report resolved" });
      refetch();
    } catch {
      toast({ title: "Failed to resolve", variant: "destructive" });
    }
  };

  const allReports = data?.reports ?? [];

  const MONTH_NAMES = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december",
  ];

  const reports = allReports.filter((r) => {
    const matchesSearch = !search || (
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.type?.toLowerCase().includes(search.toLowerCase()) ||
      r.breed?.toLowerCase().includes(search.toLowerCase()) ||
      r.city?.toLowerCase().includes(search.toLowerCase())
    );
    const matchesMonth = !filters.month || (() => {
      const monthIdx = MONTH_NAMES.indexOf(filters.month.toLowerCase());
      if (monthIdx === -1) return true;
      const eventDateStr = r.lostDate || r.foundDate || r.createdAt;
      const d = new Date(eventDateStr);
      return d.getMonth() === monthIdx;
    })();
    const age = r.ageMonths ?? null;
    const parsedAge = (() => {
      const s = filters.minAge;
      if (!s) return { min: null, max: null };
      if (s === "< 1 year") return { min: null, max: 12 };
      if (s === "1–3 years") return { min: 12, max: 36 };
      if (s === "3–5 years") return { min: 36, max: 60 };
      if (s === "5+ years") return { min: 60, max: null };
      return { min: null, max: null };
    })();
    const matchesMinAge = parsedAge.min === null || age === null || age >= parsedAge.min;
    const matchesMaxAge = parsedAge.max === null || age === null || age <= parsedAge.max;
    return matchesSearch && matchesMonth && matchesMinAge && matchesMaxAge;
  });

  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize) || 1;

  const openModal = () => {
    resetForm();
    form.setValue("reportType", tab);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder={t("lostFound.searchPlaceholder")}
              className="w-full bg-white border border-gray-200 rounded-xl ps-12 pe-4 py-3 text-sm text-[#1E2A3A] placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-primary/30 shadow-sm"
            />
          </div>
          <button
            onClick={openModal}
            className={`px-5 py-3 rounded-xl font-bold text-sm shadow-md transition-colors whitespace-nowrap text-white ${
              tab === "lost" ? "bg-primary shadow-primary/20 hover:bg-primary/90" : "bg-[#00B8A0] shadow-[#00B8A0]/20 hover:bg-[#00B8A0]/90"
            }`}
          >
            Report Pet
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <FilterBar filters={filters} onChange={(f) => { setFilters(f); setPage(1); }} showMonth />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-5">
        <div className="inline-flex bg-gray-100 rounded-full p-1 gap-1">
          <button
            onClick={() => { setTab("lost"); setPage(1); }}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
              tab === "lost" ? "bg-white text-[#1E2A3A] shadow-sm" : "text-gray-500 hover:text-[#1E2A3A]"
            }`}
          >
            {t("lostFound.lostPets")}
          </button>
          <button
            onClick={() => { setTab("found"); setPage(1); }}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
              tab === "found" ? "bg-white text-[#1E2A3A] shadow-sm" : "text-gray-500 hover:text-[#1E2A3A]"
            }`}
          >
            {t("lostFound.foundPets")}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        {isError ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-red-100">
            <p className="font-bold text-lg text-red-500 mb-2">{t("lostFound.failedLoad")}</p>
            <p className="text-gray-400 text-sm mb-4">{t("lostFound.failedLoadSub")}</p>
            <button onClick={() => refetch()} className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm">
              {t("common.retry")}
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <h3 className="font-display font-bold text-xl mb-2 text-[#1E2A3A]">
              {t("lostFound.noReportsFound", { type: tab })}
            </h3>
            <p className="text-gray-400">{t("lostFound.noReportsSub", { type: tab })}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {reports.map((report) => {
              const isOwner = user?.id === report.reporterId;
              return (
                <div key={report.id} className="relative">
                  <Link
                    href={`/lost-found/${report.id}`}
                    className="block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group"
                  >
                    <div className="relative overflow-hidden" style={{ height: "180px" }}>
                      <img
                        src={report.imageUrls?.[0] || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600"}
                        alt={report.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                      <div className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-white text-xs font-bold ${
                        report.reportType === "lost" ? "bg-red-500" : "bg-[#00B8A0]"
                      }`}>
                        {report.reportType === "lost" ? t("lostFound.lost") : t("lostFound.found")}
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-display font-bold text-base text-[#1E2A3A]">{report.name}</h3>
                        <span className="text-xs text-gray-400 font-medium capitalize">{report.type}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <span className="px-2 py-0.5 bg-[#00B8A0]/10 text-[#00B8A0] rounded-full text-xs font-semibold capitalize">{report.type}</span>
                        {report.gender && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                            report.gender === "male" ? "bg-blue-50 text-blue-500" : "bg-pink-50 text-pink-500"
                          }`}>
                            {report.gender}
                          </span>
                        )}
                        {(report.lostDate || report.foundDate) && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-semibold">
                            {new Date(report.lostDate || report.foundDate || new Date()).toLocaleDateString(i18n.language, { day: "numeric", month: "short" })}
                          </span>
                        )}
                      </div>
                      <div className="mt-auto">
                        <span className={`block w-full text-center py-2.5 rounded-xl font-bold text-sm transition-colors text-white ${
                          report.reportType === "lost" ? "bg-primary hover:bg-primary/90" : "bg-[#00B8A0] hover:bg-[#00B8A0]/90"
                        }`}>
                          {report.reportType === "lost" ? t("lostFound.helpMe") : t("lostFound.helpThisPet")}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {isOwner && (
                    <div className="flex gap-1.5 mt-2 px-1">
                      <button
                        onClick={(e) => handleResolve(report.id, report.reportType, e)}
                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                      >
                        {report.reportType === "lost" ? "Found My Pet" : "Found Owner"}
                      </button>
                      <button
                        onClick={(e) => handleDelete(report.id, e)}
                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-between items-center mt-8">
          <button
            onClick={openModal}
            className={`px-6 py-3 rounded-full font-bold text-sm shadow-md transition-colors text-white ${
              tab === "lost" ? "bg-primary hover:bg-primary/90" : "bg-[#00B8A0] hover:bg-[#00B8A0]/90"
            }`}
          >
            {tab === "lost" ? t("lostFound.reportLostPet") : t("lostFound.reportFoundPet")}
          </button>
          {!isClientFiltering && (
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-500" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="w-10 h-10 rounded-full bg-primary border border-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) { setIsModalOpen(false); resetForm(); } }}>
        <DialogContent className="sm:max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{t("lostFound.submitReport")}</DialogTitle>
            <DialogDescription>
              Fill in both sections to help find or return this pet.
            </DialogDescription>
          </DialogHeader>

          {submitSuccess ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
              <h3 className="font-display font-bold text-xl text-[#1E2A3A]">Report Submitted!</h3>
              <p className="text-gray-500 text-sm">Your report has been submitted and is pending admin approval. It will appear on the listing once approved.</p>
              <button
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="mt-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
              <div className="space-y-4">
                <h3 className="font-display font-bold text-base text-[#1E2A3A] border-b border-gray-100 pb-2">Pet Information</h3>

                <div className="flex gap-4">
                  <label className={`flex items-center gap-2 px-4 py-3 rounded-xl flex-1 cursor-pointer border-2 transition-colors ${
                    reportType === "lost" ? "border-primary bg-primary/5" : "border-gray-200 bg-gray-50"
                  }`}>
                    <input type="radio" value="lost" {...form.register("reportType")} className="accent-primary" />
                    <span className="text-sm font-medium">{t("lostFound.iLostPet")}</span>
                  </label>
                  <label className={`flex items-center gap-2 px-4 py-3 rounded-xl flex-1 cursor-pointer border-2 transition-colors ${
                    reportType === "found" ? "border-[#00B8A0] bg-[#00B8A0]/5" : "border-gray-200 bg-gray-50"
                  }`}>
                    <input type="radio" value="found" {...form.register("reportType")} className="accent-[#00B8A0]" />
                    <span className="text-sm font-medium">{t("lostFound.iFoundPet")}</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold">Pet Name *</label>
                    <input {...form.register("name")} placeholder="e.g. Buddy" className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                    {form.formState.errors.name && <p className="text-red-500 text-xs">{form.formState.errors.name.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold">Gender *</label>
                    <select {...form.register("gender")} className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30">
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="unknown">Unknown</option>
                    </select>
                    {form.formState.errors.gender && <p className="text-red-500 text-xs">{form.formState.errors.gender.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold">Pet Type *</label>
                    <select {...form.register("type")} className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30">
                      <option value="Dog">Dog</option>
                      <option value="Cat">Cat</option>
                      <option value="Rabbit">Rabbit</option>
                      <option value="Bird">Bird</option>
                      <option value="Other">Other</option>
                    </select>
                    {form.formState.errors.type && <p className="text-red-500 text-xs">{form.formState.errors.type.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold">
                      Breed {reportType === "found" ? "(optional)" : "*"}
                    </label>
                    <input
                      {...form.register("breed")}
                      placeholder="e.g. Labrador"
                      className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold">Age (months)</label>
                    <input
                      type="number"
                      min={0}
                      {...form.register("ageMonths")}
                      placeholder="e.g. 24"
                      className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    {form.formState.errors.ageMonths && <p className="text-red-500 text-xs">{form.formState.errors.ageMonths.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold">Size *</label>
                    <select {...form.register("size")} className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30">
                      <option value="">Select size</option>
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                    {form.formState.errors.size && <p className="text-red-500 text-xs">{form.formState.errors.size.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold">City *</label>
                    <input {...form.register("city")} placeholder="e.g. Amman" className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                    {form.formState.errors.city && <p className="text-red-500 text-xs">{form.formState.errors.city.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold">Area *</label>
                    <input {...form.register("area")} placeholder="e.g. Abdoun" className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                    {form.formState.errors.area && <p className="text-red-500 text-xs">{form.formState.errors.area.message}</p>}
                  </div>

                  <div className="col-span-2 space-y-1.5">
                    <label className="text-sm font-bold">
                      {reportType === "lost" ? "Date Lost *" : "Date Found *"}
                    </label>
                    {reportType === "lost" ? (
                      <input
                        type="date"
                        {...form.register("lostDate")}
                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    ) : (
                      <input
                        type="date"
                        {...form.register("foundDate")}
                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    )}
                    {(form.formState.errors.lostDate || form.formState.errors.foundDate) && (
                      <p className="text-red-500 text-xs">
                        {form.formState.errors.lostDate?.message || form.formState.errors.foundDate?.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold">Photos * (up to {MAX_IMAGES})</label>
                  <div className="flex flex-wrap gap-2">
                    {imagePreviews.map((src, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                    {imagePreviews.length < MAX_IMAGES && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-primary hover:text-primary transition-colors"
                      >
                        <ImagePlus className="w-5 h-5" />
                        <span className="text-xs">Add</span>
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  {imageFiles.length === 0 && form.formState.isSubmitted && (
                    <p className="text-red-500 text-xs">At least one image is required</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold">Notes (optional)</label>
                  <textarea
                    {...form.register("description")}
                    placeholder="Any additional details about the pet..."
                    className="w-full min-h-[80px] bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-display font-bold text-base text-[#1E2A3A] border-b border-gray-100 pb-2">Reporter Information</h3>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold">Your Name *</label>
                    <input {...form.register("reporterName")} placeholder="Your full name" className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                    {form.formState.errors.reporterName && <p className="text-red-500 text-xs">{form.formState.errors.reporterName.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold">WhatsApp Contact *</label>
                    <WhatsAppPhoneInput
                      initialPhone={user?.phone ?? ""}
                      onChange={url => form.setValue("whatsappUrl", url, { shouldValidate: form.formState.isSubmitted })}
                      error={form.formState.errors.whatsappUrl?.message}
                      touched={form.formState.isSubmitted}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full bg-primary hover:bg-primary/90 text-white py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
              >
                {createMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                  </span>
                ) : "Submit Report"}
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

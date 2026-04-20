import { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "wouter";
import {
  useListLostFoundReports,
  useCreateLostFoundReport,
} from "@workspace/api-client-react";
import { FilterSidebar } from "@/components/filter-sidebar";
import type { FilterBarState } from "@/components/filter-bar";
import { Search, Loader2, ChevronLeft, ChevronRight, X, ImagePlus, CheckCircle2, SlidersHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/auth-context";
import WhatsAppPhoneInput from "@/components/whatsapp-phone-input";
import type { TFunction } from "i18next";

const MAX_IMAGES = 5;

const EMPTY_FILTERS: FilterBarState = {
  type: "", gender: "", minAge: "", maxAge: "", size: "", city: "", breed: "", month: "", sterilized: "",
};

function buildReportSchema(t: TFunction) {
  return z.object({
    reportType: z.enum(["lost", "found"]),
    name: z.string().min(1, t("lostFound.petNameRequired")),
    gender: z.string().min(1, t("lostFound.genderRequired")),
    type: z.string().min(1, t("lostFound.typeRequired")),
    breed: z.string().optional(),
    ageMonths: z.coerce.number().min(0).optional(),
    size: z.string().min(1, t("lostFound.sizeRequired")),
    city: z.string().min(1, t("lostFound.cityRequired")),
    area: z.string().min(1, t("lostFound.areaRequired")),
    lostDate: z.string().optional(),
    foundDate: z.string().optional(),
    description: z.string().optional(),
    reporterName: z.string().min(1, t("lostFound.reporterNameRequired")),
    whatsappUrl: z.string().min(1, t("lostFound.whatsappRequired")),
  }).superRefine((data, ctx) => {
    if (data.reportType === "lost" && !data.lostDate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("lostFound.dateLostRequired"), path: ["lostDate"] });
    }
    if (data.reportType === "found" && !data.foundDate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: t("lostFound.dateFoundRequired"), path: ["foundDate"] });
    }
  });
}

type ReportFormValues = {
  reportType: "lost" | "found";
  name: string;
  gender: string;
  type: string;
  breed?: string;
  ageMonths?: number;
  size: string;
  city: string;
  area: string;
  lostDate?: string;
  foundDate?: string;
  description?: string;
  reporterName: string;
  whatsappUrl: string;
};

function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const map: Record<string, { label: string; className: string }> = {
    pending: { label: t("common.pending"), className: "bg-yellow-100 text-yellow-700" },
    approved: { label: t("common.approved"), className: "bg-green-100 text-green-700" },
    rejected: { label: t("common.rejected"), className: "bg-red-100 text-red-500" },
    resolved: { label: t("profile.statusResolved"), className: "bg-gray-100 text-gray-500" },
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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState<FilterBarState>(EMPTY_FILTERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [page, setPage] = useState(1);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const pageSize = 20;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  function parseAgeRangeFilter(ageStr: string): { minAge?: number; maxAge?: number } {
    if (!ageStr) return {};
    if (ageStr === "< 1 year") return { maxAge: 12 };
    if (ageStr === "1–3 years") return { minAge: 12, maxAge: 36 };
    if (ageStr === "3–5 years") return { minAge: 36, maxAge: 60 };
    if (ageStr === "5+ years") return { minAge: 60 };
    return {};
  }

  const ageRange = parseAgeRangeFilter(filters.minAge);

  const { data, isLoading, isError, refetch } = useListLostFoundReports({
    reportType: tab,
    search: debouncedSearch || undefined,
    type: filters.type || undefined,
    city: filters.city || undefined,
    gender: filters.gender || undefined,
    size: filters.size || undefined,
    breed: filters.breed || undefined,
    minAge: ageRange.minAge,
    maxAge: ageRange.maxAge,
    limit: pageSize,
    page,
  });

  const createMutation = useCreateLostFoundReport();

  const reportSchema = useMemo(() => buildReportSchema(t), [t, i18n.language]);

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
      toast({ title: t("lostFound.uploadImageReq"), variant: "destructive" });
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

  const reports = data?.reports ?? [];

  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize) || 1;

  const openModal = () => {
    resetForm();
    form.setValue("reportType", tab);
    setIsModalOpen(true);
  };

  const handleClear = () => {
    setFilters(EMPTY_FILTERS);
    setSearch("");
    setPage(1);
  };

  const handleFilterChange = (f: FilterBarState) => { setFilters(f); setPage(1); };

  const handleTabChange = (newTab: "lost" | "found") => {
    setTab(newTab);
    setPage(1);
  };

  const activeFilterCount = [
    filters.city ? 1 : 0,
    filters.type ? 1 : 0,
    filters.breed ? 1 : 0,
    filters.gender ? 1 : 0,
    filters.minAge ? 1 : 0,
    filters.size ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar: Search + Report a pet button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder={t("lostFound.searchPlaceholder")}
              className="w-full bg-white border border-gray-200 rounded-xl ps-12 pe-4 py-3 text-sm text-[#333E48] placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-primary/30 shadow-sm"
            />
          </div>
          <button
            onClick={openModal}
            className={`px-5 py-3 rounded-xl font-bold text-sm shadow-md transition-colors whitespace-nowrap text-white ${
              tab === "lost" ? "bg-primary shadow-primary/20 hover:bg-primary/90" : "bg-[#3D937F] shadow-[#3D937F]/20 hover:bg-[#3D937F]/90"
            }`}
          >
            {t("lostFound.reportPet")}
          </button>
        </div>
      </div>

      {/* Main two-column layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 flex gap-6 items-start">

        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-60 xl:w-64 shrink-0 sticky top-24">
          <FilterSidebar
            filters={filters}
            onChange={handleFilterChange}
            reportType={tab}
            onReportTypeChange={handleTabChange}
            onClear={handleClear}
          />
        </aside>

        {/* Pet area */}
        <div className="flex-1 min-w-0">

          {/* Mobile: filters toggle */}
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-[#333E48] shadow-sm hover:border-primary/50 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 text-primary" />
              {t("filters.filters")}
              {activeFilterCount > 0 && (
                <span className="px-2 py-0.5 bg-primary text-white text-xs font-bold rounded-full leading-none">
                  {activeFilterCount}
                </span>
              )}
            </button>
            {total > 0 && (
              <span className="text-sm text-gray-400">{total} {tab === "lost" ? t("lostFound.lostPets") : t("lostFound.foundPets")}</span>
            )}
          </div>

          {/* Results grid */}
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
              <h3 className="font-display font-bold text-xl mb-2 text-[#333E48]">
                {t("lostFound.noReportsFound", { type: tab })}
              </h3>
              <p className="text-gray-400">{t("lostFound.noReportsSub", { type: tab })}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {reports.map((report) => {
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
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                        <div className={`absolute top-3 start-3 px-2 py-0.5 rounded-full text-white text-xs font-bold ${
                          report.reportType === "lost" ? "bg-red-500" : "bg-[#3D937F]"
                        }`}>
                          {report.reportType === "lost" ? t("lostFound.lost") : t("lostFound.found")}
                        </div>
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-display font-bold text-base text-[#333E48]">{report.name}</h3>
                          <span className="text-xs text-gray-400 font-medium">
                            {{ Dog: t("filters.dog"), Cat: t("filters.cat"), Rabbit: t("filters.rabbit"), Bird: t("filters.bird"), Other: t("filters.other") }[report.type] ?? report.type}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          <span className="px-2 py-0.5 bg-[#3D937F]/10 text-[#3D937F] rounded-full text-xs font-semibold">
                            {{ Dog: t("filters.dog"), Cat: t("filters.cat"), Rabbit: t("filters.rabbit"), Bird: t("filters.bird"), Other: t("filters.other") }[report.type] ?? report.type}
                          </span>
                          {report.gender && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              report.gender === "male" ? "bg-blue-50 text-blue-500" : "bg-pink-50 text-pink-500"
                            }`}>
                              {{ male: t("lostFound.genderMale"), female: t("lostFound.genderFemale"), unknown: t("lostFound.genderUnknown") }[report.gender] ?? report.gender}
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
                            report.reportType === "lost" ? "bg-primary hover:bg-primary/90" : "bg-[#3D937F] hover:bg-[#3D937F]/90"
                          }`}>
                            {report.reportType === "lost" ? t("lostFound.helpMe") : t("lostFound.helpThisPet")}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom row: report button + pagination */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={openModal}
              className={`px-6 py-3 rounded-full font-bold text-sm shadow-md transition-colors text-white ${
                tab === "lost" ? "bg-primary hover:bg-primary/90" : "bg-[#3D937F] hover:bg-[#3D937F]/90"
              }`}
            >
              {tab === "lost" ? t("lostFound.reportLostPet") : t("lostFound.reportFoundPet")}
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-500 rtl:rotate-180" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="w-10 h-10 rounded-full bg-primary border border-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-white rtl:rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 start-0 z-50 w-80 max-w-[90vw] bg-background shadow-2xl overflow-y-auto">
            <FilterSidebar
              filters={filters}
              onChange={handleFilterChange}
              reportType={tab}
              onReportTypeChange={handleTabChange}
              onClear={handleClear}
              onClose={() => setDrawerOpen(false)}
            />
          </div>
        </>
      )}

      <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) { setIsModalOpen(false); resetForm(); } }}>
        <DialogContent className="sm:max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{t("lostFound.submitReport")}</DialogTitle>
            <DialogDescription>
              {t("lostFound.fillBothSections")}
            </DialogDescription>
          </DialogHeader>

          {submitSuccess ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
              <h3 className="font-display font-bold text-xl text-[#333E48]">{t("lostFound.reportSubmittedTitle")}</h3>
              <p className="text-gray-500 text-sm">{t("lostFound.reportSubmittedDesc")}</p>
              <button
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="mt-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
              >
                {t("lostFound.done")}
              </button>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
              <div className="space-y-4">
                <h3 className="font-display font-bold text-base text-[#333E48] border-b border-gray-100 pb-2">{t("lostFound.petInfoSection")}</h3>

                <div className="flex gap-4">
                  <label className={`flex items-center gap-2 px-4 py-3 rounded-xl flex-1 cursor-pointer border-2 transition-colors ${
                    reportType === "lost" ? "border-primary bg-primary/5" : "border-gray-200 bg-gray-50"
                  }`}>
                    <input type="radio" value="lost" {...form.register("reportType")} className="accent-primary" />
                    <span className="text-sm font-medium">{t("lostFound.iLostPet")}</span>
                  </label>
                  <label className={`flex items-center gap-2 px-4 py-3 rounded-xl flex-1 cursor-pointer border-2 transition-colors ${
                    reportType === "found" ? "border-[#3D937F] bg-[#3D937F]/5" : "border-gray-200 bg-gray-50"
                  }`}>
                    <input type="radio" value="found" {...form.register("reportType")} className="accent-[#3D937F]" />
                    <span className="text-sm font-medium">{t("lostFound.iFoundPet")}</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold">{t("lostFound.petName")} *</label>
                    <input {...form.register("name")} placeholder={t("lostFound.placeholderName")} className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                    {form.formState.errors.name && <p className="text-red-500 text-xs">{form.formState.errors.name.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold">{t("lostFound.gender")} *</label>
                    <select {...form.register("gender")} className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30">
                      <option value="">{t("lostFound.selectGender")}</option>
                      <option value="male">{t("lostFound.genderMale")}</option>
                      <option value="female">{t("lostFound.genderFemale")}</option>
                      <option value="unknown">{t("lostFound.genderUnknown")}</option>
                    </select>
                    {form.formState.errors.gender && <p className="text-red-500 text-xs">{form.formState.errors.gender.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold">{t("lostFound.type")} *</label>
                    <select {...form.register("type")} className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30">
                      <option value="Dog">{t("filters.dog")}</option>
                      <option value="Cat">{t("filters.cat")}</option>
                      <option value="Rabbit">{t("filters.rabbit")}</option>
                      <option value="Bird">{t("filters.bird")}</option>
                      <option value="Other">{t("filters.other")}</option>
                    </select>
                    {form.formState.errors.type && <p className="text-red-500 text-xs">{form.formState.errors.type.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold">
                      {reportType === "found" ? t("lostFound.breedOptional") : t("lostFound.breedRequired")}
                    </label>
                    <input
                      {...form.register("breed")}
                      placeholder={t("lostFound.breed")}
                      className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold">{t("lostFound.ageMonths")}</label>
                    <input
                      type="number"
                      min={0}
                      {...form.register("ageMonths")}
                      placeholder={t("lostFound.agePlaceholder")}
                      className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    {form.formState.errors.ageMonths && <p className="text-red-500 text-xs">{form.formState.errors.ageMonths.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold">{t("lostFound.size")} *</label>
                    <select {...form.register("size")} className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30">
                      <option value="">{t("lostFound.selectSize")}</option>
                      <option value="small">{t("filters.small")}</option>
                      <option value="medium">{t("filters.medium")}</option>
                      <option value="large">{t("filters.large")}</option>
                    </select>
                    {form.formState.errors.size && <p className="text-red-500 text-xs">{form.formState.errors.size.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold">{t("lostFound.city")} *</label>
                    <input {...form.register("city")} placeholder={t("lostFound.cityPlaceholder")} className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                    {form.formState.errors.city && <p className="text-red-500 text-xs">{form.formState.errors.city.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold">{t("lostFound.area")} *</label>
                    <input {...form.register("area")} placeholder={t("lostFound.areaPlaceholder")} className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                    {form.formState.errors.area && <p className="text-red-500 text-xs">{form.formState.errors.area.message}</p>}
                  </div>

                  <div className="col-span-2 space-y-1.5">
                    <label className="text-sm font-bold">
                      {reportType === "lost" ? `${t("lostFound.dateLost")} *` : `${t("lostFound.dateFound")} *`}
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
                  <label className="text-sm font-bold">{t("lostFound.photosUpTo", { max: MAX_IMAGES })}</label>
                  <div className="flex flex-wrap gap-2">
                    {imagePreviews.map((src, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 end-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center"
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
                        <span className="text-xs">{t("lostFound.addPhoto")}</span>
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
                    <p className="text-red-500 text-xs">{t("lostFound.uploadImageReq")}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold">{t("lostFound.notes")}</label>
                  <textarea
                    {...form.register("description")}
                    placeholder={t("lostFound.notesPlaceholder")}
                    className="w-full min-h-[80px] bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-display font-bold text-base text-[#333E48] border-b border-gray-100 pb-2">{t("lostFound.contactSection")}</h3>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold">{t("lostFound.reporterName")} *</label>
                    <input {...form.register("reporterName")} placeholder={t("lostFound.reporterNamePlaceholder")} className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                    {form.formState.errors.reporterName && <p className="text-red-500 text-xs">{form.formState.errors.reporterName.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold">{t("lostFound.whatsappContact")} *</label>
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
                    <Loader2 className="w-4 h-4 animate-spin" /> {t("lostFound.submitting")}
                  </span>
                ) : t("lostFound.submitReportBtn")}
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

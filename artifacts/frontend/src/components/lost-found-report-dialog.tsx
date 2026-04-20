import { useState, useRef, useMemo } from "react";
import { useCreateLostFoundReport } from "@workspace/api-client-react";
import { Loader2, X, ImagePlus, CheckCircle2 } from "lucide-react";
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

interface LostFoundReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultReportType?: "lost" | "found";
  onSuccess?: () => void;
}

export function LostFoundReportDialog({ open, onOpenChange, defaultReportType = "lost", onSuccess }: LostFoundReportDialogProps) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createMutation = useCreateLostFoundReport();

  const reportSchema = useMemo(() => buildReportSchema(t), [t, i18n.language]);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reportType: defaultReportType,
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
      reportType: defaultReportType,
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
    try {
      await createMutation.mutateAsync({
        data: {
          ...values,
          imageUrls: imagePreviews,
          reporterId: user?.id,
        },
      });
      setSubmitSuccess(true);
      onSuccess?.();
    } catch {
      toast({ title: t("lostFound.reportError"), variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onOpenChange(false); resetForm(); } }}>
      <DialogContent className="sm:max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{t("lostFound.submitReport")}</DialogTitle>
          <DialogDescription>{t("lostFound.fillBothSections")}</DialogDescription>
        </DialogHeader>

        {submitSuccess ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
            <h3 className="font-display font-bold text-xl text-[#333E48]">{t("lostFound.reportSubmittedTitle")}</h3>
            <p className="text-gray-500 text-sm">{t("lostFound.reportSubmittedDesc")}</p>
            <button
              onClick={() => { onOpenChange(false); resetForm(); }}
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
  );
}

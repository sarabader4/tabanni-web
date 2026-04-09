import { useParams, Link, useLocation } from "wouter";
import { useGetPet, useCreateAdoptionRequest, useCreateFosterRequest } from "@workspace/api-client-react";
import { ArrowLeft, Loader2, Heart, Share2, CheckCircle2, Phone, User, Lightbulb, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import AIPetMatchWidget from "@/components/ai-pet-match-widget";
import { useFavourites } from "@/hooks/use-favourites";
import { useAuth } from "@/contexts/auth-context";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useCallback } from "react";

export default function PetDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { data: pet, isLoading } = useGetPet(Number(id));
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isLoggedIn, isFavourited, isPendingFor, toggleFavourite } = useFavourites();
  const { user } = useAuth();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const petId = Number(id);
  const favourited = isFavourited(petId);
  const isPending = isPendingFor(petId);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closeLightbox]);

  const handleFavourite = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      toast({ title: t("petDetail.pleaseLogin") });
      return;
    }
    const wasAdded = !favourited;
    await toggleFavourite(petId);
    toast({
      title: wasAdded ? t("petDetail.addedToFav") : t("petDetail.removedFromFav"),
    });
  };

  const adoptMutation = useCreateAdoptionRequest();
  const fosterMutation = useCreateFosterRequest();

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: pet?.name, url });
      } catch {
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast({ title: t("petDetail.linkCopied"), description: t("petDetail.linkCopiedDesc") });
      } catch {
        toast({ title: t("petDetail.share"), description: url });
      }
    }
  };

  const doAdopt = async () => {
    try {
      await adoptMutation.mutateAsync({ data: { petId: Number(id), message: "I would love to adopt this pet." } });
      toast({ title: t("petDetail.adoptionSent"), description: t("petDetail.ownerContact") });
    } catch (err: unknown) {
      const body = (err as { response?: { data?: { error?: string } } })?.response?.data;
      if (body?.error === "duplicate_request") {
        toast({ title: t("petDetail.requestExists"), description: t("petDetail.requestExistsDesc"), variant: "destructive" });
      } else {
        toast({ title: t("petDetail.error"), description: t("petDetail.failedRequest"), variant: "destructive" });
      }
    }
  };

  const doFoster = async () => {
    try {
      await fosterMutation.mutateAsync({ data: { petId: Number(id), message: "I would love to foster this pet." } });
      toast({ title: t("petDetail.fosterSent"), description: t("petDetail.ownerContact") });
    } catch (err: unknown) {
      const body = (err as { response?: { data?: { error?: string } } })?.response?.data;
      if (body?.error === "duplicate_request") {
        toast({ title: t("petDetail.requestExists"), description: t("petDetail.requestExistsDesc"), variant: "destructive" });
      } else {
        toast({ title: t("petDetail.error"), description: t("petDetail.failedRequest"), variant: "destructive" });
      }
    }
  };

  const handleAdopt = () => {
    if (!user) { navigate("/login"); toast({ title: t("petDetail.pleaseLoginFirst") }); return; }
    if (!user.isOnboardingCompleted) {
      toast({ title: t("petDetail.completeForm"), description: t("petDetail.completeFormDesc") });
      sessionStorage.setItem("pendingRequest", JSON.stringify({ petId: Number(id), type: "adoption" }));
      navigate("/profile?tab=My+Requests&openForm=true");
      return;
    }
    doAdopt();
  };

  const handleFoster = () => {
    if (!user) { navigate("/login"); toast({ title: t("petDetail.pleaseLoginFirst") }); return; }
    if (!user.isOnboardingCompleted) {
      toast({ title: t("petDetail.completeForm"), description: t("petDetail.completeFormDesc") });
      sessionStorage.setItem("pendingRequest", JSON.stringify({ petId: Number(id), type: "foster" }));
      navigate("/profile?tab=My+Requests&openForm=true");
      return;
    }
    doFoster();
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  if (!pet) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <h2 className="text-3xl font-display font-bold mb-4">{t("petDetail.petNotFound")}</h2>
        <Link href="/adopt" className="text-primary hover:underline">{t("petDetail.backToPets")}</Link>
      </div>
    );
  }

  const ownerName = pet.addedByAdmin ? t("petDetail.tabbanniGroup") : (pet.ownerName || t("petDetail.unknown"));
  const ownerPhone = pet.ownerPhone;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/adopt" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" /> {t("petDetail.backToList")}
      </Link>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Left column: Image + Pet Story + General Tips */}
        <div className="space-y-6">
          <div
            className={`aspect-[4/3] rounded-3xl overflow-hidden shadow-lg border border-border ${pet.imageUrls && pet.imageUrls.length > 0 ? "cursor-pointer" : ""}`}
            onClick={() => { if (pet.imageUrls && pet.imageUrls.length > 0) setLightboxIndex(0); }}
          >
            <img
              src={pet.imageUrls?.[0] || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800"}
              alt={pet.name}
              className={`w-full h-full object-cover ${pet.imageUrls && pet.imageUrls.length > 0 ? "hover:scale-105 transition-transform duration-300" : ""}`}
            />
          </div>
          {pet.imageUrls && pet.imageUrls.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {pet.imageUrls.slice(1).map((img, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl overflow-hidden border border-border cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setLightboxIndex(i + 1)}
                >
                  <img src={img} alt={`${pet.name} ${i}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Pet Story */}
          <div className="bg-card border border-border p-6 rounded-3xl">
            <h3 className="font-display font-bold text-xl mb-3">{t("petDetail.petStory")}</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {pet.story || t("petDetail.storyFallback", { name: pet.name })}
            </p>
          </div>

          {/* General Tips */}
          <div className="bg-card border border-border p-6 rounded-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h3 className="font-display font-bold text-xl">{t("petDetail.generalTips")}</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{t("petDetail.tip1")}</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{t("petDetail.tip2")}</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{t("petDetail.tip3")}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right column: Details */}
        <div className="flex flex-col">
          {/* Type/breed badges */}
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-primary/10 text-primary font-bold text-sm rounded-full capitalize">
              {pet.type}
            </span>
            <span className="px-3 py-1 bg-muted text-muted-foreground font-bold text-sm rounded-full capitalize">
              {pet.breed || t("petDetail.mixed")}
            </span>
            {pet.purpose === "foster" && (
              <span className="px-3 py-1 bg-secondary/10 text-secondary font-bold text-sm rounded-full">
                {t("petDetail.needsFoster")}
              </span>
            )}
          </div>

          {/* Name + Favorite + Share */}
          <div className="flex justify-between items-start mb-6">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              {pet.name}
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-3 rounded-full bg-muted/50 hover:bg-blue-50 text-muted-foreground hover:text-blue-500 transition-colors"
                aria-label={t("petDetail.share")}
              >
                <Share2 className="w-6 h-6" />
              </button>
              <button
                onClick={handleFavourite}
                disabled={isPending}
                className={cn(
                  "p-3 rounded-full transition-all duration-200 disabled:opacity-60",
                  favourited
                    ? "bg-red-50 text-red-500 scale-110"
                    : "bg-muted/50 hover:bg-red-50 text-muted-foreground hover:text-red-500",
                )}
                aria-label={t("petDetail.favourite")}
              >
                <Heart
                  className={cn(
                    "w-6 h-6 transition-all duration-200",
                    favourited && "fill-red-500 text-red-500",
                  )}
                />
              </button>
            </div>
          </div>

          {/* Pet info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-card border border-border p-4 rounded-2xl flex flex-col gap-1 text-center">
              <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">{t("petDetail.gender")}</span>
              <span className="font-bold text-foreground capitalize">{pet.gender}</span>
            </div>
            <div className="bg-card border border-border p-4 rounded-2xl flex flex-col gap-1 text-center">
              <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">{t("petDetail.age")}</span>
              <span className="font-bold text-foreground">{Math.floor(pet.ageMonths / 12)}{t("petDetail.ageYearShort")} {pet.ageMonths % 12}{t("petDetail.ageMonthShort")}</span>
            </div>
            <div className="bg-card border border-border p-4 rounded-2xl flex flex-col gap-1 text-center">
              <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">{t("petDetail.size")}</span>
              <span className="font-bold text-foreground capitalize">{pet.size}</span>
            </div>
            <div className="bg-card border border-border p-4 rounded-2xl flex flex-col gap-1 text-center">
              <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">{t("petDetail.location")}</span>
              <span className="font-bold text-foreground">{pet.city}</span>
            </div>
          </div>

          {/* Health & Care */}
          <div className="bg-card border border-border p-6 rounded-3xl mb-6 space-y-4">
            <h3 className="font-display font-bold text-xl">{t("petDetail.healthCare")}</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className={cn("w-5 h-5", pet.sterilized ? "text-secondary" : "text-muted-foreground")} />
                <span className={pet.sterilized ? "text-foreground font-medium" : "text-muted-foreground"}>
                  {pet.sterilized ? t("petDetail.sterilized") : t("petDetail.notSterilized")}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className={cn("w-5 h-5", pet.yearlyVaccines ? "text-secondary" : "text-muted-foreground")} />
                <span className={pet.yearlyVaccines ? "text-foreground font-medium" : "text-muted-foreground"}>
                  {pet.yearlyVaccines ? t("petDetail.upToDateVaccines") : t("petDetail.needsVaccines")}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 p-6 bg-muted/30 rounded-3xl border border-border mb-6">
            {user && pet.ownerId && user.id === pet.ownerId ? (
              <div className="flex-1 py-4 rounded-2xl border-2 border-dashed border-muted-foreground/30 text-center text-muted-foreground font-semibold text-sm">
                {t("petDetail.yourPet", "This is your pet")}
              </div>
            ) : (
              <>
                {(pet.purpose === "adopt" || pet.purpose === "both") && (
                  <button
                    onClick={handleAdopt}
                    disabled={adoptMutation.isPending}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {adoptMutation.isPending ? t("petDetail.sending") : t("petDetail.requestAdoption")}
                  </button>
                )}
                {(pet.purpose === "foster" || pet.purpose === "both") && (
                  <button
                    onClick={handleFoster}
                    disabled={fosterMutation.isPending}
                    className="flex-1 bg-secondary hover:bg-secondary/90 text-white py-4 rounded-2xl font-bold shadow-lg shadow-secondary/20 transition-all hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {fosterMutation.isPending ? t("petDetail.sending") : t("petDetail.requestFoster")}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Owner Info */}
          <div className="bg-card border border-border p-6 rounded-3xl">
            <h3 className="font-display font-bold text-xl mb-4">{t("petDetail.ownerInfo")}</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground shrink-0" />
                <span className="font-medium text-foreground">{ownerName}</span>
              </div>
              {ownerPhone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground shrink-0" />
                  <a
                    href={`https://wa.me/${ownerPhone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary hover:underline font-medium"
                  >
                    {ownerPhone}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Similar Pets */}
      <div className="mt-12">
        <AIPetMatchWidget
          mode="similar"
          currentPet={{
            id: pet.id,
            name: pet.name,
            type: pet.type,
            breed: pet.breed,
            size: pet.size,
            city: pet.city,
            ageMonths: pet.ageMonths,
          }}
        />
      </div>

      {/* Image Lightbox */}
      {lightboxIndex !== null && pet.imageUrls && pet.imageUrls.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={pet.imageUrls[lightboxIndex] || ""}
            alt={`${pet.name} ${lightboxIndex + 1}`}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

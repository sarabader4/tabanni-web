import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useListPets } from "@workspace/api-client-react";
import { PetCard } from "@/components/pet-card";
import { FilterBar, type FilterBarState } from "@/components/filter-bar";
import { Search, Loader2, Plus, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { useFavourites } from "@/hooks/use-favourites";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

type PurposeFilter = "adopt" | "foster" | "both";

export default function Adopt() {
  const [search, setSearch] = useState("");
  const [purpose, setPurpose] = useState<PurposeFilter>("adopt");
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isLoggedIn, isFavourited, isPendingFor, toggleFavourite } = useFavourites();

  const handleFavorite = async (petId: number) => {
    if (!isLoggedIn) {
      navigate("/login");
      toast({ title: t("adopt.loginToFav") });
      return;
    }
    if (isPendingFor(petId)) return;
    const wasAdded = !isFavourited(petId);
    await toggleFavourite(petId);
    toast({
      title: wasAdded ? t("adopt.addedToFav") : t("adopt.removedFromFav"),
    });
  };
  const [filters, setFilters] = useState<FilterBarState>({
    type: "", gender: "", minAge: "", maxAge: "", size: "", city: "", breed: "", month: "", sterilized: "",
  });

  const sterilizedParam = filters.sterilized === "yes" ? true : filters.sterilized === "no" ? false : undefined;

  function parseAgeRange(ageStr: string): { minAge?: number; maxAge?: number } {
    if (!ageStr) return {};
    if (ageStr === "< 1 year") return { maxAge: 12 };
    if (ageStr === "1–3 years") return { minAge: 12, maxAge: 36 };
    if (ageStr === "3–5 years") return { minAge: 36, maxAge: 60 };
    if (ageStr === "5+ years") return { minAge: 60 };
    return {};
  }

  const ageRange = parseAgeRange(filters.minAge);

  const { data, isLoading, isError } = useListPets({
    purpose: purpose === "both" ? undefined : purpose,
    search: search || undefined,
    type: filters.type || undefined,
    gender: filters.gender || undefined,
    size: filters.size || undefined,
    city: filters.city || undefined,
    breed: filters.breed || undefined,
    sterilized: sterilizedParam,
    minAge: ageRange.minAge,
    maxAge: ageRange.maxAge,
    page,
    limit: pageSize,
  });

  const totalPages = Math.ceil((data?.total ?? 0) / pageSize) || 1;

  const purposeOptions: { key: PurposeFilter; labelKey: string }[] = [
    { key: "adopt", labelKey: "adopt.adopt" },
    { key: "foster", labelKey: "adopt.foster" },
    { key: "both", labelKey: "adopt.adoptFoster" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Search bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder={t("adopt.searchPlaceholder")}
              className="w-full bg-white border border-gray-200 rounded-xl ps-12 pe-4 py-3 text-sm text-[#1E2A3A] placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-primary/30 shadow-sm"
            />
          </div>
          <Link
            href="/#ai-pet-match"
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white shadow-md transition-colors whitespace-nowrap"
            style={{ background: "linear-gradient(135deg, #FF6B35, #e05a25)" }}
            title={t("home.aiPetMatchTooltip")}
          >
            <Sparkles className="w-4 h-4" />
            {t("home.aiPetMatch")}
          </Link>
        </div>
      </div>

      {/* Filter Bar + Purpose Chips */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 space-y-3">
        {/* Purpose filter chips */}
        <div className="flex gap-2 flex-wrap">
          {purposeOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => { setPurpose(opt.key); setPage(1); }}
              className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-all ${
                purpose === opt.key
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-500 border-gray-200 hover:border-primary/50"
              }`}
            >
              {t(opt.labelKey)}
            </button>
          ))}
        </div>
        <FilterBar filters={filters} onChange={(f) => { setFilters(f); setPage(1); }} showSterilized />
      </div>

      {/* Pet Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {isError ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-red-100">
            <p className="font-bold text-lg text-red-500 mb-2">{t("adopt.failedLoad")}</p>
            <p className="text-gray-400 text-sm">{t("adopt.failedLoadSub")}</p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : data?.pets?.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <h3 className="font-display font-bold text-xl mb-2 text-[#1E2A3A]">
              {t("adopt.noPetsFound")}
            </h3>
            <p className="text-gray-400 mb-6">{t("adopt.noPetsSub")}</p>
            <button
              onClick={() => {
                setSearch("");
                setPurpose("adopt");
                setPage(1);
                setFilters({ type: "", gender: "", minAge: "", maxAge: "", size: "", city: "", breed: "", month: "", sterilized: "" });
              }}
              className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm"
            >
              {t("adopt.clearFilters")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {data?.pets?.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                variant="adopt"
                isFavorited={isFavourited(pet.id)}
                isFavoritePending={isPendingFor(pet.id)}
                onFavorite={handleFavorite}
              />
            ))}
          </div>
        )}

        {/* Bottom row: floating add + pagination */}
        <div className="flex justify-between items-center mt-8">
          <Link href="/profile" className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-bold text-sm shadow-md shadow-primary/20 hover:bg-primary/90 hover:-translate-y-0.5 transition-all">
            <Plus className="w-4 h-4" />
            {t("adopt.addPet")}
          </Link>
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
  );
}

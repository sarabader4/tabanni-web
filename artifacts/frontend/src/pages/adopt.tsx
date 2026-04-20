import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useListPets } from "@workspace/api-client-react";
import { PetCard } from "@/components/pet-card";
import { type FilterBarState } from "@/components/filter-bar";
import { FilterSidebar } from "@/components/filter-sidebar";
import {
  Search, Loader2, Plus, Sparkles,
  ChevronLeft, ChevronRight, SlidersHorizontal,
} from "lucide-react";
import { useFavourites } from "@/hooks/use-favourites";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

type PurposeFilter = "adopt" | "foster" | "both";

const EMPTY_FILTERS: FilterBarState = {
  type: "", gender: "", minAge: "", maxAge: "", size: "",
  city: "", breed: "", month: "", sterilized: "",
};

export default function Adopt() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [purpose, setPurpose] = useState<PurposeFilter>("both");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pageSize = 20;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isLoggedIn, isFavourited, isPendingFor, toggleFavourite } = useFavourites();

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

  const [filters, setFilters] = useState<FilterBarState>(EMPTY_FILTERS);

  const sterilizedParam =
    filters.sterilized === "yes" ? true :
    filters.sterilized === "no" ? false :
    undefined;

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
    search: debouncedSearch || undefined,
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

  const activeFilterCount = [
    purpose !== "both" ? 1 : 0,
    filters.city ? 1 : 0,
    filters.type ? 1 : 0,
    filters.breed ? 1 : 0,
    filters.gender ? 1 : 0,
    filters.minAge ? 1 : 0,
    filters.size ? 1 : 0,
    filters.sterilized ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const handleClear = () => {
    setFilters(EMPTY_FILTERS);
    setPurpose("both");
    setSearch("");
    setPage(1);
  };

  const handleFilterChange = (f: FilterBarState) => { setFilters(f); setPage(1); };
  const handlePurposeChange = (v: string) => { setPurpose(v as PurposeFilter); setPage(1); };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar: Search + AI button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder={t("adopt.searchPlaceholder")}
              className="w-full bg-white border border-gray-200 rounded-xl ps-12 pe-4 py-3 text-sm text-[#333E48] placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-primary/30 shadow-sm"
            />
          </div>
          <button
            onClick={() => {
              if (window.location.pathname === "/") {
                document.getElementById("ai-pet-match")?.scrollIntoView({ behavior: "smooth" });
              } else {
                window.location.href = "/#ai-pet-match";
              }
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white shadow-md transition-colors whitespace-nowrap"
            style={{ background: "linear-gradient(135deg, #FA8D29, #e05a25)" }}
            title={t("home.aiPetMatchTooltip")}
          >
            <Sparkles className="w-4 h-4" />
            {t("home.aiPetMatch")}
          </button>
        </div>
      </div>

      {/* Main two-column layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 flex gap-6 items-start">

        {/* ── Desktop Sidebar ── */}
        <aside className="hidden lg:block w-60 xl:w-64 shrink-0 sticky top-24">
          <FilterSidebar
            filters={filters}
            onChange={handleFilterChange}
            purpose={purpose}
            onPurposeChange={handlePurposeChange}
            onClear={handleClear}
          />
        </aside>

        {/* ── Pet area ── */}
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
            {data?.total !== undefined && (
              <span className="text-sm text-gray-400">{t("adopt.petsCount", { count: data.total })}</span>
            )}
          </div>

          {/* Pet grid */}
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
              <h3 className="font-display font-bold text-xl mb-2 text-[#333E48]">
                {t("adopt.noPetsFound")}
              </h3>
              <p className="text-gray-400 mb-6">{t("adopt.noPetsSub")}</p>
              <button
                onClick={handleClear}
                className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm"
              >
                {t("adopt.clearFilters")}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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

          {/* Bottom row: add pet + pagination */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={() => navigate("/profile?tab=My%20Pets&addPet=true")}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-bold text-sm shadow-md shadow-primary/20 hover:bg-primary/90 hover:-translate-y-0.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              {t("adopt.addPet")}
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

      {/* ── Mobile Drawer (slides in from start = left LTR / right RTL) ── */}
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
              purpose={purpose}
              onPurposeChange={handlePurposeChange}
              onClear={handleClear}
              onClose={() => setDrawerOpen(false)}
            />
          </div>
        </>
      )}
    </div>
  );
}

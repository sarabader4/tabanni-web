import { useState } from "react";
import { useListPets } from "@workspace/api-client-react";
import { PetCard } from "@/components/pet-card";
import { FilterBar, type FilterBarState } from "@/components/filter-bar";
import { Search, Loader2, Plus, Sparkles } from "lucide-react";

export default function Adopt() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterBarState>({
    type: "", gender: "", minAge: "", maxAge: "", size: "", city: "", breed: "", month: "", sterilized: "",
  });

  const sterilizedParam = filters.sterilized === "yes" ? true : filters.sterilized === "no" ? false : undefined;

  const { data, isLoading } = useListPets({
    purpose: "adopt",
    search: search || undefined,
    type: filters.type || undefined,
    gender: filters.gender || undefined,
    size: filters.size || undefined,
    city: filters.city || undefined,
    breed: filters.breed || undefined,
    sterilized: sterilizedParam,
    limit: 20,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Search bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for friend to adopt..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm text-[#1E2A3A] placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-primary/30 shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white shadow-md transition-colors whitespace-nowrap"
            style={{ background: "linear-gradient(135deg, #FF6B35, #e05a25)" }}
            title="AI-powered pet matching"
          >
            <Sparkles className="w-4 h-4" />
            AI Pet Match
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <FilterBar filters={filters} onChange={setFilters} showSterilized />
      </div>

      {/* Pet Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : data?.pets?.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <h3 className="font-display font-bold text-xl mb-2 text-[#1E2A3A]">
              No pets found
            </h3>
            <p className="text-gray-400 mb-6">Try adjusting your filters to see more results.</p>
            <button
              onClick={() => {
                setSearch("");
                setFilters({ type: "", gender: "", minAge: "", maxAge: "", size: "", city: "", breed: "", month: "", sterilized: "" });
              }}
              className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {data?.pets?.map((pet) => (
              <PetCard key={pet.id} pet={pet} variant="adopt" />
            ))}
          </div>
        )}
      </div>

      {/* Floating add button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-bold text-sm shadow-xl shadow-primary/30 hover:bg-primary/90 hover:-translate-y-0.5 transition-all">
          <Plus className="w-4 h-4" />
          Add your pet to adopt!
        </button>
      </div>
    </div>
  );
}

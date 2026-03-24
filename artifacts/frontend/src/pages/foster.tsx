import { useState } from "react";
import { useListPets } from "@workspace/api-client-react";
import { PetCard } from "@/components/pet-card";
import { FilterBar, type FilterBarState } from "@/components/filter-bar";
import { Search, Loader2, Plus, Home, Heart, Calendar } from "lucide-react";

export default function Foster() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterBarState>({
    type: "", gender: "", minAge: "", maxAge: "", size: "", city: "", breed: "", month: "",
  });

  const { data, isLoading } = useListPets({
    purpose: "foster",
    search: search || undefined,
    type: filters.type || undefined,
    gender: filters.gender || undefined,
    size: filters.size || undefined,
    city: filters.city || undefined,
    limit: 20,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Foster Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <div
          className="rounded-2xl p-8 md:p-10 relative overflow-hidden"
          style={{ backgroundColor: "#00B8A0" }}
        >
          <div className="relative z-10 max-w-2xl">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
              Become a Foster Hero
            </h1>
            <p className="text-white/80 text-sm leading-relaxed mb-6 max-w-lg">
              Fostering saves lives. By providing a temporary home, you help a pet transition
              to their forever family and free up space for another rescue.
            </p>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Home className="w-4 h-4 text-white" />
                </div>
                <span className="text-white text-sm font-semibold">Safe space</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="text-white text-sm font-semibold">Love & care</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <span className="text-white text-sm font-semibold">Temp. commitment</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for pets to foster..."
            className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm text-[#1E2A3A] placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-primary/30 shadow-sm"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : data?.pets?.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <h3 className="font-display font-bold text-xl mb-2 text-[#1E2A3A]">
              No foster needs right now
            </h3>
            <p className="text-gray-400">Check back later or adjust your filters.</p>
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
          Add your pet for fostering!
        </button>
      </div>
    </div>
  );
}

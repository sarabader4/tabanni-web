import { useState } from "react";
import { useListPets } from "@workspace/api-client-react";
import { PetCard } from "@/components/pet-card";
import { FilterSidebar, type FilterState } from "@/components/filter-sidebar";
import { Loader2, Home, Heart, Calendar } from "lucide-react";

export default function Foster() {
  const [filters, setFilters] = useState<FilterState>({
    search: "", type: "", gender: "", size: "", city: ""
  });

  const { data, isLoading } = useListPets({
    purpose: "foster",
    search: filters.search || undefined,
    type: filters.type || undefined,
    gender: filters.gender || undefined,
    size: filters.size || undefined,
    city: filters.city || undefined,
    limit: 20
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Foster Hero */}
      <div className="bg-secondary text-white rounded-3xl p-8 md:p-12 mb-12 relative overflow-hidden shadow-xl shadow-secondary/20">
        <div className="relative z-10 max-w-2xl">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Become a Foster Hero
          </h1>
          <p className="text-lg text-white/80 mb-8">
            Fostering saves lives. By providing a temporary home, you help a pet transition to their forever family and free up space for another rescue.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <Home className="w-6 h-6 text-primary" />
              <span className="font-bold text-sm">Provide a safe space</span>
            </div>
            <div className="flex flex-col gap-2">
              <Heart className="w-6 h-6 text-primary" />
              <span className="font-bold text-sm">Give love & care</span>
            </div>
            <div className="flex flex-col gap-2">
              <Calendar className="w-6 h-6 text-primary" />
              <span className="font-bold text-sm">Temporary commitment</span>
            </div>
          </div>
        </div>
        <img 
          src={`${import.meta.env.BASE_URL}images/foster-hero.png`} 
          alt="Fostering" 
          className="absolute right-0 top-0 w-1/3 h-full object-cover opacity-20 md:opacity-100 mix-blend-overlay"
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <aside className="w-full lg:w-80 flex-shrink-0">
          <FilterSidebar filters={filters} onChange={setFilters} title="Find Fosters" />
        </aside>

        <main className="flex-1 w-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-secondary" />
            </div>
          ) : data?.pets?.length === 0 ? (
            <div className="text-center py-20 bg-muted/30 rounded-3xl border border-border border-dashed">
              <h3 className="font-display font-bold text-xl mb-2">No foster needs right now</h3>
              <p className="text-muted-foreground">Check back later or adjust your filters.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {data?.pets?.map((pet) => (
                <PetCard key={pet.id} pet={pet} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

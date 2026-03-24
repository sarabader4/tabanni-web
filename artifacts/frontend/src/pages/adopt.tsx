import { useState } from "react";
import { useListPets } from "@workspace/api-client-react";
import { PetCard } from "@/components/pet-card";
import { FilterSidebar, type FilterState } from "@/components/filter-sidebar";
import { Loader2 } from "lucide-react";

export default function Adopt() {
  const [filters, setFilters] = useState<FilterState>({
    search: "", type: "", gender: "", size: "", city: ""
  });

  const { data, isLoading } = useListPets({
    purpose: "adopt",
    search: filters.search || undefined,
    type: filters.type || undefined,
    gender: filters.gender || undefined,
    size: filters.size || undefined,
    city: filters.city || undefined,
    limit: 20
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-10 text-center md:text-left">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
          Adopt a Pet
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Open your heart and home to a pet in need. Browse our available companions and find your perfect match today.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar */}
        <aside className="w-full lg:w-80 flex-shrink-0">
          <FilterSidebar filters={filters} onChange={setFilters} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : data?.pets?.length === 0 ? (
            <div className="text-center py-20 bg-muted/30 rounded-3xl border border-border border-dashed">
              <h3 className="font-display font-bold text-xl mb-2">No pets found</h3>
              <p className="text-muted-foreground">Try adjusting your filters to see more results.</p>
              <button 
                onClick={() => setFilters({ search: "", type: "", gender: "", size: "", city: "" })}
                className="mt-6 px-6 py-2 bg-primary text-white rounded-xl font-bold"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6 flex justify-between items-center">
                <span className="text-sm font-bold text-muted-foreground">
                  Showing {data?.pets?.length} pets
                </span>
              </div>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {data?.pets?.map((pet) => (
                  <PetCard key={pet.id} pet={pet} />
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

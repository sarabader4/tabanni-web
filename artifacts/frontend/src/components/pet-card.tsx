import { Link } from "wouter";
import { Bookmark } from "lucide-react";
import type { Pet } from "@workspace/api-client-react/src/generated/api.schemas";
import { cn } from "@/lib/utils";

interface PetCardProps {
  pet: Pet;
  onFavorite?: (id: number) => void;
  isFavorited?: boolean;
  variant?: "adopt" | "lost";
}

export function PetCard({ pet, onFavorite, isFavorited, variant = "adopt" }: PetCardProps) {
  const imageUrl =
    pet.imageUrls?.[0] ||
    "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=60";

  const ageLabel =
    pet.ageMonths < 12
      ? `${pet.ageMonths} Months`
      : `${Math.floor(pet.ageMonths / 12)} Year${Math.floor(pet.ageMonths / 12) > 1 ? "s" : ""}`;

  return (
    <Link href={`/pets/${pet.id}`} className="block group">
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
        {/* Image */}
        <div className="relative overflow-hidden" style={{ height: "180px" }}>
          <img
            src={imageUrl}
            alt={pet.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Bookmark */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onFavorite?.(pet.id);
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white text-gray-400 hover:text-primary transition-all shadow-sm"
          >
            <Bookmark
              className={cn("w-4 h-4", isFavorited && "fill-primary text-primary")}
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          {/* Name + Age */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display font-bold text-base text-[#1E2A3A]">{pet.name}</h3>
            <span className="text-xs text-gray-400 font-medium">{ageLabel}</span>
          </div>

          {/* Tag Badges */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-[#00B8A0]/10 text-[#00B8A0] rounded-full text-xs font-semibold capitalize">
              {pet.type}
            </span>
            {pet.gender && (
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs font-semibold capitalize",
                pet.gender === "male"
                  ? "bg-blue-50 text-blue-500"
                  : "bg-pink-50 text-pink-500"
              )}>
                {pet.gender}
              </span>
            )}
            {pet.sterilized && (
              <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-xs font-semibold">
                ✓ Sterilized
              </span>
            )}
            {pet.size && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-semibold capitalize">
                {pet.size}
              </span>
            )}
            {pet.weightKg && (
              <span className="px-2 py-0.5 bg-orange-50 text-orange-500 rounded-full text-xs font-semibold">
                {pet.weightKg} kg
              </span>
            )}
          </div>

          {/* CTA Button */}
          <div className="mt-auto">
            <span
              className={cn(
                "block w-full text-center py-2.5 rounded-xl font-bold text-sm transition-all",
                variant === "lost"
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-primary text-white hover:bg-primary/90"
              )}
            >
              {variant === "lost" ? "Help Me" : "Meet Me"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

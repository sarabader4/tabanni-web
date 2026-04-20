import { Link, useLocation } from "wouter";
import { Heart, Share2, ShieldCheck } from "lucide-react";
import type { Pet } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface PetCardProps {
  pet: Pet;
  onFavorite?: (id: number) => void;
  isFavorited?: boolean;
  isFavoritePending?: boolean;
  variant?: "adopt" | "lost";
}

export function PetCard({ pet, onFavorite, isFavorited, isFavoritePending, variant = "adopt" }: PetCardProps) {
  const [, navigate] = useLocation();
  const { t } = useTranslation();

  const imageUrl =
    pet.imageUrls?.[0] ||
    "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=60";

  const ageLabel =
    pet.ageMonths < 12
      ? `${pet.ageMonths} Months`
      : `${Math.floor(pet.ageMonths / 12)} Year${Math.floor(pet.ageMonths / 12) > 1 ? "s" : ""}`;

  const petUrl = `${window.location.origin}/pets/${pet.id}`;

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (navigator.share) {
        await navigator.share({ title: pet.name, url: petUrl });
      } else {
        await navigator.clipboard.writeText(petUrl);
      }
    } catch {
      // user cancelled or clipboard failed — silent
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col group">
      {/* Image */}
      <div
        className="relative overflow-hidden cursor-pointer"
        style={{ height: "180px" }}
        onClick={() => navigate(`/pets/${pet.id}`)}
      >
        <img
          src={imageUrl}
          alt={pet.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Verified by Tabanni badge — start side */}
        {pet.addedByAdmin && (
          <div className="absolute top-3 start-3 flex items-center gap-1 px-2 py-1 rounded-full bg-[#3D937F] text-white text-xs font-bold shadow-sm backdrop-blur-sm">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified by Tabanni
          </div>
        )}

        {/* Fav + Share — end side */}
        <div className="absolute top-3 end-3 flex flex-col gap-1.5">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onFavorite?.(pet.id);
            }}
            disabled={isFavoritePending}
            className={cn(
              "p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all shadow-sm disabled:opacity-60",
              isFavorited
                ? "text-red-500 scale-110"
                : "text-gray-400 hover:text-red-500",
            )}
            aria-label={t("petDetail.favourite")}
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-all duration-200",
                isFavorited && "fill-red-500 text-red-500",
              )}
            />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white text-gray-400 hover:text-primary transition-all shadow-sm"
            aria-label={t("petDetail.share")}
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Name + Age */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display font-bold text-base text-[#333E48]">{pet.name}</h3>
          <span className="text-xs text-gray-400 font-medium">{ageLabel}</span>
        </div>

        {/* Tag Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-[#3D937F]/10 text-[#3D937F] rounded-full text-xs font-semibold capitalize">
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
          <Link
            href={`/pets/${pet.id}`}
            className={cn(
              "block w-full text-center py-2.5 rounded-xl font-bold text-sm transition-all",
              variant === "lost"
                ? "bg-primary text-white hover:bg-primary/90"
                : "bg-primary text-white hover:bg-primary/90"
            )}
          >
            {variant === "lost" ? "Help Me" : "Meet Me"}
          </Link>
        </div>
      </div>
    </div>
  );
}

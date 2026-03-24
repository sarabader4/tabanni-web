import { Link } from "wouter";
import { Heart, MapPin, Calendar, Activity } from "lucide-react";
import type { Pet } from "@workspace/api-client-react/src/generated/api.schemas";
import { cn } from "@/lib/utils";

interface PetCardProps {
  pet: Pet;
  onFavorite?: (id: number) => void;
  isFavorited?: boolean;
}

export function PetCard({ pet, onFavorite, isFavorited }: PetCardProps) {
  const imageUrl = pet.imageUrls?.[0] || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3";
  
  return (
    <div className="group bg-card rounded-3xl overflow-hidden border border-border hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      {/* Image Area */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {/* stock image fallback mostly handled by DB seed, but using standard unsplash params */}
        <img
          src={imageUrl}
          alt={pet.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className="bg-white/90 backdrop-blur-sm text-foreground px-3 py-1 rounded-full text-xs font-bold capitalize shadow-sm">
            {pet.type}
          </span>
          {pet.purpose === "foster" && (
            <span className="bg-secondary/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold capitalize shadow-sm">
              Needs Foster
            </span>
          )}
        </div>
        
        {/* Favorite Button */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onFavorite?.(pet.id);
          }}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white text-muted-foreground hover:text-primary transition-all shadow-sm active:scale-95"
        >
          <Heart className={cn("w-5 h-5", isFavorited && "fill-primary text-primary")} />
        </button>
      </div>

      {/* Content Area */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-display font-bold text-2xl text-foreground">
            {pet.name}
          </h3>
          {pet.gender === "male" ? (
            <span className="text-blue-500 bg-blue-50 px-2 py-0.5 rounded text-xs font-bold">Male</span>
          ) : (
            <span className="text-pink-500 bg-pink-50 px-2 py-0.5 rounded text-xs font-bold">Female</span>
          )}
        </div>

        <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-primary/70" />
            <span>{Math.floor(pet.ageMonths / 12)}y {pet.ageMonths % 12}m</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-primary/70" />
            <span>{pet.city}</span>
          </div>
          <div className="flex items-center gap-1">
            <Activity className="w-4 h-4 text-primary/70" />
            <span className="capitalize">{pet.size}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">
          {pet.story || `Meet ${pet.name}, a wonderful ${pet.breed || pet.type} looking for a loving home.`}
        </p>

        <div className="flex items-center gap-3 mt-auto">
          {pet.purpose !== "foster" && (
            <Link 
              href={`/pets/${pet.id}`}
              className="flex-1 bg-primary/10 text-primary hover:bg-primary hover:text-white text-center py-3 rounded-xl font-bold text-sm transition-colors"
            >
              Adopt
            </Link>
          )}
          {pet.purpose !== "adopt" && (
            <Link 
              href={`/pets/${pet.id}`}
              className="flex-1 bg-secondary/10 text-secondary hover:bg-secondary hover:text-white text-center py-3 rounded-xl font-bold text-sm transition-colors"
            >
              Foster
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

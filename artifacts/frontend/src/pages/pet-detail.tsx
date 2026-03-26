import { useParams, Link } from "wouter";
import { useGetPet, useCreateAdoptionRequest, useCreateFosterRequest } from "@workspace/api-client-react";
import { ArrowLeft, Loader2, Heart, Share2, CheckCircle2, Phone, User, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import AIPetMatchWidget from "@/components/ai-pet-match-widget";

export default function PetDetail() {
  const { id } = useParams();
  const { data: pet, isLoading } = useGetPet(Number(id));
  const { toast } = useToast();

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
        toast({ title: "Link copied!", description: "Pet page link copied to clipboard." });
      } catch {
        toast({ title: "Share", description: url });
      }
    }
  };

  const handleAdopt = async () => {
    try {
      await adoptMutation.mutateAsync({ data: { petId: Number(id), requesterId: 1, message: "I would love to adopt this pet." } });
      toast({ title: "Adoption request sent!", description: "The owner will contact you soon." });
    } catch {
      toast({ title: "Error", description: "Failed to send request. Please try again.", variant: "destructive" });
    }
  };

  const handleFoster = async () => {
    try {
      await fosterMutation.mutateAsync({ data: { petId: Number(id), requesterId: 1, message: "I would love to foster this pet." } });
      toast({ title: "Foster request sent!", description: "The owner will contact you soon." });
    } catch {
      toast({ title: "Error", description: "Failed to send request. Please try again.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  if (!pet) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <h2 className="text-3xl font-display font-bold mb-4">Pet Not Found</h2>
        <Link href="/adopt" className="text-primary hover:underline">Back to pets</Link>
      </div>
    );
  }

  const ownerName = pet.addedByAdmin ? "Tabanni Group" : (pet.ownerName || "Unknown");
  const ownerPhone = pet.ownerPhone;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/adopt" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to list
      </Link>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Left column: Image + Pet Story + General Tips */}
        <div className="space-y-6">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-lg border border-border">
            <img
              src={pet.imageUrls?.[0] || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800"}
              alt={pet.name}
              className="w-full h-full object-cover"
            />
          </div>
          {pet.imageUrls && pet.imageUrls.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {pet.imageUrls.slice(1).map((img, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden border border-border cursor-pointer hover:opacity-80 transition-opacity">
                  <img src={img} alt={`${pet.name} ${i}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Pet Story */}
          <div className="bg-card border border-border p-6 rounded-3xl">
            <h3 className="font-display font-bold text-xl mb-3">Pet Story</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {pet.story || `${pet.name} is looking for a loving home. Be the one to give them a second chance!`}
            </p>
          </div>

          {/* General Tips */}
          <div className="bg-card border border-border p-6 rounded-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h3 className="font-display font-bold text-xl">General Tips</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">Meet in a public, safe location</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">Interact with the pet calmly</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">Check the pet's records</span>
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
              {pet.breed || "Mixed"}
            </span>
            {pet.purpose === "foster" && (
              <span className="px-3 py-1 bg-secondary/10 text-secondary font-bold text-sm rounded-full">
                Needs Foster
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
                aria-label="Share"
              >
                <Share2 className="w-6 h-6" />
              </button>
              <button
                className="p-3 rounded-full bg-muted/50 hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                aria-label="Favorite"
              >
                <Heart className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Pet info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-card border border-border p-4 rounded-2xl flex flex-col gap-1 text-center">
              <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Gender</span>
              <span className="font-bold text-foreground capitalize">{pet.gender}</span>
            </div>
            <div className="bg-card border border-border p-4 rounded-2xl flex flex-col gap-1 text-center">
              <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Age</span>
              <span className="font-bold text-foreground">{Math.floor(pet.ageMonths / 12)}y {pet.ageMonths % 12}m</span>
            </div>
            <div className="bg-card border border-border p-4 rounded-2xl flex flex-col gap-1 text-center">
              <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Size</span>
              <span className="font-bold text-foreground capitalize">{pet.size}</span>
            </div>
            <div className="bg-card border border-border p-4 rounded-2xl flex flex-col gap-1 text-center">
              <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Location</span>
              <span className="font-bold text-foreground">{pet.city}</span>
            </div>
          </div>

          {/* Health & Care */}
          <div className="bg-card border border-border p-6 rounded-3xl mb-6 space-y-4">
            <h3 className="font-display font-bold text-xl">Health & Care</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className={cn("w-5 h-5", pet.sterilized ? "text-secondary" : "text-muted-foreground")} />
                <span className={pet.sterilized ? "text-foreground font-medium" : "text-muted-foreground"}>
                  {pet.sterilized ? "Sterilized / Neutered" : "Not Sterilized"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className={cn("w-5 h-5", pet.yearlyVaccines ? "text-secondary" : "text-muted-foreground")} />
                <span className={pet.yearlyVaccines ? "text-foreground font-medium" : "text-muted-foreground"}>
                  {pet.yearlyVaccines ? "Up to date on vaccinations" : "Needs vaccinations"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 p-6 bg-muted/30 rounded-3xl border border-border mb-6">
            {(pet.purpose === "adopt" || pet.purpose === "both") && (
              <button
                onClick={handleAdopt}
                disabled={adoptMutation.isPending}
                className="flex-1 bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 disabled:opacity-50"
              >
                {adoptMutation.isPending ? "Sending..." : "Request for Adoption"}
              </button>
            )}
            {(pet.purpose === "foster" || pet.purpose === "both") && (
              <button
                onClick={handleFoster}
                disabled={fosterMutation.isPending}
                className="flex-1 bg-secondary hover:bg-secondary/90 text-white py-4 rounded-2xl font-bold shadow-lg shadow-secondary/20 transition-all hover:-translate-y-0.5 disabled:opacity-50"
              >
                {fosterMutation.isPending ? "Sending..." : "Request for Foster"}
              </button>
            )}
          </div>

          {/* Owner Info */}
          <div className="bg-card border border-border p-6 rounded-3xl">
            <h3 className="font-display font-bold text-xl mb-4">Owner Info</h3>
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
    </div>
  );
}

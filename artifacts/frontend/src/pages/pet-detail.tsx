import { useParams, Link } from "wouter";
import { useState } from "react";
import { useGetPet, useCreateAdoptionRequest, useCreateFosterRequest } from "@workspace/api-client-react";
import { MapPin, Calendar, Activity, CheckCircle2, Info, ArrowLeft, Loader2, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import AIPetMatchWidget from "@/components/ai-pet-match-widget";

const requestSchema = z.object({
  message: z.string().min(10, "Please provide a bit more detail about why you want to adopt/foster."),
});

export default function PetDetail() {
  const { id } = useParams();
  const { data: pet, isLoading } = useGetPet(Number(id));
  const { toast } = useToast();
  
  const [requestType, setRequestType] = useState<"adopt" | "foster" | null>(null);
  const adoptMutation = useCreateAdoptionRequest();
  const fosterMutation = useCreateFosterRequest();

  const form = useForm<z.infer<typeof requestSchema>>({
    resolver: zodResolver(requestSchema),
    defaultValues: { message: "" }
  });

  const onSubmit = async (values: z.infer<typeof requestSchema>) => {
    try {
      if (requestType === "adopt") {
        await adoptMutation.mutateAsync({ data: { petId: Number(id), requesterId: 1, message: values.message } });
        toast({ title: "Adoption request sent!", description: "The owner will contact you soon." });
      } else {
        await fosterMutation.mutateAsync({ data: { petId: Number(id), requesterId: 1, message: values.message } });
        toast({ title: "Foster request sent!", description: "The owner will contact you soon." });
      }
      setRequestType(null);
      form.reset();
    } catch (err) {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/adopt" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to list
      </Link>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
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
        </div>

        {/* Details */}
        <div className="flex flex-col">
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

          <div className="flex justify-between items-start mb-6">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              {pet.name}
            </h1>
            <button className="p-3 rounded-full bg-muted/50 hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors">
              <Heart className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
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

          <div className="bg-card border border-border p-6 rounded-3xl mb-8 space-y-4">
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

          <div className="mb-10 flex-1">
            <h3 className="font-display font-bold text-xl mb-4">About {pet.name}</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {pet.story || "No background story provided."}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-auto p-6 bg-muted/30 rounded-3xl border border-border">
            {(pet.purpose === "adopt" || pet.purpose === "both") && (
              <button 
                onClick={() => setRequestType("adopt")}
                className="flex-1 bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
              >
                Apply to Adopt
              </button>
            )}
            {(pet.purpose === "foster" || pet.purpose === "both") && (
              <button 
                onClick={() => setRequestType("foster")}
                className="flex-1 bg-secondary hover:bg-secondary/90 text-white py-4 rounded-2xl font-bold shadow-lg shadow-secondary/20 transition-all hover:-translate-y-0.5"
              >
                Offer to Foster
              </button>
            )}
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

      {/* Request Modal */}
      <Dialog open={!!requestType} onOpenChange={(open) => !open && setRequestType(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {requestType === "adopt" ? `Adopt ${pet.name}` : `Foster ${pet.name}`}
            </DialogTitle>
            <DialogDescription>
              Tell us why you'd be a great match for {pet.name}. The current owner will review your application.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Your Message</label>
              <textarea
                {...form.register("message")}
                className="w-full min-h-[150px] p-4 bg-muted/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                placeholder="Hi, I have a big yard and a lot of love to give..."
              />
              {form.formState.errors.message && (
                <p className="text-destructive text-xs font-medium">{form.formState.errors.message.message}</p>
              )}
            </div>
            
            <button 
              type="submit" 
              disabled={adoptMutation.isPending || fosterMutation.isPending}
              className="w-full bg-foreground hover:bg-foreground/90 text-white py-4 rounded-2xl font-bold transition-all disabled:opacity-50"
            >
              {adoptMutation.isPending || fosterMutation.isPending ? "Sending..." : "Submit Application"}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

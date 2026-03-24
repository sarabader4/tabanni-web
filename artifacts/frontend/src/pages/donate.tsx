import { useState } from "react";
import { useCreateDonation, useListDonations } from "@workspace/api-client-react";
import { Heart, Package, CreditCard, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

const monetarySchema = z.object({
  type: z.literal("monetary"),
  donorName: z.string().min(1, "Name required"),
  donorPhone: z.string().min(1, "Phone required"),
  amount: z.string().min(1, "Amount required"),
  frequency: z.enum(["one_time", "monthly"]),
  paymentMethod: z.string().min(1, "Select payment method"),
});

const suppliesSchema = z.object({
  type: z.literal("supplies"),
  donorName: z.string().min(1, "Name required"),
  donorPhone: z.string().min(1, "Phone required"),
  donationTypeLabel: z.string().min(1, "Select supply type"),
  description: z.string().min(5, "Please describe the supplies"),
});

export default function Donate() {
  const [tab, setTab] = useState<"monetary" | "supplies">("monetary");
  const { toast } = useToast();
  const createDonation = useCreateDonation();
  const { data: recentDonors } = useListDonations({ limit: 5 });

  const monetaryForm = useForm<z.infer<typeof monetarySchema>>({
    resolver: zodResolver(monetarySchema),
    defaultValues: { type: "monetary", donorName: "", donorPhone: "", amount: "25", frequency: "one_time", paymentMethod: "Visa" }
  });

  const suppliesForm = useForm<z.infer<typeof suppliesSchema>>({
    resolver: zodResolver(suppliesSchema),
    defaultValues: { type: "supplies", donorName: "", donorPhone: "", donationTypeLabel: "Food", description: "" }
  });

  const onMonetarySubmit = async (values: z.infer<typeof monetarySchema>) => {
    try {
      await createDonation.mutateAsync({ data: values });
      toast({ title: "Thank you!", description: "Your donation helps pets in need." });
      monetaryForm.reset();
    } catch {
      toast({ title: "Error processing donation", variant: "destructive" });
    }
  };

  const onSuppliesSubmit = async (values: z.infer<typeof suppliesSchema>) => {
    try {
      await createDonation.mutateAsync({ data: values as any });
      toast({ title: "Thank you!", description: "We will contact you to arrange drop-off." });
      suppliesForm.reset();
    } catch {
      toast({ title: "Error submitting form", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
          Support Our Mission
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          100% of your donation goes directly towards food, medical care, and shelter for rescued animals across Jordan. Every dinar makes a difference.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-12 items-start">
        {/* Main Form Area */}
        <div className="lg:col-span-8 bg-card rounded-3xl border border-border shadow-xl shadow-black/5 overflow-hidden">
          <div className="flex border-b border-border">
            <button
              onClick={() => setTab("monetary")}
              className={`flex-1 py-6 flex items-center justify-center gap-2 font-bold text-sm transition-colors ${
                tab === "monetary" ? "bg-white text-primary border-b-2 border-primary" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <Heart className="w-5 h-5" /> Monetary Donation
            </button>
            <button
              onClick={() => setTab("supplies")}
              className={`flex-1 py-6 flex items-center justify-center gap-2 font-bold text-sm transition-colors ${
                tab === "supplies" ? "bg-white text-secondary border-b-2 border-secondary" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <Package className="w-5 h-5" /> Donate Supplies
            </button>
          </div>

          <div className="p-8 md:p-12">
            {tab === "monetary" ? (
              <form onSubmit={monetaryForm.handleSubmit(onMonetarySubmit)} className="space-y-8">
                <div>
                  <label className="text-sm font-bold block mb-4">Select Amount (JOD)</label>
                  <div className="grid grid-cols-4 gap-3">
                    {["10", "25", "50", "100"].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => monetaryForm.setValue("amount", amt)}
                        className={`py-3 rounded-2xl font-bold text-lg transition-all ${
                          monetaryForm.watch("amount") === amt 
                            ? "bg-primary text-white shadow-md shadow-primary/20 scale-105" 
                            : "bg-muted text-foreground hover:bg-muted/80"
                        }`}
                      >
                        {amt}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4">
                    <input 
                      type="number" 
                      placeholder="Other Amount" 
                      {...monetaryForm.register("amount")}
                      className="w-full bg-muted/50 border-none rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Your Name</label>
                    <input {...monetaryForm.register("donorName")} className="w-full bg-muted/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Phone Number</label>
                    <input {...monetaryForm.register("donorPhone")} className="w-full bg-muted/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold block">Payment Method</label>
                  <div className="flex gap-4">
                    {["Visa", "Mastercard", "PayPal"].map(method => (
                      <label key={method} className="flex-1 flex items-center justify-center gap-2 bg-muted/50 border border-border p-4 rounded-2xl cursor-pointer hover:bg-muted transition-colors">
                        <input type="radio" value={method} {...monetaryForm.register("paymentMethod")} className="accent-primary" />
                        <span className="font-bold text-sm">{method}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={createDonation.isPending}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-primary/25 transition-all hover:-translate-y-1 disabled:opacity-50"
                >
                  {createDonation.isPending ? "Processing..." : `Donate ${monetaryForm.watch("amount") || 0} JOD`}
                </button>
                <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                  <ShieldCheck className="w-4 h-4 text-secondary" /> Secure encrypted checkout
                </div>
              </form>
            ) : (
              <form onSubmit={suppliesForm.handleSubmit(onSuppliesSubmit)} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold block">What are you donating?</label>
                  <select {...suppliesForm.register("donationTypeLabel")} className="w-full bg-muted/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/50 outline-none">
                    <option value="Food">Pet Food (Dry/Wet)</option>
                    <option value="Blankets">Blankets & Beds</option>
                    <option value="Toys">Toys</option>
                    <option value="Medicine">Medicine & Supplies</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold">Description of items</label>
                  <textarea 
                    {...suppliesForm.register("description")} 
                    placeholder="E.g. 2 large bags of adult dog food, 3 new fleece blankets..."
                    className="w-full min-h-[120px] bg-muted/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/50 outline-none resize-none" 
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Your Name</label>
                    <input {...suppliesForm.register("donorName")} className="w-full bg-muted/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Phone Number</label>
                    <input {...suppliesForm.register("donorPhone")} className="w-full bg-muted/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/50" />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={createDonation.isPending}
                  className="w-full bg-secondary hover:bg-secondary/90 text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-secondary/25 transition-all hover:-translate-y-1 disabled:opacity-50"
                >
                  {createDonation.isPending ? "Submitting..." : "Schedule Drop-off"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-foreground text-white p-8 rounded-3xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-display font-bold text-2xl mb-4">Why donate?</h3>
              <ul className="space-y-4 text-white/80 text-sm">
                <li className="flex gap-3"><span className="text-primary font-bold">✓</span> Helps rescue injured animals from the streets</li>
                <li className="flex gap-3"><span className="text-primary font-bold">✓</span> Pays for vaccinations and sterilization</li>
                <li className="flex gap-3"><span className="text-primary font-bold">✓</span> Provides food for fosters who can't afford it</li>
              </ul>
            </div>
            <Heart className="absolute -right-10 -bottom-10 w-48 h-48 text-white/5" />
          </div>

          <div className="bg-card border border-border p-8 rounded-3xl">
            <h3 className="font-display font-bold text-xl mb-6 flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" /> Recent Donors
            </h3>
            <div className="space-y-4">
              {recentDonors?.slice(0, 5).map(donor => (
                <div key={donor.id} className="flex justify-between items-center pb-4 border-b border-border/50 last:border-0 last:pb-0">
                  <span className="font-medium text-sm">{donor.donorName}</span>
                  {donor.type === "monetary" ? (
                    <span className="text-primary font-bold text-sm">{donor.amount} JOD</span>
                  ) : (
                    <span className="text-secondary font-bold text-xs px-2 py-1 bg-secondary/10 rounded-md">Supplies</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

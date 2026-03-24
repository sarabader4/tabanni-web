import { useState } from "react";
import { useListLostFoundReports, useCreateLostFoundReport } from "@workspace/api-client-react";
import { FilterSidebar, type FilterState } from "@/components/filter-sidebar";
import { MapPin, Calendar, Search, Loader2, Plus, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const reportSchema = z.object({
  reportType: z.enum(["lost", "found"]),
  name: z.string().min(1, "Name is required (use 'Unknown' if found)"),
  type: z.string().min(1, "Type is required"),
  breed: z.string().optional(),
  gender: z.string().optional(),
  color: z.string().optional(),
  city: z.string().min(1, "City is required"),
  description: z.string().optional(),
  reporterName: z.string().min(1, "Your name is required"),
  reporterPhone: z.string().min(1, "Your phone is required"),
});

export default function LostFound() {
  const [tab, setTab] = useState<"lost" | "found">("lost");
  const [filters, setFilters] = useState<FilterState>({ search: "", type: "", gender: "", size: "", city: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const { data, isLoading, refetch } = useListLostFoundReports({
    reportType: tab,
    type: filters.type || undefined,
    city: filters.city || undefined,
    gender: filters.gender || undefined,
    size: filters.size || undefined,
    limit: 20
  });

  const createMutation = useCreateLostFoundReport();

  const form = useForm<z.infer<typeof reportSchema>>({
    resolver: zodResolver(reportSchema),
    defaultValues: { reportType: "lost", name: "", type: "Dog", city: "Amman", reporterName: "", reporterPhone: "" }
  });

  const onSubmit = async (values: z.infer<typeof reportSchema>) => {
    try {
      await createMutation.mutateAsync({ 
        data: {
          ...values,
          imageUrls: ["https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600"], // mock image for now
        }
      });
      toast({ title: "Report submitted successfully." });
      setIsModalOpen(false);
      form.reset();
      refetch();
    } catch (error) {
      toast({ title: "Error submitting report", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Lost & Found Pets
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Help reunite pets with their families. Report a lost pet or see if someone is looking for a pet you found.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-foreground text-white rounded-xl font-bold hover:bg-foreground/90 transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Submit a Report
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <aside className="w-full lg:w-80 flex-shrink-0">
          <FilterSidebar filters={filters} onChange={setFilters} title="Filter Reports" />
        </aside>

        <main className="flex-1 w-full">
          {/* Tabs */}
          <div className="flex bg-muted/50 p-1.5 rounded-2xl mb-8 w-fit">
            <button
              onClick={() => setTab("lost")}
              className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${
                tab === "lost" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Lost Pets
            </button>
            <button
              onClick={() => setTab("found")}
              className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${
                tab === "found" ? "bg-white text-secondary shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Found Pets
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : data?.reports?.length === 0 ? (
            <div className="text-center py-20 bg-muted/30 rounded-3xl border border-border border-dashed">
              <h3 className="font-display font-bold text-xl mb-2">No reports found</h3>
              <p className="text-muted-foreground">There are no {tab} pets matching your criteria.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {data?.reports?.map((report) => (
                <div key={report.id} className="bg-card rounded-3xl overflow-hidden border border-border flex flex-col group hover:shadow-xl hover:-translate-y-1 transition-all">
                  <div className="relative aspect-[16/10]">
                    <img 
                      src={report.imageUrls?.[0] || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600"} 
                      alt={report.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full text-white shadow-sm ${
                        report.reportType === 'lost' ? 'bg-destructive/90 backdrop-blur-sm' : 'bg-secondary/90 backdrop-blur-sm'
                      }`}>
                        {report.reportType.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display font-bold text-xl mb-1">{report.name}</h3>
                    <p className="text-sm font-medium text-muted-foreground mb-4">{report.breed || report.type} • {report.color}</p>
                    
                    <div className="space-y-2 text-sm text-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{report.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{report.lostDate || report.foundDate ? format(new Date(report.lostDate || report.foundDate || new Date()), 'MMM dd, yyyy') : 'Date unknown'}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-2xl border border-border/50">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Contact</p>
                      <p className="font-medium text-sm">{report.reporterName}</p>
                      <p className="text-sm text-primary font-bold">{report.reporterPhone}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl rounded-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Submit a Report</DialogTitle>
            <DialogDescription>Please provide as many details as possible to help identify the pet.</DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-bold">Report Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 bg-muted/50 px-4 py-3 rounded-xl flex-1 cursor-pointer">
                    <input type="radio" value="lost" {...form.register("reportType")} className="accent-primary" />
                    <span className="text-sm font-medium">I lost a pet</span>
                  </label>
                  <label className="flex items-center gap-2 bg-muted/50 px-4 py-3 rounded-xl flex-1 cursor-pointer">
                    <input type="radio" value="found" {...form.register("reportType")} className="accent-secondary" />
                    <span className="text-sm font-medium">I found a pet</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">Pet Name (or 'Unknown')</label>
                <input {...form.register("name")} className="w-full bg-muted/50 border-none rounded-xl px-4 py-2.5 text-sm" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">Type (Dog, Cat, etc.)</label>
                <input {...form.register("type")} className="w-full bg-muted/50 border-none rounded-xl px-4 py-2.5 text-sm" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">Breed</label>
                <input {...form.register("breed")} className="w-full bg-muted/50 border-none rounded-xl px-4 py-2.5 text-sm" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">Color</label>
                <input {...form.register("color")} className="w-full bg-muted/50 border-none rounded-xl px-4 py-2.5 text-sm" />
              </div>

              <div className="space-y-2 col-span-2">
                <label className="text-sm font-bold">City Location</label>
                <input {...form.register("city")} className="w-full bg-muted/50 border-none rounded-xl px-4 py-2.5 text-sm" />
              </div>

              <div className="space-y-2 col-span-2">
                <label className="text-sm font-bold">Description</label>
                <textarea {...form.register("description")} className="w-full min-h-[100px] bg-muted/50 border-none rounded-xl px-4 py-2.5 text-sm" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">Your Name</label>
                <input {...form.register("reporterName")} className="w-full bg-muted/50 border-none rounded-xl px-4 py-2.5 text-sm" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">Your Phone</label>
                <input {...form.register("reporterPhone")} className="w-full bg-muted/50 border-none rounded-xl px-4 py-2.5 text-sm" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={createMutation.isPending}
              className="w-full mt-6 bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-bold transition-all disabled:opacity-50"
            >
              {createMutation.isPending ? "Submitting..." : "Submit Report"}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

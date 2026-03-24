import { useState } from "react";
import { useListLostFoundReports, useCreateLostFoundReport } from "@workspace/api-client-react";
import { FilterBar, type FilterBarState } from "@/components/filter-bar";
import { Search, Loader2, ChevronLeft, ChevronRight, Bookmark } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const reportSchema = z.object({
  reportType: z.enum(["lost", "found"]),
  name: z.string().min(1, "Name is required"),
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
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterBarState>({
    type: "", gender: "", minAge: "", maxAge: "", size: "", city: "", breed: "", month: "", sterilized: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const { toast } = useToast();
  const pageSize = 20;

  const { data, isLoading, isError, refetch } = useListLostFoundReports({
    reportType: tab,
    type: filters.type || undefined,
    city: filters.city || undefined,
    gender: filters.gender || undefined,
    limit: pageSize,
    page,
  });

  const createMutation = useCreateLostFoundReport();

  const form = useForm<z.infer<typeof reportSchema>>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reportType: "lost",
      name: "",
      type: "Dog",
      city: "Amman",
      reporterName: "",
      reporterPhone: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof reportSchema>) => {
    try {
      await createMutation.mutateAsync({
        data: {
          ...values,
          imageUrls: ["https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600"],
        },
      });
      toast({ title: "Report submitted successfully." });
      setIsModalOpen(false);
      form.reset();
      refetch();
    } catch {
      toast({ title: "Error submitting report", variant: "destructive" });
    }
  };

  const allReports = data?.reports ?? [];
  const reports = search
    ? allReports.filter((r) =>
        r.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.type?.toLowerCase().includes(search.toLowerCase()) ||
        r.breed?.toLowerCase().includes(search.toLowerCase()) ||
        r.city?.toLowerCase().includes(search.toLowerCase())
      )
    : allReports;
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Search bar + Lost Pet button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for friend to adopt..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm text-[#1E2A3A] placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-primary/30 shadow-sm"
            />
          </div>
          <button
            onClick={() => {
              form.reset({ reportType: tab, name: "", type: "Dog", city: "Amman", reporterName: "", reporterPhone: "" });
              setIsModalOpen(true);
            }}
            className={`px-5 py-3 rounded-xl font-bold text-sm shadow-md transition-colors whitespace-nowrap text-white ${
              tab === "lost" ? "bg-primary shadow-primary/20 hover:bg-primary/90" : "bg-[#00B8A0] shadow-[#00B8A0]/20 hover:bg-[#00B8A0]/90"
            }`}
          >
            {tab === "lost" ? "Lost Pet" : "Found Pet"}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <FilterBar filters={filters} onChange={setFilters} showMonth />
      </div>

      {/* Lost / Found Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-5">
        <div className="inline-flex bg-gray-100 rounded-full p-1 gap-1">
          <button
            onClick={() => { setTab("lost"); setPage(1); }}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
              tab === "lost"
                ? "bg-white text-[#1E2A3A] shadow-sm"
                : "text-gray-500 hover:text-[#1E2A3A]"
            }`}
          >
            Lost Pets
          </button>
          <button
            onClick={() => { setTab("found"); setPage(1); }}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
              tab === "found"
                ? "bg-white text-[#1E2A3A] shadow-sm"
                : "text-gray-500 hover:text-[#1E2A3A]"
            }`}
          >
            Found Pets
          </button>
        </div>
      </div>

      {/* Pet Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        {isError ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-red-100">
            <p className="font-bold text-lg text-red-500 mb-2">Failed to load reports</p>
            <p className="text-gray-400 text-sm mb-4">Please try again.</p>
            <button onClick={() => refetch()} className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm">
              Retry
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <h3 className="font-display font-bold text-xl mb-2 text-[#1E2A3A]">
              No {tab} reports found
            </h3>
            <p className="text-gray-400">There are no {tab} pets matching your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="relative overflow-hidden" style={{ height: "180px" }}>
                  <img
                    src={
                      report.imageUrls?.[0] ||
                      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600"
                    }
                    alt={report.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  {/* Report type badge */}
                  <div className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-white text-xs font-bold ${
                    report.reportType === "lost" ? "bg-red-500" : "bg-[#00B8A0]"
                  }`}>
                    {report.reportType === "lost" ? "LOST" : "FOUND"}
                  </div>
                  <button className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white text-gray-400 hover:text-primary transition-all shadow-sm">
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-display font-bold text-base text-[#1E2A3A]">
                      {report.name}
                    </h3>
                    <span className="text-xs text-gray-400 font-medium capitalize">{report.type}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="px-2 py-0.5 bg-[#00B8A0]/10 text-[#00B8A0] rounded-full text-xs font-semibold capitalize">
                      {report.type}
                    </span>
                    {report.gender && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                        report.gender === "male"
                          ? "bg-blue-50 text-blue-500"
                          : "bg-pink-50 text-pink-500"
                      }`}>
                        {report.gender}
                      </span>
                    )}
                    {report.color && (
                      <span className="px-2 py-0.5 bg-orange-50 text-orange-500 rounded-full text-xs font-semibold">
                        {report.color}
                      </span>
                    )}
                    {(report.lostDate || report.foundDate) && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-semibold">
                        {new Date(report.lostDate || report.foundDate || new Date()).toLocaleDateString("en", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    )}
                  </div>
                  <div className="mt-auto">
                    <button className={`w-full py-2.5 rounded-xl font-bold text-sm transition-colors text-white ${
                      report.reportType === "lost" ? "bg-primary hover:bg-primary/90" : "bg-[#00B8A0] hover:bg-[#00B8A0]/90"
                    }`}>
                      {report.reportType === "lost" ? "Help Me!" : "Help This Pet"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom row: floating add button + pagination */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={() => {
              form.reset({ reportType: tab, name: "", type: "Dog", city: "Amman", reporterName: "", reporterPhone: "" });
              setIsModalOpen(true);
            }}
            className={`px-6 py-3 rounded-full font-bold text-sm shadow-md transition-colors text-white ${
              tab === "lost" ? "bg-primary hover:bg-primary/90" : "bg-[#00B8A0] hover:bg-[#00B8A0]/90"
            }`}
          >
            {tab === "lost" ? "Report Lost Pet" : "Report Found Pet"}
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="w-10 h-10 rounded-full bg-primary border border-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Submit a Report</DialogTitle>
            <DialogDescription>
              Provide as many details as possible to help identify the pet.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-bold text-[#1E2A3A] mb-2 block">Report Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-xl flex-1 cursor-pointer">
                    <input type="radio" value="lost" {...form.register("reportType")} className="accent-primary" />
                    <span className="text-sm font-medium">I lost a pet</span>
                  </label>
                  <label className="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-xl flex-1 cursor-pointer">
                    <input type="radio" value="found" {...form.register("reportType")} className="accent-[#00B8A0]" />
                    <span className="text-sm font-medium">I found a pet</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">Pet Name</label>
                <input {...form.register("name")} placeholder="e.g. Buddy" className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                {form.formState.errors.name && (
                  <p className="text-red-500 text-xs">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">Type</label>
                <input {...form.register("type")} placeholder="Dog, Cat..." className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">Breed</label>
                <input {...form.register("breed")} className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">Color</label>
                <input {...form.register("color")} className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              </div>

              <div className="col-span-2 space-y-2">
                <label className="text-sm font-bold">City</label>
                <input {...form.register("city")} className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              </div>

              <div className="col-span-2 space-y-2">
                <label className="text-sm font-bold">Description</label>
                <textarea {...form.register("description")} className="w-full min-h-[80px] bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">Your Name</label>
                <input {...form.register("reporterName")} className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">Your Phone</label>
                <input {...form.register("reporterPhone")} className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full mt-4 bg-primary hover:bg-primary/90 text-white py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
            >
              {createMutation.isPending ? "Submitting..." : "Submit Report"}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

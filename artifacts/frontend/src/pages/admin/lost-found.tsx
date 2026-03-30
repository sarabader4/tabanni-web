import { useState } from "react";
import { AdminLayout } from "./index";
import {
  useListAdminLostFoundReports,
  useApproveLostFoundReport,
  useRejectLostFoundReport,
} from "@workspace/api-client-react";
import { Loader2, CheckCircle2, XCircle, Clock, Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type StatusFilter = "all" | "pending" | "approved" | "rejected" | "resolved";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    pending: { label: "Pending", className: "bg-yellow-100 text-yellow-700", icon: <Clock className="w-3 h-3" /> },
    approved: { label: "Approved", className: "bg-green-100 text-green-700", icon: <CheckCircle2 className="w-3 h-3" /> },
    rejected: { label: "Rejected", className: "bg-red-100 text-red-500", icon: <XCircle className="w-3 h-3" /> },
    resolved: { label: "Resolved", className: "bg-gray-100 text-gray-500", icon: <CheckCircle2 className="w-3 h-3" /> },
  };
  const s = map[status] ?? { label: status, className: "bg-gray-100 text-gray-500", icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${s.className}`}>
      {s.icon} {s.label}
    </span>
  );
}

export default function AdminLostFound() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useListAdminLostFoundReports(
    statusFilter === "all" ? {} : { status: statusFilter }
  );

  const approveMutation = useApproveLostFoundReport();
  const rejectMutation = useRejectLostFoundReport();

  const reports = (data?.reports ?? []).filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.name?.toLowerCase().includes(q) ||
      r.reporterName?.toLowerCase().includes(q) ||
      r.city?.toLowerCase().includes(q) ||
      r.type?.toLowerCase().includes(q)
    );
  });

  const handleApprove = async (id: number) => {
    try {
      await approveMutation.mutateAsync({ id });
      toast({ title: "Report approved" });
      refetch();
    } catch {
      toast({ title: "Failed to approve", variant: "destructive" });
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectMutation.mutateAsync({ id });
      toast({ title: "Report rejected" });
      refetch();
    } catch {
      toast({ title: "Failed to reject", variant: "destructive" });
    }
  };

  const STATUS_TABS: { key: StatusFilter; label: string }[] = [
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
    { key: "resolved", label: "Resolved" },
    { key: "all", label: "All" },
  ];

  return (
    <AdminLayout title="Lost & Found Reports">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {STATUS_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setStatusFilter(t.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === t.key
                    ? "bg-white text-[#1E2A3A] shadow-sm"
                    : "text-gray-400 hover:text-[#1E2A3A]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, city, reporter..."
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 w-72"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <p className="font-bold text-gray-400">No reports found</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Pet</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Reporter</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Location</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Submitted</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => {
                  const isPending = report.status === "pending";
                  const isApproving = approveMutation.isPending;
                  const isRejecting = rejectMutation.isPending;
                  return (
                    <tr key={report.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {report.imageUrls?.[0] ? (
                            <img
                              src={report.imageUrls[0]}
                              alt={report.name}
                              className="w-10 h-10 rounded-xl object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gray-100 shrink-0" />
                          )}
                          <div>
                            <p className="font-semibold text-[#1E2A3A]">{report.name}</p>
                            <span className={`text-xs font-bold ${report.reportType === "lost" ? "text-red-500" : "text-[#00B8A0]"}`}>
                              {report.reportType === "lost" ? "LOST" : "FOUND"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 capitalize">{report.type}</td>
                      <td className="py-3 px-4 text-gray-600">{report.reporterName ?? "—"}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {[report.area, report.city].filter(Boolean).join(", ")}
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-xs">
                        {report.createdAt
                          ? new Date(report.createdAt).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })
                          : "—"}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={report.status} />
                      </td>
                      <td className="py-3 px-4">
                        {isPending ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(report.id)}
                              disabled={isApproving || isRejecting}
                              className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
                            >
                              {isApproving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Approve"}
                            </button>
                            <button
                              onClick={() => handleReject(report.id)}
                              disabled={isApproving || isRejecting}
                              className="px-3 py-1.5 border border-red-200 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                              {isRejecting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Reject"}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

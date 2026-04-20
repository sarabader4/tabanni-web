import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, Loader2, Trash2 } from "lucide-react";
import { AdminLayout } from "./index";
import { useToast } from "@/hooks/use-toast";

interface VolunteerApplication {
  id: number;
  userId: number;
  applicationType: "member" | "volunteer_activity";
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  skills: string;
  motivation: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  updatedAt: string;
  userFullName: string | null;
  userEmail: string | null;
}

function useListVolunteerApplications() {
  return useQuery<VolunteerApplication[]>({
    queryKey: ["/api/admin/volunteer-applications"],
    queryFn: async () => {
      const res = await fetch("/api/admin/volunteer-applications", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch volunteer applications");
      return res.json();
    },
  });
}

function useUpdateVolunteerStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "accepted" | "rejected" }) => {
      const res = await fetch(`/api/admin/volunteer-applications/${id}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/volunteer-applications"] });
    },
  });
}

function useDeleteVolunteerApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/volunteer-applications/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete application");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/volunteer-applications"] });
    },
  });
}

function StatusBadge({ status }: { status: "pending" | "accepted" | "rejected" }) {
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
        <Clock className="w-3 h-3" /> Pending
      </span>
    );
  }
  if (status === "accepted") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        <CheckCircle className="w-3 h-3" /> Accepted
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">
      <XCircle className="w-3 h-3" /> Rejected
    </span>
  );
}

function ApplicationDetailRow({ app }: { app: VolunteerApplication }) {
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();
  const updateStatus = useUpdateVolunteerStatus();
  const deleteApplication = useDeleteVolunteerApplication();

  async function handleStatus(status: "accepted" | "rejected") {
    try {
      await updateStatus.mutateAsync({ id: app.id, status });
      toast({ title: `Application ${status}` });
    } catch {
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  }

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to permanently delete this application? This cannot be undone.")) return;
    try {
      await deleteApplication.mutateAsync(app.id);
      toast({ title: "Application deleted" });
    } catch {
      toast({ title: "Failed to delete application", variant: "destructive" });
    }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });
  }

  return (
    <>
      <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
        <td className="px-5 py-3.5">
          <div>
            <p className="font-semibold text-gray-900 text-sm">{app.name}</p>
            <p className="text-xs text-gray-400">{app.email}</p>
          </div>
        </td>
        <td className="px-5 py-3.5">
          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
            app.applicationType === "member"
              ? "bg-blue-100 text-blue-700"
              : "bg-purple-100 text-purple-700"
          }`}>
            {app.applicationType === "member" ? "Member" : "One-time Activity"}
          </span>
        </td>
        <td className="px-5 py-3.5 text-sm text-gray-600">{app.city}</td>
        <td className="px-5 py-3.5 text-xs text-gray-400">{formatDate(app.createdAt)}</td>
        <td className="px-5 py-3.5">
          <StatusBadge status={app.status} />
        </td>
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-2">
            {app.status === "pending" && (
              <>
                <button
                  onClick={() => handleStatus("accepted")}
                  disabled={updateStatus.isPending}
                  className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {updateStatus.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Accept"}
                </button>
                <button
                  onClick={() => handleStatus("rejected")}
                  disabled={updateStatus.isPending}
                  className="px-3 py-1.5 border border-red-200 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {updateStatus.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Reject"}
                </button>
              </>
            )}
            {app.status === "accepted" && (
              <button
                onClick={handleDelete}
                disabled={deleteApplication.isPending}
                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-red-500 disabled:opacity-50"
                title="Delete application"
              >
                {deleteApplication.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            )}
            <button
              onClick={() => setExpanded(v => !v)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
              title="Toggle details"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-gray-100 bg-gray-50/50">
          <td colSpan={6} className="px-5 py-4">
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-0.5">Phone</p>
                <p className="text-gray-700">{app.phone}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 mb-0.5">Address</p>
                <p className="text-gray-700">{app.address}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold text-gray-400 mb-0.5">Skills</p>
                <p className="text-gray-700">{app.skills}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold text-gray-400 mb-0.5">Why they want to join</p>
                <p className="text-gray-700 leading-relaxed">{app.motivation}</p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminVolunteers() {
  const { data: applications, isLoading } = useListVolunteerApplications();
  const [statusFilter, setStatusFilter] = useState<"" | "pending" | "accepted" | "rejected">("");

  const filtered = (applications ?? []).filter(a => !statusFilter || a.status === statusFilter);

  return (
    <AdminLayout title="Volunteer Applications">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 mr-1">
            <Users className="w-4 h-4 text-gray-400" />
            <p className="text-sm font-semibold text-gray-700">Filter:</p>
          </div>
          {(["", "pending", "accepted", "rejected"] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors capitalize ${
                statusFilter === s ? "bg-[#FA8D29] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s || "All"}
            </button>
          ))}
          <span className="ml-auto text-xs text-gray-400">{filtered.length} application{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-gray-600">No applications found</p>
            <p className="text-sm mt-1">
              {statusFilter ? `No ${statusFilter} applications` : "No volunteer applications yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Applicant</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">City</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(app => (
                  <ApplicationDetailRow key={app.id} app={app} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

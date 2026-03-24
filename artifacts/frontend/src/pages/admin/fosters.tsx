import { useState } from "react";
import { useListFosterRequests, useUpdateFosterRequestStatus } from "@workspace/api-client-react";
import { FileHeart, CheckCircle, XCircle, Clock } from "lucide-react";
import { AdminLayout } from "./index";

export default function AdminFosters() {
  const [status, setStatus] = useState("");
  const { data: requests, refetch } = useListFosterRequests({ status: status || undefined });
  const updateStatus = useUpdateFosterRequestStatus();

  function handleStatus(id: number, newStatus: "approved" | "rejected") {
    updateStatus.mutate({ id, data: { status: newStatus } }, { onSuccess: () => refetch() });
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-JO", { day: "numeric", month: "short", year: "numeric" });
  }

  return (
    <AdminLayout title="Foster Requests">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-200"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Pet</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Requester</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Message</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(requests ?? []).map((req) => (
                <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {req.petImageUrl ? (
                        <img src={req.petImageUrl} alt={req.petName ?? ""} className="w-10 h-10 rounded-xl object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                          <FileHeart className="w-5 h-5 text-teal-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{req.petName ?? `Pet #${req.petId}`}</p>
                        <p className="text-xs text-gray-500">ID #{req.petId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{req.requesterName ?? `User #${req.requesterId}`}</p>
                    <p className="text-xs text-gray-500">ID #{req.requesterId}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 max-w-xs truncate">{req.message ?? "No message"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{formatDate(req.createdAt)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 w-fit ${
                      req.status === "approved" ? "bg-green-100 text-green-700" :
                      req.status === "rejected" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {req.status === "approved" ? <CheckCircle className="w-3.5 h-3.5" /> :
                       req.status === "rejected" ? <XCircle className="w-3.5 h-3.5" /> :
                       <Clock className="w-3.5 h-3.5" />}
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {req.status === "pending" && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStatus(req.id, "approved")}
                          className="px-3 py-1.5 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 text-xs font-medium transition-all"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatus(req.id, "rejected")}
                          className="px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {(requests ?? []).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">No foster requests found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

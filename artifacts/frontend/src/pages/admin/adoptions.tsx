import { useState } from "react";
import { useListAdoptionRequests, useUpdateAdoptionRequestStatus } from "@workspace/api-client-react";
import { Heart, CheckCircle, XCircle, Clock, Eye, X, MapPin } from "lucide-react";
import { AdminLayout } from "./index";

function MessageModal({ message, petName, onClose }: { message: string; petName: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Message — {petName}</h3>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5">
          <p className="text-sm text-gray-600 leading-relaxed">{message || "No message provided."}</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminAdoptions() {
  const [status, setStatus] = useState("");
  const [viewMessage, setViewMessage] = useState<{ text: string; pet: string } | null>(null);
  const { data: requests, refetch } = useListAdoptionRequests({ status: status || undefined });
  const updateStatus = useUpdateAdoptionRequestStatus();

  function handleStatus(id: number, newStatus: "approved" | "rejected") {
    updateStatus.mutate({ id, data: { status: newStatus } }, { onSuccess: () => refetch() });
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });
  }

  return (
    <AdminLayout title="Adoption Requests">
      {viewMessage && (
        <MessageModal message={viewMessage.text} petName={viewMessage.pet} onClose={() => setViewMessage(null)} />
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-gray-700 mr-1">Filter:</p>
          {["", "pending", "approved", "rejected"].map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors capitalize ${status === s ? "bg-[#FA8D29] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {s || "All"}
            </button>
          ))}
          <span className="ml-auto text-xs text-gray-400">{(requests ?? []).length} requests</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Pet</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Requester</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">City</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Message</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(requests ?? []).map((req) => (
                <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {req.petImageUrl ? (
                        <img src={req.petImageUrl} alt={req.petName ?? ""} className="w-10 h-10 rounded-xl object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                          <Heart className="w-5 h-5 text-orange-300" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{req.petName ?? `Pet #${req.petId}`}</p>
                        <p className="text-xs text-gray-400">ID #{req.petId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-gray-900">{req.requesterName ?? `User #${req.requesterId}`}</p>
                    <p className="text-xs text-gray-400">ID #{req.requesterId}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    {req.requesterCity ? (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <MapPin className="w-3 h-3 text-gray-400" /> {req.requesterCity}
                      </div>
                    ) : <span className="text-xs text-gray-400">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-500 max-w-[120px] truncate">{req.message ?? "—"}</p>
                      {req.message && (
                        <button
                          onClick={() => setViewMessage({ text: req.message ?? "", pet: req.petName ?? `Pet #${req.petId}` })}
                          className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-gray-500">{formatDate(req.createdAt)}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      req.status === "approved" ? "bg-green-100 text-green-700" :
                      req.status === "rejected" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {req.status === "approved" ? <CheckCircle className="w-3 h-3" /> :
                       req.status === "rejected" ? <XCircle className="w-3 h-3" /> :
                       <Clock className="w-3 h-3" />}
                      <span className="capitalize">{req.status}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {req.status === "pending" && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStatus(req.id, "approved")}
                          disabled={updateStatus.isPending}
                          className="px-3 py-1.5 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatus(req.id, "rejected")}
                          disabled={updateStatus.isPending}
                          className="px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold transition-colors disabled:opacity-50"
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
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400">No adoption requests found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

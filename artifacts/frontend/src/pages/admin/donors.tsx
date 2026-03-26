import { useState } from "react";
import { useListDonations } from "@workspace/api-client-react";
import { Search, DollarSign, CreditCard, Calendar } from "lucide-react";
import { AdminLayout } from "./index";

const PAYMENT_METHOD_COLORS: Record<string, string> = {
  card: "bg-blue-100 text-blue-700",
  stripe: "bg-purple-100 text-purple-700",
  paypal: "bg-yellow-100 text-yellow-700",
  cash: "bg-green-100 text-green-700",
};

export default function AdminDonors() {
  const [search, setSearch] = useState("");

  const { data: rawDonations } = useListDonations({ limit: 200 });
  const donations = Array.isArray(rawDonations) ? rawDonations : [];

  const filtered = donations.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = (d.donorName ?? "").toLowerCase();
    const method = (d.paymentMethod ?? "").toLowerCase();
    return name.includes(q) || method.includes(q);
  });

  const totalAmount = donations.reduce((sum, d) => sum + parseFloat(d.amount ?? "0"), 0);

  function formatDate(dateStr: string | null | undefined) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });
  }

  return (
    <AdminLayout title="Donors">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total donations</p>
            <p className="text-xl font-bold text-gray-900">${totalAmount.toFixed(0)}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total donors</p>
            <p className="text-xl font-bold text-gray-900">{donations.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Average donation</p>
            <p className="text-xl font-bold text-gray-900">
              ${donations.length > 0 ? (totalAmount / donations.length).toFixed(0) : "0"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or payment method..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>
          <span className="text-xs text-gray-400 ml-4">{filtered.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Donor</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Payment Method</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                        style={{ background: "#FF6B35" }}
                      >
                        {(d.donorName ?? "D").charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-900 text-sm">
                        {d.donorName ?? `Donor #${d.id}`}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-gray-900 text-sm">
                      ${parseFloat(d.amount ?? "0").toFixed(2)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                        PAYMENT_METHOD_COLORS[d.paymentMethod ?? ""] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {d.paymentMethod ?? "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {formatDate(d.createdAt)}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-gray-400 text-sm">
                    No donor records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3.5 border-t border-gray-100">
          <p className="text-xs text-gray-400">Showing {filtered.length} of {donations.length} records</p>
        </div>
      </div>
    </AdminLayout>
  );
}

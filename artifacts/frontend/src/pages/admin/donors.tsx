import { useState } from "react";
import { useListDonations } from "@workspace/api-client-react";
import { Search, DollarSign, CreditCard, Calendar, Package, X, Phone, User } from "lucide-react";
import { AdminLayout } from "./index";
import type { Donation } from "@workspace/api-client-react";

const PAYMENT_METHOD_COLORS: Record<string, string> = {
  card: "bg-blue-100 text-blue-700",
  stripe: "bg-purple-100 text-purple-700",
  paypal: "bg-yellow-100 text-yellow-700",
  cash: "bg-green-100 text-green-700",
};

function DonationDetailModal({ donation, onClose }: { donation: Donation; onClose: () => void }) {
  const isSupply = donation.type === "supplies";

  function formatDate(dateStr: string | null | undefined) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ background: "#FA8D29" }}
          >
            {(donation.donorName ?? "D").charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-base">{donation.donorName}</h2>
            <span
              className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isSupply ? "bg-teal-100 text-teal-700" : "bg-orange-100 text-orange-700"
              }`}
            >
              {isSupply ? "Supplies" : "Monetary"}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {donation.donorPhone && (
            <DetailRow icon={<Phone className="w-4 h-4 text-gray-400" />} label="Phone" value={donation.donorPhone} />
          )}
          <DetailRow
            icon={<Calendar className="w-4 h-4 text-gray-400" />}
            label="Date"
            value={formatDate(donation.createdAt)}
          />
          {isSupply ? (
            <>
              {donation.donationTypeLabel && (
                <DetailRow
                  icon={<Package className="w-4 h-4 text-gray-400" />}
                  label="Supply Type"
                  value={donation.donationTypeLabel}
                />
              )}
              {donation.description && (
                <div className="flex gap-3">
                  <div className="mt-0.5 shrink-0">
                    <Package className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Description</p>
                    <p className="text-sm text-gray-900">{donation.description}</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {donation.amount && (
                <DetailRow
                  icon={<DollarSign className="w-4 h-4 text-gray-400" />}
                  label="Amount"
                  value={`$${parseFloat(donation.amount).toFixed(2)}`}
                />
              )}
              {donation.paymentMethod && (
                <DetailRow
                  icon={<CreditCard className="w-4 h-4 text-gray-400" />}
                  label="Payment Method"
                  value={
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                        PAYMENT_METHOD_COLORS[donation.paymentMethod] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {donation.paymentMethod}
                    </span>
                  }
                />
              )}
              {donation.frequency && (
                <DetailRow
                  icon={<Calendar className="w-4 h-4 text-gray-400" />}
                  label="Frequency"
                  value={donation.frequency === "monthly" ? "Monthly" : "One-time"}
                />
              )}
              {donation.status && (
                <DetailRow
                  icon={<User className="w-4 h-4 text-gray-400" />}
                  label="Status"
                  value={
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                        donation.status === "success"
                          ? "bg-green-100 text-green-700"
                          : donation.status === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {donation.status}
                    </span>
                  }
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="shrink-0">{icon}</div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 w-28 shrink-0">{label}</span>
        <span className="text-sm text-gray-900">{value}</span>
      </div>
    </div>
  );
}

export default function AdminDonors() {
  const [search, setSearch] = useState("");
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);

  const { data: rawDonations } = useListDonations({ limit: 200 });
  const donations = Array.isArray(rawDonations) ? rawDonations : [];

  const filtered = donations.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = (d.donorName ?? "").toLowerCase();
    const method = (d.paymentMethod ?? "").toLowerCase();
    const typeLabel = (d.donationTypeLabel ?? "").toLowerCase();
    return name.includes(q) || method.includes(q) || typeLabel.includes(q);
  });

  const monetaryDonations = donations.filter((d) => d.type === "monetary");
  const totalAmount = monetaryDonations.reduce((sum, d) => sum + parseFloat(d.amount ?? "0"), 0);

  function formatDate(dateStr: string | null | undefined) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });
  }

  return (
    <AdminLayout title="Donors">
      {selectedDonation && (
        <DonationDetailModal donation={selectedDonation} onClose={() => setSelectedDonation(null)} />
      )}

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
              ${monetaryDonations.length > 0 ? (totalAmount / monetaryDonations.length).toFixed(0) : "0"}
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
              placeholder="Search by name, payment method, or supply type..."
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
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Amount / Supply</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Payment Method</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => {
                const isSupply = d.type === "supplies";
                return (
                  <tr
                    key={d.id}
                    className="border-b border-gray-50 hover:bg-orange-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedDonation(d)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                          style={{ background: "#FA8D29" }}
                        >
                          {(d.donorName ?? "D").charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">
                          {d.donorName ?? `Donor #${d.id}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isSupply ? "bg-teal-100 text-teal-700" : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {isSupply ? "Supplies" : "Monetary"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {isSupply ? (
                        <div className="flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-teal-500" />
                          <span className="text-sm text-teal-700 font-medium">
                            {d.donationTypeLabel ?? "Supply donation"}
                          </span>
                        </div>
                      ) : (
                        <span className="font-semibold text-gray-900 text-sm">
                          ${parseFloat(d.amount ?? "0").toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {isSupply ? (
                        <span className="text-xs text-gray-400">—</span>
                      ) : (
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                            PAYMENT_METHOD_COLORS[d.paymentMethod ?? ""] ?? "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {d.paymentMethod ?? "—"}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {formatDate(d.createdAt)}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-400 text-sm">
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

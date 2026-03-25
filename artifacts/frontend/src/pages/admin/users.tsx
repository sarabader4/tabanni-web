import { useState } from "react";
import { useListAdminUsers } from "@workspace/api-client-react";
import { Search, Mail, Phone, MapPin, Calendar, Shield } from "lucide-react";
import { AdminLayout } from "./index";

type TabRole = "all" | "user" | "volunteer" | "admin";

const TABS: { label: string; value: TabRole }[] = [
  { label: "All Users", value: "all" },
  { label: "Adopters", value: "user" },
  { label: "Volunteers", value: "volunteer" },
  { label: "Admins", value: "admin" },
];

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabRole>("all");

  const { data: users } = useListAdminUsers({
    search: search || undefined,
    role: activeTab === "all" ? undefined : activeTab,
    limit: 50,
  });

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });
  }

  const ROLE_COLORS: Record<string, string> = {
    admin: "bg-purple-100 text-purple-700",
    volunteer: "bg-teal-100 text-teal-700",
    user: "bg-gray-100 text-gray-700",
  };

  return (
    <AdminLayout title="Users">
      <div className="flex items-center gap-2 mb-6">
        {TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${activeTab === tab.value ? "bg-[#1E2A3A] text-white" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Contact</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Location</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(users ?? []).map((user) => (
                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.fullName} className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: "#FF6B35" }}>
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{user.fullName}</p>
                        <p className="text-xs text-gray-400">ID #{user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Mail className="w-3 h-3 text-gray-400" /> {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Phone className="w-3 h-3 text-gray-400" /> {user.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    {user.city && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {user.city}{user.country ? `, ${user.country}` : ""}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${ROLE_COLORS[user.role] ?? "bg-gray-100 text-gray-600"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {formatDate(user.createdAt)}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <button className="p-1.5 rounded-lg bg-purple-50 text-purple-400 hover:bg-purple-100 transition-colors" title="View profile">
                        <Shield className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(users ?? []).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3.5 border-t border-gray-100">
          <p className="text-xs text-gray-400">Showing {(users ?? []).length} users</p>
        </div>
      </div>
    </AdminLayout>
  );
}

import { useState } from "react";
import { Link } from "wouter";
import { useListAdminUsers } from "@workspace/api-client-react";
import { Search, Mail, Phone, MapPin, Calendar, Shield, UserX, ChevronDown, ExternalLink, PawPrint } from "lucide-react";
import { AdminLayout } from "./index";

type TabRole = "all" | "adopter" | "volunteer";

const TABS: { label: string; value: TabRole }[] = [
  { label: "All Users", value: "all" },
  { label: "Adopters", value: "adopter" },
  { label: "Volunteers", value: "volunteer" },
];

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  volunteer: "bg-teal-100 text-teal-700",
  user: "bg-gray-100 text-gray-700",
};

interface EnrichedUser {
  id: number;
  fullName: string;
  email: string;
  phone?: string | null;
  country?: string | null;
  city?: string | null;
  avatarUrl?: string | null;
  role: string;
  isActive?: boolean;
  createdAt: string;
  totalAdoptionRequests?: number;
  totalFosterRequests?: number;
  totalPetsOwned?: number;
}

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabRole>("all");
  const [actionMenuId, setActionMenuId] = useState<number | null>(null);

  const roleFilter = activeTab === "volunteer" ? "volunteer" : undefined;

  const { data: rawUsers, refetch } = useListAdminUsers({
    search: search || undefined,
    role: roleFilter,
    limit: 100,
  });

  const users = ((rawUsers ?? []) as EnrichedUser[]).filter((u) => {
    if (activeTab === "all") return true;
    if (activeTab === "volunteer") return u.role === "volunteer";
    if (activeTab === "adopter") return (u.totalAdoptionRequests ?? 0) > 0 || (u.totalFosterRequests ?? 0) > 0;
    return true;
  });

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });
  }

  async function handleToggleAdmin(userId: number, currentRole: string) {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    await fetch(`${base}/api/admin/users/${userId}/role`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    setActionMenuId(null);
    refetch();
  }

  async function handleDeactivate(userId: number) {
    if (!confirm("Deactivate this user? They will lose access to the platform.")) return;
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    await fetch(`${base}/api/admin/users/${userId}/deactivate`, { method: "PUT" });
    setActionMenuId(null);
    refetch();
  }

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
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>
          <span className="text-xs text-gray-400 ml-4">{users.length} users</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Contact</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Location</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Activity</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${user.isActive === false ? "opacity-60" : ""}`}>
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
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-gray-900 text-sm">{user.fullName}</p>
                          {user.isActive === false && (
                            <span className="px-1.5 py-0.5 rounded text-xs bg-red-100 text-red-600 font-medium">Deactivated</span>
                          )}
                        </div>
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
                    {user.city ? (
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {user.city}{user.country ? `, ${user.country}` : ""}
                      </div>
                    ) : <span className="text-xs text-gray-400">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-xs text-gray-600 space-y-0.5">
                      <div className="flex items-center gap-1">
                        <span className="text-orange-500 font-medium">{user.totalAdoptionRequests ?? 0}</span> adoptions
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-teal-500 font-medium">{user.totalFosterRequests ?? 0}</span> fosters
                      </div>
                      <div className="flex items-center gap-1">
                        <PawPrint className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-500 font-medium">{user.totalPetsOwned ?? 0}</span> pets owned
                      </div>
                    </div>
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
                  <td className="px-5 py-3.5 relative">
                    <div className="relative">
                      <button
                        onClick={() => setActionMenuId(actionMenuId === user.id ? null : user.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                      >
                        Actions <ChevronDown className="w-3 h-3" />
                      </button>
                      {actionMenuId === user.id && (
                        <div className="absolute right-0 top-8 z-20 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1">
                          <Link href={`/profile`}>
                            <button
                              onClick={() => setActionMenuId(null)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                              View Profile
                            </button>
                          </Link>
                          <button
                            onClick={() => handleToggleAdmin(user.id, user.role)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Shield className="w-3.5 h-3.5 text-purple-500" />
                            {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                          </button>
                          {user.isActive !== false && (
                            <button
                              onClick={() => handleDeactivate(user.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <UserX className="w-3.5 h-3.5" />
                              Deactivate
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3.5 border-t border-gray-100">
          <p className="text-xs text-gray-400">Showing {users.length} users</p>
        </div>
      </div>
    </AdminLayout>
  );
}

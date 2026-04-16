import { useState } from "react";
import { Bell, PawPrint, Heart, Home, Clock, CheckCircle, RefreshCw, User } from "lucide-react";
import { AdminLayout } from "./index";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface AdminNotification {
  id: number;
  type: string;
  userId: number | null;
  title: string;
  message: string;
  metadata: Record<string, unknown> | null;
  read: boolean;
  createdAt: string;
  userName: string | null;
  userEmail: string | null;
}

interface AdminNotificationsResponse {
  notifications: AdminNotification[];
  total: number;
  page: number;
  limit: number;
}

function useAdminNotifications() {
  return useQuery<AdminNotificationsResponse>({
    queryKey: ["/api/admin/notifications"],
    queryFn: async () => {
      const res = await fetch("/api/admin/notifications?limit=50", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch admin notifications");
      return res.json();
    },
    refetchInterval: 30000,
  });
}

function useMarkAdminNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/notifications/${id}/read`, { method: "PATCH", credentials: "include" });
      if (!res.ok) throw new Error("Failed to mark as read");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications/unread-count"] });
    },
  });
}

function useMarkAllAdminNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/notifications/read-all", { method: "PATCH", credentials: "include" });
      if (!res.ok) throw new Error("Failed to mark all as read");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications/unread-count"] });
    },
  });
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  new_pet: { icon: PawPrint, color: "text-orange-600", bg: "bg-orange-100", label: "New Pet" },
  new_adoption_request: { icon: Heart, color: "text-rose-600", bg: "bg-rose-100", label: "Adoption Request" },
  new_foster_request: { icon: Home, color: "text-teal-600", bg: "bg-teal-100", label: "Foster Request" },
};

function getTypeConfig(type: string) {
  return TYPE_CONFIG[type] ?? { icon: Bell, color: "text-gray-600", bg: "bg-gray-100", label: "Notification" };
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminNotifications() {
  const { data, isLoading, refetch } = useAdminNotifications();
  const markRead = useMarkAdminNotificationRead();
  const markAllRead = useMarkAllAdminNotificationsRead();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const notifications = data?.notifications ?? [];
  const unreadCount = notifications.filter(n => !n.read).length;
  const displayed = filter === "unread" ? notifications.filter(n => !n.read) : notifications;

  return (
    <AdminLayout title="Notifications">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-500" />
              Activity Feed
            </h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-600">
                {unreadCount} unread
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${filter === "all" ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-50"}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${filter === "unread" ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-50"}`}
              >
                Unread
              </button>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
            <button
              onClick={() => refetch()}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Bell className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </p>
            <p className="text-xs mt-1">Activity from pet submissions and requests will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {displayed.map((n) => {
              const cfg = getTypeConfig(n.type);
              const Icon = cfg.icon;
              return (
                <div
                  key={n.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${!n.read ? "bg-orange-50/30" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <p className="font-semibold text-gray-900 text-sm">{n.title}</p>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                              {cfg.label}
                            </span>
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">{n.message}</p>
                          {n.userName && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                              <User className="w-3 h-3" />
                              {n.userName}
                              {n.userEmail && <span className="text-gray-300">·</span>}
                              {n.userEmail && <span>{n.userEmail}</span>}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            {formatDate(n.createdAt)}
                          </div>
                          {!n.read && (
                            <button
                              onClick={() => markRead.mutate(n.id)}
                              disabled={markRead.isPending}
                              className="text-xs text-orange-500 hover:text-orange-700 font-medium transition-colors"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {data && data.total > 0 && (
          <div className="p-3 border-t border-gray-100 text-center text-xs text-gray-400">
            Showing {displayed.length} of {filter === "unread" ? unreadCount : data.total} notifications
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

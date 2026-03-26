import { useState } from "react";
import { Bell, Send, Users, User, Clock, CheckCircle } from "lucide-react";
import { AdminLayout } from "./index";

type NotificationTarget = "all" | "adopters" | "volunteers";

interface NotificationRecord {
  id: number;
  title: string;
  message: string;
  target: NotificationTarget;
  sentAt: string;
  status: "sent" | "pending";
}

const MOCK_NOTIFICATIONS: NotificationRecord[] = [
  {
    id: 1,
    title: "New pets available for adoption",
    message: "We have 5 new pets ready for adoption this week. Come visit us!",
    target: "all",
    sentAt: "2026-03-20T10:30:00Z",
    status: "sent",
  },
  {
    id: 2,
    title: "Volunteer training session",
    message: "Reminder: volunteer training session is scheduled for Saturday at 10am.",
    target: "volunteers",
    sentAt: "2026-03-18T09:00:00Z",
    status: "sent",
  },
  {
    id: 3,
    title: "Follow up on your adoption",
    message: "How is your new pet settling in? We'd love to hear from you.",
    target: "adopters",
    sentAt: "2026-03-15T14:00:00Z",
    status: "sent",
  },
];

const TARGET_LABELS: Record<NotificationTarget, string> = {
  all: "All Users",
  adopters: "Adopters",
  volunteers: "Volunteers",
};

const TARGET_COLORS: Record<NotificationTarget, string> = {
  all: "bg-blue-100 text-blue-700",
  adopters: "bg-orange-100 text-orange-700",
  volunteers: "bg-teal-100 text-teal-700",
};

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>(MOCK_NOTIFICATIONS);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState<NotificationTarget>("all");
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function handleSend() {
    if (!title.trim() || !message.trim()) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 800));
    const newNotification: NotificationRecord = {
      id: Date.now(),
      title: title.trim(),
      message: message.trim(),
      target,
      sentAt: new Date().toISOString(),
      status: "sent",
    };
    setNotifications((prev) => [newNotification, ...prev]);
    setTitle("");
    setMessage("");
    setTarget("all");
    setSending(false);
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 3000);
  }

  return (
    <AdminLayout title="Notifications">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Send className="w-4 h-4 text-orange-500" />
              Send Notification
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Title</label>
                <input
                  type="text"
                  placeholder="Notification title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Message</label>
                <textarea
                  rows={4}
                  placeholder="Write your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Send to</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["all", "adopters", "volunteers"] as NotificationTarget[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTarget(t)}
                      className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        target === t
                          ? "border-[#FF6B35] bg-orange-50 text-[#FF6B35]"
                          : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {t === "all" ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      {TARGET_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSend}
                disabled={sending || !title.trim() || !message.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF6B35] text-white text-sm font-semibold hover:bg-[#e55a27] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sentSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Sent!
                  </>
                ) : sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Notification
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-gray-500" />
                Notification History
              </h2>
              <span className="text-xs text-gray-400">{notifications.length} notifications</span>
            </div>

            <div className="divide-y divide-gray-50">
              {notifications.map((n) => (
                <div key={n.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-semibold text-gray-900 text-sm">{n.title}</p>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${TARGET_COLORS[n.target]}`}
                        >
                          {TARGET_LABELS[n.target]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{n.message}</p>
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {formatDate(n.sentAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium shrink-0">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Sent
                    </div>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="px-5 py-12 text-center text-gray-400 text-sm">
                  No notifications sent yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

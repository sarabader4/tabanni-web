import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, Trash2, Check, Clock, Phone, AtSign, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "./index";

interface ContactMessage {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  message: string;
  read: boolean;
  createdAt: string;
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function fetchMessages(): Promise<ContactMessage[]> {
  const res = await fetch(`${BASE}/api/admin/contact-messages`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

async function markRead(id: number): Promise<ContactMessage> {
  const res = await fetch(`${BASE}/api/admin/contact-messages/${id}/read`, {
    method: "PATCH",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to mark read");
  return res.json();
}

async function deleteMessage(id: number): Promise<void> {
  const res = await fetch(`${BASE}/api/admin/contact-messages/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete");
}

type Filter = "all" | "unread" | "read";

export default function AdminContactMessages() {
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState<number | null>(null);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: messages = [], isLoading, isError } = useQuery({
    queryKey: ["admin-contact-messages"],
    queryFn: fetchMessages,
    retry: 1,
  });

  const markReadMutation = useMutation({
    mutationFn: markRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-contact-messages"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMessage,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-contact-messages"] });
      toast({ title: "Message deleted" });
    },
  });

  const filtered = messages.filter(m => {
    if (filter === "unread") return !m.read;
    if (filter === "read") return m.read;
    return true;
  });

  const unreadCount = messages.filter(m => !m.read).length;

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: `All (${messages.length})` },
    { key: "unread", label: `Unread (${unreadCount})` },
    { key: "read", label: "Read" },
  ];

  return (
    <AdminLayout title="Contact Messages">
      {/* Subtitle */}
      <p className="text-sm text-gray-500 -mt-4 mb-6">
        {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
      </p>

      {/* Filter tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex gap-0 border-b border-gray-100 px-4">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-3.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                filter === tab.key
                  ? "border-[#FA8D29] text-[#FA8D29]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#FA8D29]/20 border-t-[#FA8D29] rounded-full animate-spin" />
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-gray-400">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium text-gray-500">Failed to load messages</p>
            <p className="text-xs mt-1">Check that you are logged in as admin</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium text-gray-500">
              {filter === "all" ? "No messages yet" : `No ${filter} messages`}
            </p>
            <p className="text-xs mt-1">Messages from the contact form will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(msg => (
              <div
                key={msg.id}
                className={`transition-colors ${!msg.read ? "bg-[#FA8D29]/5" : "bg-white"}`}
              >
                {/* Header row */}
                <div
                  className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setExpanded(expanded === msg.id ? null : msg.id);
                    if (!msg.read) markReadMutation.mutate(msg.id);
                  }}
                >
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${!msg.read ? "bg-[#FA8D29]" : "bg-gray-200"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-semibold text-[#333E48] text-sm">{msg.name}</span>
                      {msg.email && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <AtSign className="w-3 h-3" /> {msg.email}
                        </span>
                      )}
                      {msg.phone && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Phone className="w-3 h-3" /> {msg.phone}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{msg.message}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(msg.createdAt).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    {msg.read ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
                        <Check className="w-3 h-3" /> Read
                      </span>
                    ) : (
                      <span className="text-xs bg-[#FA8D29]/10 text-[#FA8D29] px-2.5 py-1 rounded-full font-medium">New</span>
                    )}
                  </div>
                </div>

                {/* Expanded body */}
                {expanded === msg.id && (
                  <div className="px-6 pb-5 space-y-3 bg-gray-50 border-t border-gray-100">
                    <div className="pt-4 bg-white rounded-xl p-4 text-sm text-[#333E48] whitespace-pre-wrap shadow-sm border border-gray-100 mt-3">
                      {msg.message}
                    </div>
                    <div className="flex gap-2 justify-end">
                      {msg.email && (
                        <a
                          href={`mailto:${msg.email}`}
                          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#FA8D29] text-white rounded-lg hover:bg-[#e55a28] transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" /> Reply by Email
                        </a>
                      )}
                      <button
                        onClick={() => deleteMutation.mutate(msg.id)}
                        disabled={deleteMutation.isPending}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

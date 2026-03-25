import { useState } from "react";
import { useListGalleryPosts, useCreateGalleryPost } from "@workspace/api-client-react";
import { Image, Plus, Trash2, Edit2, X, Save } from "lucide-react";
import { AdminLayout } from "./index";

interface GalleryPost {
  id: number;
  title: string;
  content?: string | null;
  imageUrl?: string | null;
  authorId?: number | null;
  authorName?: string | null;
  createdAt: string;
}

function PostModal({
  mode,
  post,
  onClose,
  onSuccess,
}: {
  mode: "add" | "edit";
  post?: GalleryPost;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const createMutation = useCreateGalleryPost();
  const [form, setForm] = useState({
    title: post?.title ?? "",
    content: post?.content ?? "",
    imageUrl: post?.imageUrl ?? "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "add") {
      createMutation.mutate(
        { data: { title: form.title, content: form.content, imageUrl: form.imageUrl, authorId: 1 } },
        { onSuccess: () => { onSuccess(); onClose(); } }
      );
    } else if (post) {
      setSaving(true);
      try {
        const base = import.meta.env.BASE_URL.replace(/\/$/, "");
        const resp = await fetch(`${base}/api/gallery/${post.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: form.title, content: form.content, imageUrl: form.imageUrl }),
        });
        if (resp.ok) { onSuccess(); onClose(); }
      } finally {
        setSaving(false);
      }
    }
  }

  const f = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const isPending = createMutation.isPending || saving;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{mode === "add" ? "Add Gallery Post" : "Edit Gallery Post"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Title *</label>
            <input value={form.title} onChange={f("title")} required className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Image URL</label>
            <input value={form.imageUrl} onChange={f("imageUrl")} placeholder="https://..." className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Content</label>
            <textarea value={form.content} onChange={f("content")} rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none" />
          </div>
          {form.imageUrl && (
            <img
              src={form.imageUrl}
              alt=""
              className="w-full h-32 object-cover rounded-xl"
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          )}
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Cancel</button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 rounded-xl bg-[#FF6B35] text-white text-sm font-semibold hover:bg-[#e55a27] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isPending ? "Saving..." : (mode === "add" ? "Add Post" : "Save Changes")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminGallery() {
  const [modal, setModal] = useState<{ mode: "add" | "edit"; post?: GalleryPost } | null>(null);
  const { data: posts, refetch } = useListGalleryPosts({ limit: 50 });
  const allPosts = Array.isArray(posts) ? posts : [];

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });
  }

  async function handleDelete(id: number, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    await fetch(`${base}/api/gallery/${id}`, { method: "DELETE" });
    refetch();
  }

  return (
    <AdminLayout title="Gallery">
      {modal && (
        <PostModal
          mode={modal.mode}
          post={modal.post}
          onClose={() => setModal(null)}
          onSuccess={() => refetch()}
        />
      )}

      <div className="flex justify-end mb-5">
        <button
          onClick={() => setModal({ mode: "add" })}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF6B35] text-white text-sm font-semibold hover:bg-[#e55a27] transition-colors"
        >
          <Plus className="w-4 h-4" /> Add New Post
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Post</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Author</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allPosts.map((post) => (
                <tr key={post.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {post.imageUrl ? (
                        <img src={post.imageUrl} alt={post.title} className="w-14 h-10 rounded-xl object-cover" />
                      ) : (
                        <div className="w-14 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                          <Image className="w-5 h-5 text-gray-300" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{post.title}</p>
                        {post.content && (
                          <p className="text-xs text-gray-400 max-w-xs truncate">{post.content}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm text-gray-700">{post.authorName ?? `User #${post.authorId}`}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-gray-500">{formatDate(post.createdAt)}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setModal({ mode: "edit", post })}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-400 hover:bg-blue-100 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {allPosts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-gray-400">No gallery posts yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3.5 border-t border-gray-100">
          <p className="text-xs text-gray-400">{allPosts.length} posts total</p>
        </div>
      </div>
    </AdminLayout>
  );
}

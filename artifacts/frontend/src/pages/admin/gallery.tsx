import { useState, useRef } from "react";
import { useListGalleryPosts, useCreateGalleryPost } from "@workspace/api-client-react";
import { Image, Plus, Trash2, Edit2, X, Save, User } from "lucide-react";
import { AdminLayout } from "./index";

interface GalleryPost {
  id: number;
  title: string;
  headline?: string | null;
  ownerName?: string | null;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    ownerName: post?.ownerName ?? "",
    headline: post?.headline ?? "",
    content: post?.content ?? "",
    imageUrl: post?.imageUrl ?? "",
  });
  const [imagePreview, setImagePreview] = useState<string>(post?.imageUrl ?? "");
  const [saving, setSaving] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setImagePreview(dataUrl);
      setForm(prev => ({ ...prev, imageUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      title: form.headline || form.ownerName || "Story",
      headline: form.headline,
      ownerName: form.ownerName,
      content: form.content,
      // In edit mode, always include imageUrl (even empty) so server can clear existing image
      imageUrl: mode === "edit" ? form.imageUrl : (form.imageUrl || undefined),
    };

    if (mode === "add") {
      createMutation.mutate(
        { data: payload },
        { onSuccess: () => { onSuccess(); onClose(); } }
      );
    } else if (post) {
      setSaving(true);
      try {
        const base = import.meta.env.BASE_URL.replace(/\/$/, "");
        const resp = await fetch(`${base}/api/gallery/${post.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{mode === "add" ? "Add Pet Story" : "Edit Pet Story"}</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Owner Name *</label>
            <input
              value={form.ownerName}
              onChange={f("ownerName")}
              required
              placeholder="e.g. Sarah Johnson"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Headline *</label>
            <input
              value={form.headline}
              onChange={f("headline")}
              required
              placeholder="e.g. Max found his forever home!"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Story *</label>
            <textarea
              value={form.content}
              onChange={f("content")}
              required
              rows={6}
              placeholder="Share the full story..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Image</label>
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-orange-300 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-lg mx-auto"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <div className="py-4">
                  <Image className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Click to upload an image</p>
                  <p className="text-xs text-gray-300 mt-1">PNG, JPG, GIF up to 50MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {imagePreview && (
              <button
                type="button"
                onClick={() => { setImagePreview(""); setForm(prev => ({ ...prev, imageUrl: "" })); }}
                className="mt-2 text-xs text-red-400 hover:text-red-600"
              >
                Remove image
              </button>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Cancel</button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 rounded-xl bg-[#FF6B35] text-white text-sm font-semibold hover:bg-[#e55a27] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isPending ? "Saving..." : (mode === "add" ? "Add Story" : "Save Changes")}
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

  async function handleDelete(id: number, headline: string) {
    if (!confirm(`Delete "${headline}"?`)) return;
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    await fetch(`${base}/api/gallery/${id}`, { method: "DELETE" });
    refetch();
  }

  return (
    <AdminLayout title="Pet Stories / Gallery">
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
          <Plus className="w-4 h-4" /> Add New Story
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Story</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Owner</th>
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
                        <img src={post.imageUrl} alt={post.headline ?? post.title} className="w-14 h-10 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-14 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <Image className="w-5 h-5 text-gray-300" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{post.headline || post.title}</p>
                        {post.content && (
                          <p className="text-xs text-gray-400 max-w-xs truncate">{post.content}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <p className="text-sm text-gray-700">{post.ownerName || post.authorName || "—"}</p>
                    </div>
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
                        onClick={() => handleDelete(post.id, post.headline || post.title)}
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
                  <td colSpan={4} className="px-5 py-12 text-center text-gray-400">No pet stories yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3.5 border-t border-gray-100">
          <p className="text-xs text-gray-400">{allPosts.length} stories total</p>
        </div>
      </div>
    </AdminLayout>
  );
}

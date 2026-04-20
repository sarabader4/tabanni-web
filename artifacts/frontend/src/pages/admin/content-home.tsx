import { useState, useEffect } from "react";
import { AdminLayout } from "./index";
import { Save, RefreshCw } from "lucide-react";

const FIELDS = [
  { key: "home.hero.headline", label: "Hero Headline", multiline: false, hint: "Main headline text on the home page banner" },
  { key: "home.hero.subtitle", label: "Hero Subtitle", multiline: true, hint: "Supporting description below the headline" },
  { key: "home.cta.adopt", label: "Adopt Button Text", multiline: false, hint: "Text shown on the primary adoption call-to-action button" },
  { key: "home.cta.donate", label: "Donate Button Text", multiline: false, hint: "Text shown on the donation call-to-action button" },
];

export default function AdminContentHome() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");

  useEffect(() => {
    fetch(`${base}/api/admin/content`)
      .then(r => r.json())
      .then((data: Record<string, string>) => {
        setValues(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave(key: string) {
    setSaving(prev => ({ ...prev, [key]: true }));
    await fetch(`${base}/api/admin/content/${encodeURIComponent(key)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: values[key] ?? "" }),
    });
    setSaving(prev => ({ ...prev, [key]: false }));
    setSaved(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setSaved(prev => ({ ...prev, [key]: false })), 2000);
  }

  return (
    <AdminLayout title="Home Page Content">
      <div className="max-w-2xl space-y-5">
        {loading ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm py-8">
            <RefreshCw className="w-4 h-4 animate-spin" /> Loading content...
          </div>
        ) : (
          FIELDS.map(field => (
            <div key={field.key} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-1">{field.label}</label>
              <p className="text-xs text-gray-400 mb-3">{field.hint}</p>
              {field.multiline ? (
                <textarea
                  rows={3}
                  value={values[field.key] ?? ""}
                  onChange={e => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none"
                />
              ) : (
                <input
                  type="text"
                  value={values[field.key] ?? ""}
                  onChange={e => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
              )}
              <div className="flex justify-end mt-3">
                <button
                  onClick={() => handleSave(field.key)}
                  disabled={saving[field.key]}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FA8D29] text-white text-sm font-semibold hover:bg-[#e55a27] transition-colors disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saved[field.key] ? "Saved!" : saving[field.key] ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}

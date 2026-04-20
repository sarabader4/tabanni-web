import { useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { useAuth, apiFetch, AuthUser } from "@/contexts/auth-context";
import { useTranslation } from "react-i18next";

export default function CityGateModal() {
  const { t } = useTranslation();
  const { dismissCityGate, refreshUser } = useAuth();
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!city.trim()) {
      setError(t("cityGate.cityRequired"));
      return;
    }
    setIsSaving(true);
    try {
      await apiFetch<AuthUser>("/api/users/me", {
        method: "PUT",
        body: JSON.stringify({ city: city.trim() }),
      });
      await refreshUser();
      dismissCityGate();
    } catch {
      setError(t("cityGate.saveFailed"));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-[#FA8D29]/10 p-3 rounded-full mb-3">
            <MapPin className="w-7 h-7 text-[#FA8D29]" />
          </div>
          <h2 className="text-xl font-bold text-[#333E48] text-center">{t("cityGate.title")}</h2>
          <p className="text-sm text-[#333E48]/60 text-center mt-2">{t("cityGate.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#333E48] mb-1.5">
              {t("cityGate.cityLabel")} <span className="text-[#FA8D29]">*</span>
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={t("cityGate.placeholder")}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-[#333E48] placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#FA8D29]/30 focus:border-[#FA8D29] transition-all"
              autoFocus
              disabled={isSaving}
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-2.5 bg-[#FA8D29] text-white font-bold text-sm rounded-lg hover:bg-[#FA8D29]/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("cityGate.saving")}
              </>
            ) : (
              t("cityGate.save")
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

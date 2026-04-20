import { useState } from "react";
import { Sparkles, Search, Loader2, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import type { Pet } from "@workspace/api-client-react";
import { PetCard } from "@/components/pet-card";

interface MatchedPet {
  pet: Pet;
  matchReason: string;
}

interface RecommendResult {
  matches: MatchedPet[];
  explanation: string;
}

interface AIPetMatchWidgetProps {
  mode?: "search" | "similar";
  currentPet?: {
    id: number;
    name: string;
    type: string;
    breed?: string | null;
    size?: string | null;
    city?: string;
    ageMonths?: number;
  };
}

export default function AIPetMatchWidget({ mode = "search", currentPet }: AIPetMatchWidgetProps) {
  const { t } = useTranslation();
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isSimilarMode = mode === "similar" && currentPet;

  async function handleFind(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (loading) return;
    if (!isSimilarMode && !description.trim()) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const body = isSimilarMode
        ? {
            preferences: `Similar to ${currentPet.name}: a ${currentPet.type}${currentPet.breed ? ` (${currentPet.breed})` : ""}${currentPet.size ? `, ${currentPet.size} size` : ""}${currentPet.city ? ` in ${currentPet.city}` : ""}`,
            excludePetId: currentPet.id,
          }
        : {
            preferences: description.trim(),
          };

      const response = await fetch(`${import.meta.env.BASE_URL}api/ai/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Request failed");

      const data = await response.json() as RecommendResult;
      setResult(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (isSimilarMode) {
    return (
      <div className="bg-card border border-border rounded-3xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-lg">You Might Also Like</h3>
        </div>
        <p className="text-muted-foreground text-sm mb-4">
          Let our AI suggest pets similar to {currentPet.name}.
        </p>

        {!result && !loading && (
          <button
            onClick={() => handleFind()}
            data-testid="ai-similar-btn"
            className="w-full py-3 rounded-2xl text-white font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90"
            style={{ background: "#FA8D29" }}
          >
            <Sparkles className="w-4 h-4" />
            Find Similar Pets
          </button>
        )}

        {loading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        )}

        {error && <p className="text-destructive text-sm text-center">{error}</p>}

        {result && (
          <div className="space-y-3">
            {result.explanation && (
              <p className="text-muted-foreground text-xs italic">{result.explanation}</p>
            )}
            {result.matches.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center">No similar pets found right now.</p>
            ) : (
              result.matches.slice(0, 3).map(({ pet, matchReason }) => (
                <Link key={pet.id} href={`/pets/${pet.id}`} className="group flex gap-3 items-center p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-border">
                    <img
                      src={pet.imageUrls?.[0] || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200"}
                      alt={pet.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-display font-bold text-sm">{pet.name}</p>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-muted-foreground text-xs mb-1">
                      {[pet.type, pet.breed, pet.city].filter(Boolean).join(" · ")}
                    </p>
                    <div className="flex items-start gap-1 bg-primary/5 rounded-lg px-2 py-1">
                      <Sparkles className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                      <p className="text-primary text-xs leading-snug line-clamp-2 font-medium">{matchReason}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl overflow-hidden" style={{ background: "#333E48" }}>
        <div className="p-8 md:p-12">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-4"
              style={{ background: "rgba(250,141,41,0.2)", color: "#FA8D29" }}
            >
              <Sparkles className="w-4 h-4" />
              {t("home.aiWidgetBadge")}
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              {t("home.aiWidgetTitle")}
            </h2>
            <p className="text-white/70">
              {t("home.aiWidgetDesc")}
            </p>
          </div>

          <form onSubmit={handleFind} className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-5 sm:items-stretch">
              <div className="flex-1 flex flex-col">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. I live in an apartment in Amman, work from home, and want a calm, affectionate cat..."
                  rows={3}
                  className="flex-1 w-full rounded-2xl px-5 py-4 text-sm text-[#333E48] placeholder-gray-400 outline-none resize-none focus:ring-2 focus:ring-orange-400/50"
                  style={{ background: "#FFFAF7" }}
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !description.trim()}
                data-testid="ai-match-btn"
                className="sm:w-44 w-full px-6 rounded-2xl text-white font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "#FA8D29" }}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Find My Match
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <p className="text-center text-red-300 text-sm mt-4">{error}</p>
          )}

          {result && (
            <div className="mt-10">
              {result.explanation && (
                <p className="text-center text-white/70 text-sm mb-6 italic">{result.explanation}</p>
              )}
              {result.matches.length === 0 ? (
                <p className="text-center text-white/60">No matches found right now. Check back soon as new pets arrive daily!</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {result.matches.map(({ pet, matchReason }) => (
                    <div key={pet.id} className="flex flex-col gap-2">
                      <PetCard pet={pet} />
                      <div className="flex items-start gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(255,107,53,0.15)" }}>
                        <Sparkles className="w-3.5 h-3.5 text-orange-400 mt-0.5 shrink-0" />
                        <p className="text-white/85 text-xs leading-relaxed font-medium">{matchReason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

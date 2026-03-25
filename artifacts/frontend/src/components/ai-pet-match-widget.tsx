import { useState } from "react";
import { Sparkles, Search, Loader2, ArrowRight, Heart } from "lucide-react";
import { Link } from "wouter";

interface MatchedPet {
  pet: {
    id: number;
    name: string;
    type: string;
    breed: string | null;
    ageMonths: number;
    gender: string;
    size: string | null;
    imageUrls: string[] | null;
    purpose: string;
    city: string;
  };
  matchReason: string;
}

interface RecommendResult {
  matches: MatchedPet[];
  explanation: string;
}

export default function AIPetMatchWidget() {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFind(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim() || loading) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.BASE_URL}api/ai/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description.trim() }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const data = await response.json() as RecommendResult;
      setResult(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const purposeLabel = (purpose: string) => {
    if (purpose === "foster") return "Foster";
    if (purpose === "adopt") return "Adopt";
    return "Adopt / Foster";
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl overflow-hidden" style={{ background: "linear-gradient(135deg, #1E2A3A 0%, #2d3f55 100%)" }}>
        <div className="p-8 md:p-12">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-4" style={{ background: "rgba(255,107,53,0.2)", color: "#FF6B35" }}>
              <Sparkles className="w-4 h-4" />
              AI-Powered Matching
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Find Your Perfect Companion
            </h2>
            <p className="text-white/70">
              Tell us about your lifestyle and what you're looking for — our AI will match you with the perfect pet from our shelter.
            </p>
          </div>

          <form onSubmit={handleFind} className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. I live in an apartment in Amman, work from home, and want a calm, affectionate cat..."
                  rows={3}
                  className="w-full rounded-2xl px-5 py-4 text-sm text-[#1E2A3A] placeholder-gray-400 outline-none resize-none focus:ring-2 focus:ring-orange-400/50"
                  style={{ background: "#FFF8F3" }}
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !description.trim()}
                data-testid="ai-match-btn"
                className="sm:w-auto w-full px-6 py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed sm:self-end"
                style={{ background: "#FF6B35" }}
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
                    <Link key={pet.id} href={`/adopt/${pet.id}`} className="group block">
                      <div className="rounded-2xl overflow-hidden border border-white/10 hover:border-orange-400/50 transition-all hover:-translate-y-1" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <div className="relative aspect-video overflow-hidden">
                          <img
                            src={pet.imageUrls?.[0] || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600"}
                            alt={pet.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 right-3">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ background: "#FF6B35" }}>
                              {purposeLabel(pet.purpose)}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-white font-display font-bold text-lg">{pet.name}</h3>
                            <Heart className="w-4 h-4 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <p className="text-white/50 text-xs mb-3">
                            {[pet.type, pet.breed, pet.ageMonths ? `${Math.floor(pet.ageMonths / 12)}y ${pet.ageMonths % 12}m` : null, pet.size, pet.city].filter(Boolean).join(" · ")}
                          </p>
                          <div className="flex items-start gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-orange-400 mt-0.5 shrink-0" />
                            <p className="text-white/70 text-xs leading-relaxed">{matchReason}</p>
                          </div>
                          <div className="mt-4 flex items-center gap-1 text-orange-400 text-xs font-bold group-hover:gap-2 transition-all">
                            View Profile <ArrowRight className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    </Link>
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

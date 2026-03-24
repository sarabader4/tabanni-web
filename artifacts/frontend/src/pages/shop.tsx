import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export default function Shop() {
  return (
    <div className="min-h-screen bg-background">
      {/* Discover Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-[#1E2A3A] text-center mb-10">
          Discover Something You'll Love!
        </h1>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {/* Mlabbas Shop */}
          <div className="relative rounded-2xl overflow-hidden" style={{ backgroundColor: "#00B8A0", minHeight: "200px" }}>
            <div className="p-8 relative z-10">
              <h2 className="font-display font-bold text-2xl text-white mb-1">Mlabbas Shop</h2>
              <p className="text-white/80 text-sm mb-8">Support Through Shopping ✨</p>
              <button className="flex items-center gap-2 bg-white text-[#1E2A3A] px-5 py-2.5 rounded-full font-bold text-sm hover:bg-white/90 transition-colors">
                Go to shop <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <img
              src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&q=80"
              alt="Dog"
              className="absolute right-0 bottom-0 w-40 h-40 object-cover object-top opacity-80"
              style={{ borderTopLeftRadius: "1rem" }}
            />
          </div>

          {/* PetsJo Shop */}
          <div className="relative rounded-2xl overflow-hidden" style={{ backgroundColor: "#FF6B35", minHeight: "200px" }}>
            <div className="p-8 relative z-10">
              <h2 className="font-display font-bold text-2xl text-white mb-1">PetsJo Shop</h2>
              <p className="text-white/80 text-sm mb-8">Your cart makes tails wag 🐾</p>
              <button className="flex items-center gap-2 bg-white text-[#1E2A3A] px-5 py-2.5 rounded-full font-bold text-sm hover:bg-white/90 transition-colors">
                Go to shop <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <img
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80"
              alt="Pets"
              className="absolute right-0 bottom-0 w-44 h-36 object-cover opacity-80"
              style={{ borderTopLeftRadius: "1rem" }}
            />
          </div>
        </div>

        {/* Lend Us Your Support */}
        <h2 className="font-display text-2xl md:text-3xl font-bold text-[#1E2A3A] text-center mb-6">
          Lend Us Your Support
        </h2>

        <div className="space-y-4">
          {/* Donate card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-6">
            <div className="w-24 h-20 rounded-xl overflow-hidden flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=200&q=80"
                alt="Cat"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#1E2A3A] text-sm leading-relaxed mb-1">
                Your support whether supplies or a small donation can make a big difference in a pet's life.
              </p>
              <Link href="/donate" className="inline-flex items-center gap-1.5 text-primary font-bold text-sm hover:gap-2.5 transition-all">
                Help Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="hidden sm:block opacity-10">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400">
                <path d="M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z"/>
              </svg>
            </div>
          </div>

          {/* Foster card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-6">
            <div className="flex-1 min-w-0">
              <p className="text-[#1E2A3A] text-sm leading-relaxed mb-1">
                Open your home for a little while, and you could change a pet's whole world with a bit of safety, warmth, and love.
              </p>
              <Link href="/foster" className="inline-flex items-center gap-1.5 text-[#00B8A0] font-bold text-sm hover:gap-2.5 transition-all">
                Become a Foster <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="w-24 h-20 rounded-xl overflow-hidden flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=200&q=80"
                alt="Dog"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Shop() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-[#333E48] text-center mb-10">
          {t("shop.title")}
        </h1>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="relative rounded-2xl overflow-hidden" style={{ backgroundColor: "#3D937F", minHeight: "200px" }}>
            <div className="p-8 relative z-10">
              <h2 className="font-display font-bold text-2xl text-white mb-1">{t("shop.mlabbasShop")}</h2>
              <p className="text-white/80 text-sm mb-8">{t("shop.mlabbasSub")}</p>
              <button className="flex items-center gap-2 bg-white text-[#333E48] px-5 py-2.5 rounded-full font-bold text-sm hover:bg-white/90 transition-colors">
                {t("shop.goToShop")} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
            <img
              src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&q=80"
              alt="Dog"
              className="absolute end-0 bottom-0 w-40 h-40 object-cover object-top opacity-80"
              style={{ borderTopLeftRadius: "1rem" }}
            />
          </div>

          <div className="relative rounded-2xl overflow-hidden" style={{ backgroundColor: "#FA8D29", minHeight: "200px" }}>
            <div className="p-8 relative z-10">
              <h2 className="font-display font-bold text-2xl text-white mb-1">{t("shop.petsjoShop")}</h2>
              <p className="text-white/80 text-sm mb-8">{t("shop.petsjoSub")}</p>
              <button className="flex items-center gap-2 bg-white text-[#333E48] px-5 py-2.5 rounded-full font-bold text-sm hover:bg-white/90 transition-colors">
                {t("shop.goToShop")} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
            <img
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80"
              alt="Pets"
              className="absolute end-0 bottom-0 w-44 h-36 object-cover opacity-80"
              style={{ borderTopLeftRadius: "1rem" }}
            />
          </div>
        </div>

        <h2 className="font-display text-2xl md:text-3xl font-bold text-[#333E48] text-center mb-6">
          {t("shop.lendSupport")}
        </h2>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-6">
            <div className="w-24 h-20 rounded-xl overflow-hidden flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=200&q=80"
                alt="Cat"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#333E48] text-sm leading-relaxed mb-1">
                {t("shop.donateDesc")}
              </p>
              <Link href="/donate" className="inline-flex items-center gap-1.5 text-primary font-bold text-sm hover:gap-2.5 transition-all">
                {t("shop.helpNow")} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </Link>
            </div>
            <div className="hidden sm:block opacity-10">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400">
                <path d="M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z"/>
              </svg>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-6">
            <div className="flex-1 min-w-0">
              <p className="text-[#333E48] text-sm leading-relaxed mb-1">
                {t("shop.fosterDesc")}
              </p>
              <Link href="/foster" className="inline-flex items-center gap-1.5 text-[#3D937F] font-bold text-sm hover:gap-2.5 transition-all">
                {t("shop.becomeAFoster")} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
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

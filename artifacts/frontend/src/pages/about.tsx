import { Shield, Users, Eye, Target } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo-head";

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="bg-[#FFFAF7] min-h-screen">
      <SEOHead
        title="Who We Are — Tabanni, Jordan's Animal Welfare Platform"
        description="Learn about Tabanni's mission to rescue, rehabilitate, and rehome stray and abandoned animals across Jordan. Registered as JSAP since 2021."
        path="/about"
      />

      {/* Page Header */}
      <div id="who-we-are" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-2 scroll-mt-20">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-[#FA8D29]">
          {t("nav.aboutWhoWeAre")}
        </h1>
        <div className="w-14 h-1 bg-[#FA8D29] rounded-full mt-3" />
      </div>

      {/* ── Section 1: About Us intro card ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-10">
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            {/* Logo + JSAP block */}
            <div className="flex-shrink-0 flex flex-col items-center gap-3 sm:w-40">
              <img
                src={`${import.meta.env.BASE_URL}images/tabanni-logo.png`}
                alt="tabanni"
                className="w-32 h-auto"
              />
              <div className="w-full border border-[#3D937F]/30 rounded-2xl px-4 py-3 text-center">
                <p className="font-bold text-[#3D937F] text-sm leading-tight">{t("about.jsapBadge")}</p>
                <p className="text-[10px] text-gray-500 leading-snug mt-0.5">{t("about.jsapName")}</p>
              </div>
            </div>

            {/* Text block */}
            <div className="flex-1">
              <h2 className="font-display text-xl font-bold text-[#333E48] mb-4">{t("about.badge")}</h2>
              <p className="text-[15px] text-gray-600 leading-[1.85] max-w-prose">
                {t("about.orgIntro")}
              </p>
              <div className="grid sm:grid-cols-2 gap-5 mt-7">
                <div className="flex gap-3 items-start">
                  <div className="w-10 h-10 rounded-xl bg-[#FA8D29]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Shield className="w-5 h-5 text-[#FA8D29]" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#333E48]">{t("about.vettedPets")}</p>
                    <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{t("about.vettedPetsDesc")}</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-10 h-10 rounded-xl bg-[#3D937F]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Users className="w-5 h-5 text-[#3D937F]" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#333E48]">{t("about.communityDriven")}</p>
                    <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{t("about.communityDrivenDesc")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2: Mission & Vision ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pb-20">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-10">
          <h2 className="font-display text-xl font-bold text-[#333E48] mb-6">
            {t("about.mvTitle")}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Vision card */}
            <div className="rounded-2xl border border-gray-100 bg-[#FFFAF7] p-6 hover:shadow-sm transition-shadow duration-300">
              <div className="border-s-4 border-[#3D937F] ps-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-[#3D937F]/10 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-[#3D937F]" />
                  </div>
                  <h3 className="font-display font-bold text-sm text-[#3D937F]">{t("about.visionLabel")}</h3>
                </div>
                <p className="text-sm text-gray-600 leading-[1.8]">{t("about.visionText")}</p>
              </div>
            </div>
            {/* Mission card */}
            <div className="rounded-2xl border border-gray-100 bg-[#FFFAF7] p-6 hover:shadow-sm transition-shadow duration-300">
              <div className="border-s-4 border-[#FA8D29] ps-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FA8D29]/10 flex items-center justify-center">
                    <Target className="w-4 h-4 text-[#FA8D29]" />
                  </div>
                  <h3 className="font-display font-bold text-sm text-[#FA8D29]">{t("about.missionLabel")}</h3>
                </div>
                <p className="text-sm text-gray-600 leading-[1.8]">{t("about.missionText")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo-head";
const sustainabilityImg = "https://res.cloudinary.com/dmu2itokb/image/upload/v1781445611/1781444790371-6e5f9d0d-64f0-4132-9585-4bf20cdcd1f6_1.jpg_omswwv.jpg";
export default function Sustainability() {
  const { t } = useTranslation();

  return (
    <div className="bg-[#FFFAF7] min-h-screen">
      <SEOHead
        title="Sustainability — tabanni's SDG & ESG Alignment"
        description="Learn how tabanni aligns with global sustainability goals through environmental, social, and governance frameworks in Jordan."
        path="/sustainability"
      />

      {/* Page Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-2">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-[#FA8D29]">
          {t("nav.aboutSustainability")}
        </h1>
        <div className="w-14 h-1 bg-[#FA8D29] rounded-full mt-3" />
      </div>

      {/* Centered Image */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pb-20">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-14 flex justify-center">
          <img
            src={sustainabilityImg}
            alt="tabanni Local Action, Global Goals: SDG & ESG Alignment"
            className="w-full max-w-sm md:max-w-md lg:max-w-lg h-auto object-contain"
          />
        </div>
      </section>
    </div>
  );
}

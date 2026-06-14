import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo-head";

interface Partner {
  name: string;
  tagline?: string;
  logo?: string;
}

const PARTNERS: Partner[] = [
  { name: "Mlabbas", logo: "https://res.cloudinary.com/dmu2itokb/image/upload/v1781444774/WhatsApp_Image_2026-04-28_at_9.24.13_PM_fkgo5f.jpg" },
  { name: "RAW PET NUTRITION", tagline: "Drive nutrition, boost health", logo: "https://res.cloudinary.com/dmu2itokb/image/upload/v1781444774/WhatsApp_Image_2026-04-28_at_9.24.14_PM_c6mhmi.jpg" },
  { name: "The Pampered Pet" },
  { name: "SOI PET RESORT" },
  { name: "Canaan Animal Volunteers" },
  { name: "mau", logo: "https://res.cloudinary.com/dmu2itokb/image/upload/v1781444774/WhatsApp_Image_2026-04-28_at_9.24.14_PM_1_wll6rg.jpg" },
  { name: "Animal Lovers JO" },
];

export default function Network() {
  const { t } = useTranslation();

  return (
    <div className="bg-[#FFFAF7] min-h-screen">
      <SEOHead
        title="Our Network - tabanni Partner Organizations"
        description="tabanni partners with organizations that share our commitment to animal welfare, responsible adoption, and ethical treatment of animals in Jordan."
        path="/network"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-2">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-[#FA8D29]">
          {t("nav.aboutNetwork")}
        </h1>
        <div className="w-14 h-1 bg-[#FA8D29] rounded-full mt-3" />
      </div>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-10">
          <p className="text-[15px] text-gray-600 leading-[1.85]">
            {t("network.partnerText")}
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-20">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-10">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-[#FA8D29] text-center tracking-wide uppercase mb-10">
            {t("network.sectionTitle")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {PARTNERS.map((partner) => (
              <div
                key={partner.name}
                className="flex flex-col items-center justify-center bg-[#FFFAF7] border border-gray-100 rounded-2xl px-4 py-6 hover:border-[#FA8D29]/40 hover:shadow-sm transition-all duration-200 text-center"
              >
                {partner.logo ? (
                  <img src={partner.logo} alt={partner.name} className="w-16 h-16 rounded-full object-cover mb-3 border-2 border-gray-100" loading="lazy" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[#3D937F]/10 border-2 border-[#3D937F]/20 flex items-center justify-center mb-3">
                    <span className="text-[#3D937F] font-bold text-lg select-none">{partner.name.charAt(0)}</span>
                  </div>
                )}
                <p className="font-semibold text-[#333E48] text-xs leading-snug">{partner.name}</p>
                {partner.tagline && (
                  <p className="text-[10px] text-gray-400 mt-1 leading-tight">{partner.tagline}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

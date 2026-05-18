import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo-head";
import { Heart, ExternalLink } from "lucide-react";

const GOFUNDME_URL = "https://www.gofundme.com/f/join-us-in-providing-hope-for-stray-animals?fbclid=PAZXh0bgNhZW0CMTEAAaaIjwVLajXehZGMZYeI93-1859fUubu1OcTx9TZDBCQph1DuHvDmp415P4_aem_EZOBxxbJGqbylWA4DxpkEA";

export default function DonatePage() {
  const { t } = useTranslation();

  return (
    <>
      <SEOHead title={t("donate.title")} />
      <div className="min-h-screen bg-[#FFFAF7] flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full text-center space-y-8">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-10 h-10 text-primary" fill="currentColor" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="font-display font-bold text-3xl text-[#333E48]">
              {t("donate.title")}
            </h1>
            <p className="text-gray-500 text-base leading-relaxed">
              {t("donate.goFundMeDesc")}
            </p>
          </div>

          <a
            href={GOFUNDME_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-primary/90 active:scale-95 transition-all"
          >
            <Heart className="w-5 h-5" fill="currentColor" />
            {t("donate.donateOnGoFundMe")}
            <ExternalLink className="w-4 h-4 opacity-75" />
          </a>

          <p className="text-xs text-gray-400">
            {t("donate.goFundMeSubtitle")}
          </p>
        </div>
      </div>
    </>
  );
}

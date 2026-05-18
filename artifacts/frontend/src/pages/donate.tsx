import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo-head";
import { Heart, ExternalLink, Shield, Plus, Home, PawPrint } from "lucide-react";

const GOFUNDME_URL =
  "https://www.gofundme.com/f/join-us-in-providing-hope-for-stray-animals?fbclid=PAZXh0bgNhZW0CMTEAAaaIjwVLajXehZGMZYeI93-1859fUubu1OcTx9TZDBCQph1DuHvDmp415P4_aem_EZOBxxbJGqbylWA4DxpkEA";

function DotGrid({ className }: { className?: string }) {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" className={className}>
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2, 3].map((col) => (
          <circle
            key={`${row}-${col}`}
            cx={6 + col * 20}
            cy={6 + row * 20}
            r="2.5"
            fill="#FA8D29"
            opacity="0.25"
          />
        ))
      )}
    </svg>
  );
}

export default function DonatePage() {
  const { t } = useTranslation();

  const steps = [
    {
      icon: Heart,
      label: t("donate.rescue"),
      desc: t("donate.rescueDesc"),
      color: "#FA8D29",
      bg: "#FFF3E8",
    },
    {
      icon: Plus,
      label: t("donate.rehabilitate"),
      desc: t("donate.rehabilitateDesc"),
      color: "#3D937F",
      bg: "#E8F4F1",
    },
    {
      icon: Home,
      label: t("donate.rehome"),
      desc: t("donate.rehomeDesc"),
      color: "#FA8D29",
      bg: "#FFF3E8",
    },
    {
      icon: PawPrint,
      label: t("donate.repeat"),
      desc: t("donate.repeatDesc"),
      color: "#3D937F",
      bg: "#E8F4F1",
    },
  ];

  return (
    <>
      <SEOHead title={t("donate.title")} />
      <div className="min-h-screen bg-[#FFFAF7] relative overflow-hidden">

        {/* Decorative: top-left paw */}
        <div className="absolute top-10 left-10 pointer-events-none select-none opacity-[0.18]">
          <PawPrint className="w-24 h-24 text-primary" strokeWidth={1.5} />
        </div>
        {/* Decorative: top-right paw */}
        <div className="absolute top-10 right-10 pointer-events-none select-none opacity-[0.18]">
          <PawPrint className="w-24 h-24 text-primary" strokeWidth={1.5} />
        </div>
        {/* Decorative: left heart */}
        <div className="absolute top-[38%] left-10 pointer-events-none select-none opacity-[0.13]">
          <Heart className="w-14 h-14 text-primary" strokeWidth={1.5} />
        </div>
        {/* Decorative: right heart */}
        <div className="absolute top-[38%] right-10 pointer-events-none select-none opacity-[0.13]">
          <Heart className="w-14 h-14 text-primary" strokeWidth={1.5} />
        </div>
        {/* Decorative: bottom-left dots */}
        <div className="absolute bottom-24 left-8 pointer-events-none select-none">
          <DotGrid />
        </div>
        {/* Decorative: bottom-right dots */}
        <div className="absolute bottom-24 right-8 pointer-events-none select-none">
          <DotGrid />
        </div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center px-4 pt-16 pb-24">

          {/* Heart icon in dashed ring with sparkle rays */}
          <div className="relative mb-8">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background: "#FFF3E8",
                border: "2px dashed #FA8D29",
                borderOpacity: 0.5,
              }}
            >
              <Heart className="w-10 h-10 text-primary" fill="currentColor" />
            </div>
            {/* Sparkle lines top-right */}
            <svg
              className="absolute -top-3 -right-1 pointer-events-none"
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
            >
              <line x1="14" y1="0" x2="14" y2="10" stroke="#FA8D29" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
              <line x1="20" y1="4" x2="16" y2="10" stroke="#FA8D29" strokeWidth="2" strokeLinecap="round" opacity="0.45" />
              <line x1="26" y1="10" x2="19" y2="12" stroke="#FA8D29" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="font-display font-bold text-4xl md:text-5xl text-[#333E48] text-center mb-3 leading-tight">
            {t("donate.title")}
          </h1>

          {/* Orange underline accent */}
          <div className="flex items-center gap-1 mb-7">
            <div className="h-[3px] w-10 rounded-full bg-primary" />
            <div className="h-[3px] w-2.5 rounded-full bg-primary" />
          </div>

          {/* Description */}
          <p className="text-[#666] text-center max-w-md mb-3 leading-relaxed text-[15px]">
            {t("donate.heroDesc1")}{" "}
            <span className="text-primary font-semibold">{t("donate.heroDesc1Highlight")}</span>
          </p>
          <p className="text-[#666] text-center max-w-md mb-10 leading-relaxed text-[15px]">
            {t("donate.heroDesc2")}
          </p>

          {/* CTA Button */}
          <a
            href={GOFUNDME_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-4 px-7 py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-md hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all mb-5"
          >
            <span className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5" fill="currentColor" />
            </span>
            {t("donate.donateOnGoFundMe")}
            <ExternalLink className="w-5 h-5 opacity-80 flex-shrink-0" />
          </a>

          {/* Trust badge */}
          <div className="flex items-center gap-2 text-[#aaa] text-sm mb-14">
            <Shield className="w-4 h-4" />
            <span>{t("donate.secure")}</span>
          </div>

          {/* Divider */}
          <div className="w-full max-w-3xl border-t border-gray-200 mb-10" />

          {/* 4-step cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-3xl">
            {steps.map((step, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: step.bg }}
                >
                  <step.icon className="w-5 h-5" style={{ color: step.color }} />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-[#333E48] text-sm leading-tight">
                    {step.label}
                  </div>
                  <div className="text-[#999] text-xs leading-snug mt-0.5">
                    {step.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}

import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo-head";

interface Program {
  titleKey: string;
  descKey: string;
  image: string;
  imageAlt: string;
}

const BASE = import.meta.env.BASE_URL;

const PROGRAMS: Program[] = [
  {
    titleKey: "programs.rescueTitle",
    descKey: "programs.rescueDesc",
    image: `${BASE}images/hero-dog.png`,
    imageAlt: "Rescue program",
  },
  {
    titleKey: "programs.adoptionTitle",
    descKey: "programs.adoptionDesc",
    image: `${BASE}images/hero-pets.png`,
    imageAlt: "Adoption program",
  },
  {
    titleKey: "programs.rightsTitle",
    descKey: "programs.rightsDesc",
    image: `${BASE}images/about-team.png`,
    imageAlt: "Animal rights advocacy",
  },
  {
    titleKey: "programs.strayCareTitle",
    descKey: "programs.strayCareDesc",
    image: `${BASE}images/foster-hero.png`,
    imageAlt: "Stray care program",
  },
  {
    titleKey: "programs.strayCommunitiesTitle",
    descKey: "programs.strayCommunitiesDesc",
    image: `${BASE}images/hero-dog.png`,
    imageAlt: "Stray dog communities",
  },
  {
    titleKey: "programs.rehabTitle",
    descKey: "programs.rehabDesc",
    image: `${BASE}images/hero-pets.png`,
    imageAlt: "Rehabilitation program",
  },
  {
    titleKey: "programs.basboosTtitle",
    descKey: "programs.basboosDes",
    image: `${BASE}images/foster-hero.png`,
    imageAlt: "The Basboos Project",
  },
];

function ProgramCard({ program, index }: { program: Program; index: number }) {
  const { t } = useTranslation();
  const imageRight = index % 2 !== 0;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div
        className={`flex flex-col ${
          imageRight ? "md:flex-row-reverse" : "md:flex-row"
        } items-stretch`}
      >
        {/* Image */}
        <div className="w-full md:w-2/5 flex-shrink-0">
          <img
            src={program.image}
            alt={program.imageAlt}
            className="w-full h-60 md:h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-8 md:p-10 flex flex-col justify-center">
          <h3 className="font-display text-xl md:text-2xl font-bold text-[#FA8D29] mb-3 leading-snug">
            {t(program.titleKey)}
          </h3>
          <div className="w-10 h-1 bg-[#3D937F] rounded-full mb-5" />
          <p className="text-[15px] text-gray-600 leading-[1.85]">
            {t(program.descKey)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Programs() {
  const { t } = useTranslation();

  return (
    <div className="bg-[#FFFAF7] min-h-screen">
      <SEOHead
        title="Our Programs — How Tabanni Helps Animals in Jordan"
        description="Explore Tabanni's programs: rescue operations, adoption, stray care, animal rights advocacy, rehab, and more across Jordan."
        path="/programs"
      />

      {/* Page Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-2">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-[#FA8D29]">
          {t("programs.pageTitle")}
        </h1>
        <div className="w-14 h-1 bg-[#FA8D29] rounded-full mt-3" />
      </div>

      {/* Intro */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <p className="text-[15px] text-gray-600 leading-[1.85] max-w-2xl">
          {t("programs.intro")}
        </p>
      </div>

      {/* Program Cards */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pb-20 flex flex-col gap-6">
        {PROGRAMS.map((program, index) => (
          <ProgramCard key={program.titleKey} program={program} index={index} />
        ))}
      </div>
    </div>
  );
}

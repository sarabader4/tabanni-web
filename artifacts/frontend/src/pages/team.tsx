import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { SEOHead } from "@/components/seo-head";
import teamPhotoImg from "@assets/image_1776785909352.png";

interface TeamMember {
  name: string;
  role: string;
  initials: string;
  accentColor: string;
}

function AvatarCircle({ initials, accentColor }: { initials: string; accentColor: string }) {
  return (
    <div
      className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 border-4 text-white font-bold text-xl select-none"
      style={{ backgroundColor: accentColor, borderColor: accentColor + "55" }}
    >
      {initials}
    </div>
  );
}

function MemberCard({ member }: { member: TeamMember }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col items-center">
      <AvatarCircle initials={member.initials} accentColor={member.accentColor} />
      <h3 className="font-display font-bold text-[#333E48] text-sm leading-snug mb-1">
        {member.name}
      </h3>
      <p className="text-xs text-[#3D937F] font-medium leading-snug">{member.role}</p>
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="text-center mb-8">
      <h2 className="font-display text-2xl md:text-3xl font-bold text-[#FA8D29]">{title}</h2>
    </div>
  );
}

export default function Team() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  const boardMembers: TeamMember[] = [
    { name: "Dina Nimry", role: t("team.roleDinaNimry"), initials: "DN", accentColor: "#3D937F" },
    { name: "Dima Al Masri", role: t("team.roleDimaAlMasri"), initials: "DM", accentColor: "#FA8D29" },
    { name: "Gida Hamam", role: t("team.roleGidaHamam"), initials: "GH", accentColor: "#3D937F" },
  ];

  const operationsMembers: TeamMember[] = [
    { name: "Bader Albeetar", role: t("team.roleBaderAlbeetar"), initials: "BA", accentColor: "#FA8D29" },
    { name: "Ahmad Shalaldeh", role: t("team.roleAhmadShalaldeh"), initials: "AS", accentColor: "#3D937F" },
  ];

  const socialMembers: TeamMember[] = [
    { name: "Jude Abdelhadi", role: t("team.roleJudeAbdelhadi"), initials: "JA", accentColor: "#3D937F" },
    { name: "Sereen Aqilan", role: t("team.roleSereenAqilan"), initials: "SA", accentColor: "#FA8D29" },
  ];

  return (
    <div className="bg-[#FFFAF7] min-h-screen">
      <SEOHead
        title="Our Team — The People Behind Tabanni"
        description="Meet the dedicated board members, operations staff, and volunteers who make Tabanni's mission possible every day in Jordan."
        path="/team"
      />

      {/* Page Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-2">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-[#FA8D29]">
          {t("nav.aboutTeam")}
        </h1>
        <div className="w-14 h-1 bg-[#FA8D29] rounded-full mt-3" />
      </div>

      {/* ── Top Section: Team Photo + Intro ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-10">
          {/* Team photo */}
          <div className="rounded-2xl overflow-hidden mb-8">
            <img
              src={teamPhotoImg}
              alt="Tabanni team"
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </div>
          {/* Intro paragraph */}
          <p className="text-[15px] text-gray-600 leading-[1.85] text-center max-w-2xl mx-auto">
            {t("team.intro")}
          </p>
        </div>
      </section>

      {/* ── Board Section ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-10">
          <SectionHeading title={t("team.boardTitle")} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {boardMembers.map((m) => (
              <MemberCard key={m.name} member={m} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Operations Section ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-10">
          <SectionHeading title={t("team.operationsTitle")} />
          <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {operationsMembers.map((m) => (
              <MemberCard key={m.name} member={m} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Social Media Section ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-10">
          <SectionHeading title={t("team.socialTitle")} />
          <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {socialMembers.map((m) => (
              <MemberCard key={m.name} member={m} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA: Together for Them ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-20">
        <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl border border-gray-100 p-12 md:p-16 text-center">
          {/* Turquoise top accent strip */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#3D937F] via-[#65c4af] to-[#3D937F]" />
          {/* Subtle layered background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/60 to-[#3D937F]/5 pointer-events-none" />
          {/* Decorative blurred circle */}
          <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-[#3D937F]/8 blur-3xl pointer-events-none" />
          <div className="absolute -top-10 -left-10 w-36 h-36 rounded-full bg-[#3D937F]/6 blur-2xl pointer-events-none" />

          {/* Content */}
          <div className="relative">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#3D937F] mb-5">
              {t("team.ctaTitle")}
            </h2>
            <p className="text-[15px] text-gray-500 leading-[1.9] max-w-xl mx-auto mb-10">
              {t("team.ctaText")}
            </p>
            <button
              onClick={() => setLocation("/profile?tab=Volunteer")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#3D937F] to-[#5bb3a0] hover:from-[#347f6c] hover:to-[#4ea596] text-white font-semibold text-[15px] px-10 py-4 rounded-full shadow-lg shadow-[#3D937F]/25 hover:shadow-xl hover:shadow-[#3D937F]/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              {t("team.ctaButton")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

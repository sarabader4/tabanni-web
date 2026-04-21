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
        <div className="bg-[#FEF7EE] rounded-3xl border border-[#FA8D29]/20 shadow-sm p-10 md:p-14 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[#FA8D29] mb-4">
            {t("team.ctaTitle")}
          </h2>
          <p className="text-[15px] text-gray-600 leading-[1.85] max-w-xl mx-auto mb-8">
            {t("team.ctaText")}
          </p>
          <button
            onClick={() => setLocation("/profile?tab=Volunteer")}
            className="inline-block bg-[#FA8D29] hover:bg-[#e07a20] active:bg-[#c96d1b] text-white font-semibold text-sm px-8 py-3.5 rounded-full transition-colors duration-200 shadow-sm"
          >
            {t("team.ctaButton")}
          </button>
        </div>
      </section>
    </div>
  );
}

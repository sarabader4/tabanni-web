import { Heart, Shield, Users, Mail, MapPin, Phone, Eye, Target, Home, GitBranch, TrendingUp, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo-head";

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="bg-[#FFFAF7] min-h-screen">
      <SEOHead
        title="About Us — Building a Compassionate Jordan for Animals"
        description="Learn about Tabanni's mission to rescue, rehabilitate, and rehome stray and abandoned animals across Jordan. Meet our team and discover our programs."
        path="/about"
      />

      {/* Page Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-2">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-[#FA8D29]">
          {t("about.badge")}
        </h1>
        <div className="w-14 h-1 bg-[#FA8D29] rounded-full mt-3" />
      </div>

      {/* ── Section 1: About Us intro card ── */}
      <section id="who-we-are" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 scroll-mt-24">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-10">
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            {/* Logo block */}
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
            {/* Text */}
            <div className="flex-1">
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
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-[#333E48] mb-2">
          {t("about.mvTitle")}
        </h2>
        <div className="w-10 h-1 bg-[#3D937F] rounded-full mb-8" />
        <div className="grid md:grid-cols-2 gap-6">
          {/* Vision card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex gap-5 items-start group hover:shadow-md transition-shadow duration-300">
            <div className="border-s-4 border-[#3D937F] ps-5 flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl bg-[#3D937F]/10 flex items-center justify-center">
                  <Eye className="w-4 h-4 text-[#3D937F]" />
                </div>
                <h3 className="font-display font-bold text-base text-[#3D937F]">{t("about.visionLabel")}</h3>
              </div>
              <p className="text-sm text-gray-600 leading-[1.8]">{t("about.visionText")}</p>
            </div>
          </div>
          {/* Mission card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex gap-5 items-start group hover:shadow-md transition-shadow duration-300">
            <div className="border-s-4 border-[#FA8D29] ps-5 flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl bg-[#FA8D29]/10 flex items-center justify-center">
                  <Target className="w-4 h-4 text-[#FA8D29]" />
                </div>
                <h3 className="font-display font-bold text-base text-[#FA8D29]">{t("about.missionLabel")}</h3>
              </div>
              <p className="text-sm text-gray-600 leading-[1.8]">{t("about.missionText")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3: 4 Feature Cards ── */}
      <section id="programs" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 scroll-mt-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* What We Do */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-[#3D937F]/10 flex items-center justify-center mx-auto mb-5">
              <Home className="w-7 h-7 text-[#3D937F]" />
            </div>
            <h3 className="font-display font-bold text-sm text-[#3D937F] text-center mb-4">{t("about.whatWeDoTitle")}</h3>
            <div className="space-y-3 flex-1">
              {[
                { bold: t("about.whatWeDoBullet1"), desc: t("about.whatWeDoBullet1Desc") },
                { bold: t("about.whatWeDoBullet2"), desc: t("about.whatWeDoBullet2Desc") },
                { bold: t("about.whatWeDoBullet3"), desc: t("about.whatWeDoBullet3Desc") },
              ].map((item, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#3D937F] mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-[#333E48] leading-snug">{item.bold}</p>
                    <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How We Operate */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-[#FA8D29]/10 flex items-center justify-center mx-auto mb-5">
              <GitBranch className="w-7 h-7 text-[#FA8D29]" />
            </div>
            <h3 className="font-display font-bold text-sm text-[#FA8D29] text-center mb-4">{t("about.howWeOperateTitle")}</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-3">{t("about.howWeOperateIntro")}</p>
            <div className="space-y-2 flex-1">
              {[
                { bold: t("about.howWeOperateBold1"), text: t("about.howWeOperateText1") },
                { bold: t("about.howWeOperateBold2"), text: t("about.howWeOperateText2") },
                { bold: t("about.howWeOperateBold3"), text: t("about.howWeOperateText3") },
              ].map((item, i) => (
                <p key={i} className="text-xs text-gray-600 leading-relaxed">
                  <span className="font-semibold text-[#333E48]">{item.bold}</span>{" "}{item.text}
                </p>
              ))}
            </div>
          </div>

          {/* Our Impact */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-[#3D937F]/10 flex items-center justify-center mx-auto mb-5">
              <TrendingUp className="w-7 h-7 text-[#3D937F]" />
            </div>
            <h3 className="font-display font-bold text-sm text-[#3D937F] text-center mb-4">{t("about.ourImpactTitle")}</h3>
            <p className="text-xs text-gray-500 mb-3">{t("about.ourImpactIntro")}</p>
            <div className="space-y-2.5 flex-1">
              {[
                t("about.ourImpactBullet1"),
                t("about.ourImpactBullet2"),
                t("about.ourImpactBullet3"),
                t("about.ourImpactBullet4"),
              ].map((item, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3D937F] mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-600 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Join Our Cause */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-[#FA8D29]/10 flex items-center justify-center mx-auto mb-5">
              <Heart className="w-7 h-7 text-[#FA8D29]" />
            </div>
            <h3 className="font-display font-bold text-sm text-[#FA8D29] text-center mb-4">{t("about.joinTitle")}</h3>
            <p className="text-xs text-gray-500 mb-3">{t("about.joinIntro")}</p>
            <p className="text-xs font-semibold text-[#333E48] mb-2">{t("about.joinYouCan")}</p>
            <div className="space-y-2 flex-1">
              {[
                { bold: t("about.joinBold1"), text: t("about.joinText1") },
                { bold: t("about.joinBold2"), text: t("about.joinText2") },
                { bold: t("about.joinBold3"), text: t("about.joinText3") },
                { bold: t("about.joinBold4"), text: t("about.joinText4") },
              ].map((item, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FA8D29] mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-600 leading-relaxed">
                    <span className="font-semibold text-[#333E48]">{item.bold}</span>{" "}{item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 4: Team ── */}
      <section id="team" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 scroll-mt-24">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-[#333E48] mb-1">{t("about.ourTeam")}</h2>
        <div className="w-10 h-1 bg-[#FA8D29] rounded-full mb-3" />
        <p className="text-sm text-gray-500 mb-8 max-w-lg">{t("about.ourTeamSub")}</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { name: "Lara Nassar", role: t("about.teamRoleFounder"), emoji: "👩‍💼", color: "#FA8D29" },
            { name: "Ahmad Khalil", role: t("about.teamRoleVet"), emoji: "🐾", color: "#3D937F" },
            { name: "Sara Haddad", role: t("about.teamRoleFoster"), emoji: "🏠", color: "#FA8D29" },
          ].map((member) => (
            <div
              key={member.name}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl"
                style={{ background: member.color + "18" }}
              >
                {member.emoji}
              </div>
              <h3 className="font-display font-bold text-base text-[#333E48] mb-1">{member.name}</h3>
              <p className="text-xs text-gray-500">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 5: Network + Sustainability ── */}
      <section id="network" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 scroll-mt-24">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Network */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <h2 className="font-display text-xl font-bold text-[#333E48] mb-1">{t("about.network")}</h2>
            <div className="w-8 h-0.5 bg-[#3D937F] rounded-full mb-4" />
            <p className="text-sm text-gray-500 leading-relaxed mb-6">{t("about.networkDesc")}</p>
            <div className="grid grid-cols-3 gap-3">
              {["Amman", "Irbid", "Zarqa", "Aqaba", "Madaba", "Jerash"].map((city) => (
                <div
                  key={city}
                  className="bg-[#3D937F]/5 rounded-xl py-2.5 px-3 text-center text-xs font-semibold text-[#3D937F]"
                >
                  {city}
                </div>
              ))}
            </div>
          </div>
          {/* Sustainability */}
          <div id="sustainability" className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <h2 className="font-display text-xl font-bold text-[#333E48] mb-1">{t("about.sustainability")}</h2>
            <div className="w-8 h-0.5 bg-[#FA8D29] rounded-full mb-4" />
            <p className="text-sm text-gray-500 leading-relaxed mb-6">{t("about.sustainabilityDesc")}</p>
            <div className="space-y-4">
              {[t("about.sus1"), t("about.sus2"), t("about.sus3")].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#FA8D29]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-[#FA8D29]" />
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 6: FAQs ── */}
      <section id="faqs" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 scroll-mt-24">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-[#333E48] mb-1">{t("about.faqs")}</h2>
        <div className="w-10 h-1 bg-[#3D937F] rounded-full mb-3" />
        <p className="text-sm text-gray-500 mb-8 max-w-lg">{t("about.faqsSub")}</p>
        <div className="max-w-3xl space-y-4">
          {[
            { q: t("about.faq1Q"), a: t("about.faq1A") },
            { q: t("about.faq2Q"), a: t("about.faq2A") },
            { q: t("about.faq3Q"), a: t("about.faq3A") },
            { q: t("about.faq4Q"), a: t("about.faq4A") },
          ].map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
            >
              <h3 className="font-semibold text-sm text-[#333E48] mb-2 leading-snug">{faq.q}</h3>
              <p className="text-sm text-gray-500 leading-[1.8]">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 7: Contact ── */}
      <section className="mt-20 bg-white border-y border-gray-100 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[#333E48] mb-2">{t("about.getInTouch")}</h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto">{t("about.getInTouchSub")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Mail, label: t("about.emailUs"), value: "hello@tabanni.jo", bg: "bg-blue-50", color: "text-blue-500" },
              { icon: MapPin, label: t("about.location"), value: t("about.locationValue"), bg: "bg-[#3D937F]/5", color: "text-[#3D937F]" },
              { icon: Phone, label: t("about.callUs"), value: "+962 79 000 0000", bg: "bg-[#FA8D29]/5", color: "text-[#FA8D29]" },
            ].map((item, i) => (
              <div key={i} className="rounded-3xl border border-gray-100 bg-[#FFFAF7] p-7 text-center hover:shadow-md transition-shadow duration-300">
                <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm text-[#333E48] mb-1">{item.label}</h3>
                <p className="text-xs text-gray-500">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* bottom padding */}
      <div className="h-16" />
    </div>
  );
}

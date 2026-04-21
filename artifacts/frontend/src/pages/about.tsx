import { Heart, Shield, Users, Mail, MapPin, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo-head";

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-20 pb-20">
      <SEOHead
        title="About Us — Building a Compassionate Jordan for Animals"
        description="Learn about Tabanni's mission to rescue, rehabilitate, and rehome stray and abandoned animals across Jordan. Meet our team and discover our programs."
        path="/about"
      />
      {/* Header */}
      <section className="bg-foreground text-white py-20 lg:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/80 font-bold text-sm mb-6 border border-white/20">
            {t("about.badge")}
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
            {t("about.title")}
          </h1>
        </div>
        
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-[120px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary rounded-full blur-[120px] opacity-20 -translate-x-1/2 translate-y-1/2"></div>
      </section>

      {/* Mission Section */}
      <section id="who-we-are" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl">
            <img 
              src={`${import.meta.env.BASE_URL}images/about-team.png`} 
              alt="Community" 
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 border-4 border-white/20 rounded-3xl z-10 pointer-events-none"></div>
          </div>
          
          <div className="space-y-8">
            <h2 className="font-display text-4xl font-bold text-foreground">{t("about.whyTitle")}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("about.whyDesc1")}
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("about.whyDesc2")}
            </p>
            <div className="grid sm:grid-cols-2 gap-6 pt-4">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-1">{t("about.vettedPets")}</h4>
                  <p className="text-sm text-muted-foreground">{t("about.vettedPetsDesc")}</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-1">{t("about.communityDriven")}</h4>
                  <p className="text-sm text-muted-foreground">{t("about.communityDrivenDesc")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">{t("about.ourTeam")}</h2>
          <p className="text-muted-foreground">{t("about.ourTeamSub")}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: "Lara Nassar", role: t("about.teamRoleFounder"), emoji: "👩‍💼" },
            { name: "Ahmad Khalil", role: t("about.teamRoleVet"), emoji: "🐾" },
            { name: "Sara Haddad", role: t("about.teamRoleFoster"), emoji: "🏠" },
          ].map((member) => (
            <div key={member.name} className="bg-white rounded-3xl border border-border shadow-sm p-8 text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-2xl">
                {member.emoji}
              </div>
              <h3 className="font-display font-bold text-lg text-foreground mb-1">{member.name}</h3>
              <p className="text-sm text-muted-foreground">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">{t("about.programs")}</h2>
          <p className="text-muted-foreground">{t("about.programsSub")}</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            { icon: Heart, title: t("about.programAdopt"), desc: t("about.programAdoptDesc"), color: "#FA8D29" },
            { icon: Shield, title: t("about.programFoster"), desc: t("about.programFosterDesc"), color: "#3D937F" },
            { icon: Users, title: t("about.programEducation"), desc: t("about.programEducationDesc"), color: "#FA8D29" },
            { icon: Heart, title: t("about.programVet"), desc: t("about.programVetDesc"), color: "#3D937F" },
          ].map((prog, i) => (
            <div key={i} className="p-8 rounded-3xl border border-border bg-white hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: prog.color + "20" }}>
                <prog.icon className="w-6 h-6" style={{ color: prog.color }} />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground mb-2">{prog.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{prog.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Network + Sustainability Section */}
      <section id="network" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">{t("about.network")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">{t("about.networkDesc")}</p>
            <div className="grid grid-cols-3 gap-4">
              {["Amman", "Irbid", "Zarqa", "Aqaba", "Madaba", "Jerash"].map((city) => (
                <div key={city} className="bg-white rounded-2xl border border-border py-3 px-4 text-center text-sm font-medium text-foreground shadow-sm">
                  {city}
                </div>
              ))}
            </div>
          </div>
          <div id="sustainability">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">{t("about.sustainability")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">{t("about.sustainabilityDesc")}</p>
            <div className="space-y-3">
              {[t("about.sus1"), t("about.sus2"), t("about.sus3")].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-secondary" />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faqs" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">{t("about.faqs")}</h2>
          <p className="text-muted-foreground">{t("about.faqsSub")}</p>
        </div>
        <div className="max-w-3xl mx-auto space-y-4">
          {[
            { q: t("about.faq1Q"), a: t("about.faq1A") },
            { q: t("about.faq2Q"), a: t("about.faq2A") },
            { q: t("about.faq3Q"), a: t("about.faq3A") },
            { q: t("about.faq4Q"), a: t("about.faq4A") },
          ].map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl border border-border p-6 shadow-sm">
              <h3 className="font-bold text-foreground mb-2">{faq.q}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-muted/30 py-20 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">{t("about.getInTouch")}</h2>
            <p className="text-muted-foreground">{t("about.getInTouchSub")}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-3xl border border-border text-center shadow-sm">
              <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">{t("about.emailUs")}</h3>
              <p className="text-muted-foreground text-sm">hello@tabanni.jo</p>
            </div>
            <div className="bg-card p-8 rounded-3xl border border-border text-center shadow-sm">
              <div className="w-14 h-14 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">{t("about.location")}</h3>
              <p className="text-muted-foreground text-sm">{t("about.locationValue")}</p>
            </div>
            <div className="bg-card p-8 rounded-3xl border border-border text-center shadow-sm">
              <div className="w-14 h-14 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">{t("about.callUs")}</h3>
              <p className="text-muted-foreground text-sm">+962 79 000 0000</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Users, Heart, Shield, Search, Sparkles } from "lucide-react";
import { useGetFeaturedPets, useGetAdminStats, useListGalleryPosts } from "@workspace/api-client-react";
import { PetCard } from "@/components/pet-card";
import AIPetMatchWidget from "@/components/ai-pet-match-widget";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();
  const { data: featuredPets, isLoading: petsLoading } = useGetFeaturedPets();
  const { data: stats } = useGetAdminStats();
  const { data: gallery } = useListGalleryPosts({ limit: 3 });

  return (
    <div className="flex flex-col gap-24 pb-10 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-10 pb-20 lg:pt-20 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm mb-6">
                {t("home.badge")}
              </div>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] text-foreground mb-6">
                {t("home.heroTitle1")} <br/>
                <span className="text-gradient">{t("home.heroTitle2")}</span> <br/>
                {t("home.heroTitle3")}
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
                {t("home.heroSubtitle")}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/about"
                  className="flex items-center gap-3 pl-6 pr-2 py-2 bg-primary text-white rounded-full font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1 transition-all"
                >
                  About Us
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20">
                    <Users className="w-5 h-5" />
                  </span>
                </Link>
                <Link
                  href="/login"
                  className="flex items-center gap-3 pl-6 pr-2 py-2 bg-secondary text-white rounded-full font-bold shadow-lg shadow-secondary/25 hover:shadow-xl hover:shadow-secondary/40 hover:-translate-y-1 transition-all"
                >
                  Log in
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20">
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl"
            >
              <img 
                src={`${import.meta.env.BASE_URL}images/hero-pets.png`} 
                alt="Happy pets" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Pets */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              {t("home.findMatch")}
            </h2>
            <p className="text-muted-foreground">{t("home.findMatchSub")}</p>
          </div>
          <Link href="/adopt" className="hidden md:flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
            {t("home.seeAllPets")} <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {petsLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-[400px] bg-muted/50 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredPets?.slice(0, 4).map(pet => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        )}
      </section>

      {/* AI Pet Match */}
      <section id="ai-pet-match">
        <AIPetMatchWidget />
      </section>

      {/* Stats Section */}
      <section className="bg-foreground py-20 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { label: t("home.petsAvailable"), value: stats?.totalPets || "200+" },
              { label: t("home.happyHomes"), value: stats?.adoptionsCount || "150+" },
              { label: t("home.fosterFamilies"), value: "80+" },
              { label: t("home.activeMembers"), value: stats?.totalUsers || "500+" }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl md:text-5xl font-display font-bold text-white mb-2">{stat.value}</div>
                <div className="text-white/60 font-medium text-sm md:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("home.howItWorks")}
          </h2>
          <p className="text-muted-foreground">{t("home.howItWorksSub")}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Search, title: t("home.findAPet"), desc: t("home.findAPetDesc") },
            { icon: Heart, title: t("home.apply"), desc: t("home.applyDesc") },
            { icon: Shield, title: t("home.bringHome"), desc: t("home.bringHomeDesc") },
          ].map((step, i) => (
            <div key={i} className="bg-card p-8 rounded-3xl border border-border text-center hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <step.icon className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-xl mb-3">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Success Stories Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              {t("home.successStories")}
            </h2>
            <p className="text-muted-foreground">{t("home.successStoriesSub")}</p>
          </div>
          <Link href="/gallery" className="hidden md:flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
            {t("home.viewGallery")} <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {gallery?.map(post => (
            <Link key={post.id} href={`/gallery`} className="group block">
              <div className="relative aspect-video rounded-3xl overflow-hidden mb-4">
                <img 
                  src={post.imageUrl || "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&q=80"} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="font-display font-bold text-xl mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
              <p className="text-muted-foreground text-sm line-clamp-2">{post.content}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Users, Heart, Shield, Search, Star } from "lucide-react";
import { useGetFeaturedPets, useGetAdminStats, useListGalleryPosts } from "@workspace/api-client-react";
import { PetCard } from "@/components/pet-card";
import AIPetMatchWidget from "@/components/ai-pet-match-widget";
import { useTranslation } from "react-i18next";
import { useFavourites } from "@/hooks/use-favourites";
import dogImg from "@assets/dog_1776713054942.png";

export default function Home() {
  const { t } = useTranslation();
  const { isFavourited, isPendingFor, toggleFavourite } = useFavourites();
  const { data: featuredPets, isLoading: petsLoading } = useGetFeaturedPets();
  const { data: stats } = useGetAdminStats();
  const { data: gallery } = useListGalleryPosts({ limit: 3 });

  return (
    <div className="flex flex-col gap-24 pb-10 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-8 pb-12 lg:pt-16 lg:pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left: Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block px-4 py-1.5 rounded-full bg-foreground text-white font-bold text-xs mb-6">
                {t("home.badge")}
              </div>
              <h1 className="font-display font-black leading-[1.05] mb-5 uppercase" style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)" }}>
                <span style={{ color: "#3D937F" }}>{t("home.heroTitle1")}</span><br />
                <span style={{ color: "#FA8D29" }}>{t("home.heroTitle2")}</span><br />
                <span style={{ color: "#3D937F" }}>{t("home.heroTitle3")}</span>
              </h1>
              <p className="text-base text-muted-foreground mb-8 max-w-md leading-relaxed">
                {t("home.heroSubtitle")}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/about"
                  className="flex items-center gap-3 pl-6 pr-2 py-2 bg-primary text-white rounded-full font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  {t("home.aboutUs", { defaultValue: "About Us" })}
                  <span className="flex items-center justify-center w-9 h-9 rounded-full bg-white/20">
                    <Users className="w-4 h-4" />
                  </span>
                </Link>
                <Link
                  href="/login"
                  className="flex items-center gap-3 pl-6 pr-2 py-2 bg-foreground text-white rounded-full font-bold hover:bg-foreground/90 hover:-translate-y-0.5 transition-all"
                >
                  {t("nav.login")}
                  <span className="flex items-center justify-center w-9 h-9 rounded-full bg-white/20">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </div>
            </motion.div>

            {/* Right: Dog image with floating elements */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative flex justify-center items-end"
            >
              <div className="relative">
                <img
                  src={dogImg}
                  alt="Puppy looking for a home"
                  className="w-full object-contain drop-shadow-2xl"
                  fetchPriority="high"
                  style={{ maxWidth: "680px", maxHeight: "none" }}
                />
                {/* Meet me bubble */}
                <div
                  className="absolute left-0 top-1/2 -translate-y-4 -translate-x-4 px-4 py-2 rounded-2xl text-white font-bold text-sm shadow-lg"
                  style={{ background: "#3D937F" }}
                >
                  {t("home.meetMe", { defaultValue: "Meet me!" })}
                  <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-l-[8px] border-transparent" style={{ borderLeftColor: "#3D937F" }} />
                </div>
                {/* Rating card */}
                <div className="absolute bottom-6 right-0 translate-x-2 bg-white rounded-2xl shadow-xl px-4 py-2.5 flex items-center gap-2.5">
                  <div className="flex -space-x-2">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-7 h-7 rounded-full bg-primary/20 border-2 border-white flex items-center justify-center text-xs font-bold text-primary">
                        {["A","B","C"][i]}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-sm text-foreground">4.9</span>
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="text-xs text-muted-foreground">267 Reviews</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section — directly below hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="rounded-3xl overflow-hidden" style={{ background: "#333E48" }}>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 divide-x divide-white/10">
            {[
              { label: t("home.petsAvailable"), value: stats?.totalPets ?? "200+", color: "#FA8D29" },
              { label: t("home.happyHomes"), value: stats?.adoptionsCount ?? "150+", color: "#3D937F" },
              { label: t("home.fosterFamilies"), value: "80+", color: "#FA8D29" },
              { label: t("home.activeMembers"), value: stats?.totalUsers ?? "500+", color: "#3D937F" },
            ].map((stat, i) => (
              <div key={i} className="text-center px-6 py-8">
                <div className="text-4xl md:text-5xl font-display font-black mb-1.5" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="text-white/60 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
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
              <PetCard
                key={pet.id}
                pet={pet}
                isFavorited={isFavourited(pet.id)}
                isFavoritePending={isPendingFor(pet.id)}
                onFavorite={toggleFavourite}
              />
            ))}
          </div>
        )}
      </section>

      {/* AI Pet Match */}
      <section id="ai-pet-match">
        <AIPetMatchWidget />
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
            <div
              key={i}
              className="p-8 rounded-3xl text-center hover:-translate-y-2 transition-transform duration-300"
              style={{ background: i === 1 ? "#3D937F" : "#333E48" }}
            >
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <step.icon className="w-8 h-8" style={{ color: i === 1 ? "#ffffff" : "#FA8D29" }} />
              </div>
              <h3 className="font-display font-bold text-xl mb-3 text-white">{step.title}</h3>
              <p className="text-white/80 text-sm leading-relaxed">{step.desc}</p>
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
          <Link href="/gallery" onClick={() => window.scrollTo({ top: 0 })} className="hidden md:flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
            {t("home.viewGallery")} <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {gallery?.map(post => (
            <Link key={post.id} href={`/gallery/${post.id}`} onClick={() => window.scrollTo({ top: 0 })} className="group block">
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

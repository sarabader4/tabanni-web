import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Heart, Shield, Clock, Search } from "lucide-react";
import { useGetFeaturedPets, useGetAdminStats, useListGalleryPosts } from "@workspace/api-client-react";
import { PetCard } from "@/components/pet-card";
import AIPetMatchWidget from "@/components/ai-pet-match-widget";

export default function Home() {
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
                🐾 Jordan's Premier Pet Platform
              </div>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] text-foreground mb-6">
                Give them a <br/>
                <span className="text-gradient">second chance</span> <br/>
                at love
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
                Adopt or foster a pet today and make a difference in their lives. 
                Join thousands of families in Jordan who have found their furry best friends.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/adopt"
                  className="px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1 transition-all"
                >
                  Adopt a Pet
                </Link>
                <Link 
                  href="/foster"
                  className="px-8 py-4 bg-secondary text-white rounded-2xl font-bold shadow-lg shadow-secondary/25 hover:shadow-xl hover:shadow-secondary/40 hover:-translate-y-1 transition-all"
                >
                  Foster a Pet
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
              Find your perfect match
            </h2>
            <p className="text-muted-foreground">These lovely pets are looking for their forever homes.</p>
          </div>
          <Link href="/adopt" className="hidden md:flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
            See all pets <ArrowRight className="w-5 h-5" />
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
      <AIPetMatchWidget />

      {/* Stats Section */}
      <section className="bg-foreground py-20 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { label: "Pets Available", value: stats?.totalPets || "200+" },
              { label: "Happy Homes", value: stats?.adoptionsCount || "150+" },
              { label: "Foster Families", value: "80+" },
              { label: "Active Members", value: stats?.totalUsers || "500+" }
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
            How it works
          </h2>
          <p className="text-muted-foreground">The journey to finding your new best friend is simple and supported every step of the way.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Search, title: "Find a Pet", desc: "Browse our database of rescued pets looking for homes in Jordan." },
            { icon: Heart, title: "Apply", desc: "Submit an adoption or foster application to connect with the pet's owner or shelter." },
            { icon: Shield, title: "Bring Them Home", desc: "Once approved, welcome your new family member and start a new chapter." },
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
              Success Stories
            </h2>
            <p className="text-muted-foreground">Read about the lives we've changed together.</p>
          </div>
          <Link href="/gallery" className="hidden md:flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all">
            View Gallery <ArrowRight className="w-5 h-5" />
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

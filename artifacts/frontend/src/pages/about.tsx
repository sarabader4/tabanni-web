import { Heart, Shield, Users, Mail, MapPin, Phone } from "lucide-react";

export default function About() {
  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Header */}
      <section className="bg-foreground text-white py-20 lg:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/80 font-bold text-sm mb-6 border border-white/20">
            About Us
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
            Building a more compassionate <br/> Jordan for all animals
          </h1>
        </div>
        
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-[120px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary rounded-full blur-[120px] opacity-20 -translate-x-1/2 translate-y-1/2"></div>
      </section>

      {/* Mission Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl">
            <img 
              src={`${import.meta.env.BASE_URL}images/about-team.png`} 
              alt="Community" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 border-4 border-white/20 rounded-3xl z-10 pointer-events-none"></div>
          </div>
          
          <div className="space-y-8">
            <h2 className="font-display text-4xl font-bold text-foreground">Why we started Tabanni</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Tabanni (تبنّي) which means "Adoption" in Arabic, was born from a simple realization: Jordan has thousands of loving animals looking for homes, and just as many compassionate people looking for pets. The missing link was a centralized, easy-to-use platform to connect them.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our mission is to end animal homelessness in Jordan by making adoption the first choice, promoting fostering as a crucial stepping stone, and educating the public about animal welfare.
            </p>
            <div className="grid sm:grid-cols-2 gap-6 pt-4">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-1">Vetted Pets</h4>
                  <p className="text-sm text-muted-foreground">All listed pets are screened for health and behavior.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-1">Community Driven</h4>
                  <p className="text-sm text-muted-foreground">Powered by volunteers, rescuers, and animal lovers.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-muted/30 py-20 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Get in touch</h2>
            <p className="text-muted-foreground">Have questions about adoption? Want to partner with us? We'd love to hear from you.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-3xl border border-border text-center shadow-sm">
              <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">Email Us</h3>
              <p className="text-muted-foreground text-sm">hello@tabanni.jo</p>
            </div>
            <div className="bg-card p-8 rounded-3xl border border-border text-center shadow-sm">
              <div className="w-14 h-14 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">Location</h3>
              <p className="text-muted-foreground text-sm">Amman, Jordan (Operating online)</p>
            </div>
            <div className="bg-card p-8 rounded-3xl border border-border text-center shadow-sm">
              <div className="w-14 h-14 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">Call Us</h3>
              <p className="text-muted-foreground text-sm">+962 79 000 0000</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

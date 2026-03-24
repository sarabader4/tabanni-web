import { Link, useLocation } from "wouter";
import { PawPrint, Bell, Menu, X, Instagram, Twitter, Facebook } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Donate", href: "/donate" },
    { name: "Lost&Found", href: "/lost-found" },
    { name: "Shop", href: "/shop" },
    { name: "About us", href: "/about" },
  ];

  const footerLinks = [
    { name: "Home Page", href: "/" },
    { name: "Foster", href: "/foster" },
    { name: "Donate", href: "/donate" },
    { name: "Shop", href: "/shop" },
    { name: "Adopt", href: "/adopt" },
    { name: "About us", href: "/about" },
    { name: "Lost & Found", href: "/lost-found" },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      {/* Navbar */}
      <header
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-300",
          isScrolled
            ? "bg-white/95 backdrop-blur-lg shadow-sm py-3"
            : "bg-white/90 backdrop-blur-sm py-4"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-primary text-white p-2 rounded-xl group-hover:rotate-12 transition-transform">
                <PawPrint className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl text-[#1E2A3A] tracking-tight">
                tabbani
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-7">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "text-sm font-semibold transition-colors hover:text-primary relative",
                    location === link.href
                      ? "text-[#1E2A3A] after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[2px] after:bg-primary after:rounded-full"
                      : "text-[#1E2A3A]/70"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Adopt Now button */}
              <Link
                href="/adopt"
                className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-full shadow-md shadow-primary/25 hover:bg-primary/90 hover:-translate-y-0.5 transition-all"
              >
                Adopt Now!
              </Link>

              {/* EN + Flag */}
              <div className="flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1.5 cursor-pointer hover:bg-gray-200 transition-colors">
                <span className="text-xs font-bold text-[#1E2A3A]">EN</span>
                <span className="text-base leading-none">🇬🇧</span>
              </div>

              {/* Bell */}
              <button className="relative p-2 text-[#1E2A3A]/60 hover:text-primary transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
              </button>

              {/* User Pill */}
              <Link
                href="/profile"
                className="flex items-center gap-2 border border-[#1E2A3A]/20 rounded-full px-3 py-1.5 hover:border-primary/50 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-[#1E2A3A] flex items-center justify-center overflow-hidden">
                  <span className="text-white text-xs font-bold">S</span>
                </div>
                <span className="text-sm font-semibold text-[#1E2A3A]">Hi, Sara!</span>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-[#1E2A3A]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-20 pb-6 px-4 flex flex-col lg:hidden"
          >
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "text-2xl font-display font-bold py-3 border-b border-gray-100",
                    location === link.href ? "text-primary" : "text-[#1E2A3A]"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/adopt"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-4 w-full py-4 text-center bg-primary text-white text-lg font-bold rounded-full shadow-lg shadow-primary/25"
              >
                Adopt Now!
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 pt-20">{children}</main>

      {/* Footer */}
      <footer className="bg-[#1E2A3A] text-white mt-16" style={{ borderRadius: "2rem 2rem 0 0" }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-12 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
            {/* Col 1 — Brand */}
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <div className="bg-primary text-white p-2 rounded-xl">
                  <PawPrint className="w-5 h-5" />
                </div>
                <span className="font-display font-bold text-xl tracking-tight">
                  tabbani
                </span>
              </div>
              <div className="text-white/70 text-sm space-y-1">
                <p>Amman, Jordan</p>
                <p>tabbani@gmail.com</p>
              </div>
              <div className="flex gap-3">
                <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors text-xs font-bold">
                  𝕏
                </a>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5 w-fit cursor-pointer hover:bg-white/20 transition-colors">
                <span className="text-xs font-bold">EN</span>
                <span className="text-sm leading-none">🇬🇧</span>
              </div>
            </div>

            {/* Col 2 — Easy to access */}
            <div>
              <h3 className="font-semibold text-base mb-4">Easy to access</h3>
              <ul className="space-y-2.5">
                {footerLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-white/65 hover:text-white text-sm transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 — Contact Us */}
            <div>
              <h3 className="font-semibold text-base mb-4">Contact Us</h3>
              <form
                className="space-y-3"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full bg-white/95 text-[#1E2A3A] rounded-lg px-3 py-2.5 text-sm placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-primary/50"
                />
                <div className="flex gap-2">
                  <div className="flex items-center gap-1 bg-white/95 rounded-lg px-2 py-2.5 flex-1">
                    <span className="text-sm leading-none">🇯🇴</span>
                    <span className="text-xs text-[#1E2A3A]/60">+962</span>
                    <input
                      type="tel"
                      placeholder="XXXXXXXXX"
                      className="bg-transparent text-[#1E2A3A] text-xs flex-1 outline-none placeholder:text-gray-400 min-w-0"
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="ForExample@gmail.com"
                    className="bg-white/95 text-[#1E2A3A] rounded-lg px-3 py-2.5 text-xs placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-primary/50 flex-1 min-w-0"
                  />
                </div>
                <textarea
                  placeholder="Message"
                  rows={3}
                  className="w-full bg-white/95 text-[#1E2A3A] rounded-lg px-3 py-2.5 text-sm placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/10 text-center">
            <p className="text-white/40 text-xs">
              Copyright &copy; 2025 Apple Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

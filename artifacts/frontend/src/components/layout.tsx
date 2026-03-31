import { Link, useLocation } from "wouter";
import { PawPrint, Bell, Menu, X, Instagram, Twitter, Facebook, ChevronDown, LogOut, User, FileText, Check } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import AIChatWidget from "@/components/ai-chat-widget";
import { useAuth } from "@/contexts/auth-context";
import { useTranslation } from "react-i18next";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  petName?: string | null;
}

function useNotifications(userId: number | null | undefined) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${BASE_URL}/api/users/me/notifications/unread-count`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count ?? 0);
      }
    } catch {}
  }, [userId]);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/users/me/notifications`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.read).length);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [userId]);

  const markRead = useCallback(async (id: number) => {
    const prevNotifications = notifications;
    const prevCount = unreadCount;
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      const res = await fetch(`${BASE_URL}/api/users/me/notifications/${id}/read`, { method: "PATCH", credentials: "include" });
      if (!res.ok) {
        setNotifications(prevNotifications);
        setUnreadCount(prevCount);
      }
    } catch {
      setNotifications(prevNotifications);
      setUnreadCount(prevCount);
    }
  }, [notifications, unreadCount]);

  const markAllRead = useCallback(async () => {
    const prevNotifications = notifications;
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      const res = await fetch(`${BASE_URL}/api/users/me/notifications/read-all`, { method: "PATCH", credentials: "include" });
      if (!res.ok) {
        setNotifications(prevNotifications);
        setUnreadCount(prevNotifications.filter(n => !n.read).length);
      }
    } catch {
      setNotifications(prevNotifications);
      setUnreadCount(prevNotifications.filter(n => !n.read).length);
    }
  }, [notifications]);

  useEffect(() => {
    if (!userId) {
      setUnreadCount(0);
      setNotifications([]);
      return;
    }
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [userId, fetchUnreadCount]);

  return { unreadCount, notifications, loading, fetchNotifications, markRead, markAllRead };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileNotifOpen, setMobileNotifOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();

  const isArabic = i18n.language === "ar";

  const { unreadCount, notifications, loading, fetchNotifications, markRead, markAllRead } = useNotifications(user?.id);

  const countryCodes = [
    { flag: "🇯🇴", code: "+962", name: "Jordan" },
    { flag: "🇸🇦", code: "+966", name: "Saudi Arabia" },
    { flag: "🇦🇪", code: "+971", name: "UAE" },
    { flag: "🇰🇼", code: "+965", name: "Kuwait" },
    { flag: "🇶🇦", code: "+974", name: "Qatar" },
    { flag: "🇧🇭", code: "+973", name: "Bahrain" },
    { flag: "🇴🇲", code: "+968", name: "Oman" },
    { flag: "🇪🇬", code: "+20",  name: "Egypt" },
    { flag: "🇱🇧", code: "+961", name: "Lebanon" },
    { flag: "🇮🇶", code: "+964", name: "Iraq" },
    { flag: "🇵🇸", code: "+970", name: "Palestine" },
    { flag: "🇺🇸", code: "+1",   name: "USA" },
    { flag: "🇬🇧", code: "+44",  name: "UK" },
  ];
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [contactForm, setContactForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);

  const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.message.trim()) return;
    setContactSubmitting(true);
    try {
      await fetch(`${BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contactForm.name,
          phone: contactForm.phone ? `${selectedCountry.code} ${contactForm.phone}` : undefined,
          email: contactForm.email || undefined,
          message: contactForm.message,
        }),
      });
      setContactSuccess(true);
      setContactForm({ name: "", phone: "", email: "", message: "" });
      setTimeout(() => setContactSuccess(false), 4000);
    } finally {
      setContactSubmitting(false);
    }
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(isArabic ? "en" : "ar");
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleNotif = () => {
    if (!notifOpen) {
      fetchNotifications();
    }
    setNotifOpen(prev => !prev);
    setUserDropdownOpen(false);
  };

  const navLinks = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.donate"), href: "/donate" },
    { name: t("nav.lostFound"), href: "/lost-found" },
    { name: t("nav.shop"), href: "/shop" },
    { name: t("nav.about"), href: "/about" },
  ];

  const footerLinks = [
    { name: t("footer.homePage"), href: "/" },
    { name: t("footer.foster"), href: "/foster" },
    { name: t("footer.donate"), href: "/donate" },
    { name: t("footer.shop"), href: "/shop" },
    { name: t("footer.adopt"), href: "/adopt" },
    { name: t("footer.about"), href: "/about" },
    { name: t("footer.lostFound"), href: "/lost-found" },
  ];

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const firstName = user?.fullName?.split(" ")[0] ?? "";

  const handleLogout = useCallback(async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    navigate("/");
  }, [logout, navigate]);

  const LangToggle = ({ className }: { className?: string }) => (
    <button
      onClick={toggleLanguage}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-1.5 cursor-pointer transition-colors",
        className
      )}
      aria-label={t("nav.toggleLanguage")}
    >
      {isArabic ? (
        <>
          <span className="text-xs font-bold">AR</span>
          <span className="text-base leading-none">🇸🇦</span>
        </>
      ) : (
        <>
          <span className="text-xs font-bold">EN</span>
          <span className="text-base leading-none">🇬🇧</span>
        </>
      )}
    </button>
  );

  function formatRelativeTime(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    if (diffMin < 1) return isArabic ? "الآن" : "Just now";
    if (diffMin < 60) return isArabic ? `منذ ${diffMin} دقيقة` : `${diffMin}m ago`;
    if (diffHr < 24) return isArabic ? `منذ ${diffHr} ساعة` : `${diffHr}h ago`;
    return isArabic ? `منذ ${diffDay} يوم` : `${diffDay}d ago`;
  }

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
                  key={link.href}
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
                {t("nav.adoptNow")}
              </Link>

              {/* Language Toggle */}
              <LangToggle className="bg-gray-100 hover:bg-gray-200" />

              {/* Notification Bell — only for logged-in users */}
              {user && (
                <div ref={notifRef} className="relative">
                  <button
                    onClick={handleToggleNotif}
                    className="relative p-2 text-[#1E2A3A]/60 hover:text-primary transition-colors"
                    aria-label={t("profile.notifications")}
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 border-2 border-white leading-none">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {notifOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        transition={{ duration: 0.12 }}
                        className={cn(
                          "absolute top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden",
                          isArabic ? "left-0" : "right-0"
                        )}
                      >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                          <span className="text-sm font-semibold text-[#1E2A3A]">{t("profile.notifications")}</span>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllRead}
                              className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              {t("profile.markAllRead")}
                            </button>
                          )}
                        </div>

                        <div className="max-h-80 overflow-y-auto">
                          {loading ? (
                            <div className="py-8 text-center text-sm text-gray-400">Loading...</div>
                          ) : notifications.length === 0 ? (
                            <div className="py-8 text-center text-sm text-gray-400">{t("profile.noNotifications")}</div>
                          ) : (
                            notifications.map(notif => (
                              <div
                                key={notif.id}
                                className={cn(
                                  "px-4 py-3 border-b border-gray-50 last:border-0 transition-colors",
                                  !notif.read ? "bg-primary/5" : "hover:bg-gray-50"
                                )}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className={cn("text-xs font-semibold text-[#1E2A3A] truncate", !notif.read && "text-primary")}>
                                      {t(`notifTypes.${notif.type}.title`, { defaultValue: notif.title })}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                      {t(`notifTypes.${notif.type}.message`, { defaultValue: notif.message })}
                                    </p>
                                    <p className="text-[10px] text-gray-400 mt-1">{formatRelativeTime(notif.createdAt)}</p>
                                  </div>
                                  {!notif.read && (
                                    <button
                                      onClick={() => markRead(notif.id)}
                                      className="shrink-0 w-4 h-4 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors mt-0.5"
                                      title={t("profile.markRead")}
                                    >
                                      <div className="w-2 h-2 rounded-full bg-primary" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Auth section */}
              {user ? (
                /* Logged-in user pill with dropdown */
                <div ref={dropdownRef} className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 border border-[#1E2A3A]/20 rounded-full px-3 py-1.5 hover:border-primary/50 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#1E2A3A] flex items-center justify-center overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-xs font-bold">{initials}</span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-[#1E2A3A]">{t("nav.hi", { name: firstName })}</span>
                    <ChevronDown className={cn("w-3.5 h-3.5 text-[#1E2A3A]/60 transition-transform", userDropdownOpen && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        transition={{ duration: 0.12 }}
                        className="absolute end-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50"
                      >
                        <Link
                          href="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#1E2A3A] hover:bg-gray-50 transition-colors"
                        >
                          <User className="w-4 h-4 text-[#1E2A3A]/60" />
                          {t("nav.profile")}
                        </Link>
                        <Link
                          href="/profile?tab=requests"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#1E2A3A] hover:bg-gray-50 transition-colors"
                        >
                          <FileText className="w-4 h-4 text-[#1E2A3A]/60" />
                          {t("nav.myRequests")}
                        </Link>
                        <div className="border-t border-gray-100" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          {t("nav.logout")}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* Unauthenticated: Login + Sign Up */
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-semibold text-[#1E2A3A] hover:text-primary transition-colors"
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-[#1E2A3A] text-white text-sm font-bold rounded-full hover:bg-[#1E2A3A]/90 transition-all"
                  >
                    {t("nav.signUp")}
                  </Link>
                </div>
              )}
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
                  key={link.href}
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
                {t("nav.adoptNow")}
              </Link>

              <div className="flex items-center justify-between mt-2">
                <LangToggle className="bg-gray-100 hover:bg-gray-200" />
                {user && (
                  <button
                    onClick={() => {
                      if (!mobileNotifOpen) fetchNotifications();
                      setMobileNotifOpen(prev => !prev);
                    }}
                    className="relative p-2 text-[#1E2A3A]/60"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 border-2 border-white leading-none">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>
                )}
              </div>

              {user && mobileNotifOpen && (
                <div className="mt-2 border border-gray-100 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <span className="text-xs font-semibold text-[#1E2A3A]">{t("profile.tabNotifications")}</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-[10px] text-primary font-semibold hover:underline">
                        {t("profile.markAllRead")}
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {loading ? (
                      <p className="text-xs text-gray-400 text-center py-4">{t("common.loading", { defaultValue: "Loading..." })}</p>
                    ) : notifications.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">{t("profile.noNotifications", { defaultValue: "No notifications" })}</p>
                    ) : notifications.map(notif => (
                      <div
                        key={notif.id}
                        className={cn(
                          "px-4 py-3 border-b border-gray-50 last:border-0",
                          !notif.read ? "bg-primary/5" : ""
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-xs font-semibold text-[#1E2A3A]", !notif.read && "text-primary")}>
                              {t(`notifTypes.${notif.type}.title`, { defaultValue: notif.title })}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                              {t(`notifTypes.${notif.type}.message`, { defaultValue: notif.message })}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1">{formatRelativeTime(notif.createdAt)}</p>
                          </div>
                          {!notif.read && (
                            <button
                              onClick={() => markRead(notif.id)}
                              className="shrink-0 w-4 h-4 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors mt-0.5"
                            >
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {user ? (
                <div className="mt-2 space-y-2">
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-3 text-[#1E2A3A] font-semibold"
                  >
                    <User className="w-5 h-5" /> {t("nav.profile")}
                  </Link>
                  <button
                    onClick={() => void handleLogout()}
                    className="flex items-center gap-2 py-3 text-red-500 font-semibold"
                  >
                    <LogOut className="w-5 h-5" /> {t("nav.logout")}
                  </button>
                </div>
              ) : (
                <div className="mt-2 flex gap-3">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-3 text-center border-2 border-[#1E2A3A] text-[#1E2A3A] font-bold rounded-full"
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-3 text-center bg-[#1E2A3A] text-white font-bold rounded-full"
                  >
                    {t("nav.signUp")}
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 pt-20">{children}</main>

      {/* AI Chat Widget */}
      <AIChatWidget />

      {/* Footer */}
      <footer className="bg-[#1E2A3A] text-white mt-16" style={{ borderRadius: "2rem 2rem 0 0" }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-12 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1.2fr] gap-10 lg:gap-16">
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
                <p>{t("footer.address")}</p>
                <p>{t("footer.email")}</p>
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
              <LangToggle className="bg-white/10 hover:bg-white/20" />
            </div>

            {/* Col 2 — Easy to access */}
            <div>
              <h3 className="font-semibold text-base mb-4">{t("footer.easyAccess")}</h3>
              <ul className="space-y-2.5">
                {footerLinks.map((link) => (
                  <li key={link.href}>
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
              <h3 className="font-semibold text-base mb-4">{t("footer.contactUs")}</h3>
              {contactSuccess && (
                <div className="mb-3 px-3 py-2.5 bg-green-500/20 border border-green-400/30 text-green-300 text-sm rounded-lg">
                  Message sent! We'll get back to you soon.
                </div>
              )}
              <form
                className="space-y-3"
                onSubmit={handleContactSubmit}
              >
                <input
                  type="text"
                  placeholder={t("footer.yourName")}
                  value={contactForm.name}
                  onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                  required
                  className="w-full bg-white/95 text-[#1E2A3A] rounded-lg px-3 py-2.5 text-sm placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-primary/50"
                />
                <div className="flex gap-2">
                  <div className="flex items-center bg-white/95 rounded-lg px-2 py-2.5 flex-1 min-w-0 gap-1">
                    <div className="relative flex items-center shrink-0">
                      <span className="text-sm pointer-events-none">{selectedCountry.flag}</span>
                      <span className="text-xs text-[#1E2A3A]/60 pointer-events-none mx-0.5">{selectedCountry.code}</span>
                      <select
                        value={selectedCountry.code}
                        onChange={e => setSelectedCountry(countryCodes.find(c => c.code === e.target.value) ?? countryCodes[0])}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full"
                        title="Select country code"
                      >
                        {countryCodes.map(c => (
                          <option key={c.code} value={c.code} style={{ color: "#1E2A3A", background: "#fff" }}>{c.name} ({c.code})</option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="tel"
                      placeholder={t("footer.phonePlaceholder")}
                      value={contactForm.phone}
                      onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))}
                      className="bg-transparent text-[#1E2A3A] text-xs flex-1 outline-none placeholder:text-gray-400 min-w-0"
                    />
                  </div>
                  <input
                    type="email"
                    placeholder={t("footer.emailPlaceholder")}
                    value={contactForm.email}
                    onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                    className="bg-white/95 text-[#1E2A3A] rounded-lg px-3 py-2.5 text-xs placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-primary/50 flex-1 min-w-0"
                  />
                </div>
                <textarea
                  placeholder={t("footer.message")}
                  rows={3}
                  value={contactForm.message}
                  onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                  required
                  className="w-full bg-white/95 text-[#1E2A3A] rounded-lg px-3 py-2.5 text-sm placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
                <button
                  type="submit"
                  disabled={contactSubmitting}
                  className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {contactSubmitting ? "Sending..." : t("footer.submit")}
                </button>
              </form>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/10 text-center">
            <p className="text-white/40 text-xs">
              {t("footer.copyright")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

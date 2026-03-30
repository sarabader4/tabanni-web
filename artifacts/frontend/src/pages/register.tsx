import { useState } from "react";
import { Link, useLocation } from "wouter";
import { PawPrint, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useTranslation } from "react-i18next";

export default function Register() {
  const [, navigate] = useLocation();
  const { register } = useAuth();
  const { t } = useTranslation();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!fullName || !email || !password) {
      setError(t("register.fillRequired"));
      return;
    }
    if (password.length < 6) {
      setError(t("register.passwordLength"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("register.passwordMatch"));
      return;
    }

    setIsLoading(true);
    try {
      await register({ fullName, email, phone: phone || undefined, password });
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("register.registrationFailed"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF8F3] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="bg-[#FF6B35] text-white p-2.5 rounded-xl group-hover:scale-105 transition-transform">
              <PawPrint className="w-6 h-6" />
            </div>
            <span className="font-bold text-2xl text-[#1E2A3A] tracking-tight">tabbani</span>
          </Link>
          <p className="mt-3 text-[#1E2A3A]/60 text-sm">{t("register.subtitle")}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-xl font-bold text-[#1E2A3A] mb-6">{t("register.createAccount")}</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#1E2A3A] mb-1.5">
                {t("register.fullName")} <span className="text-[#FF6B35]">{t("register.required")}</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t("register.placeholderName")}
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-[#1E2A3A] placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35] transition-all"
                autoComplete="name"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E2A3A] mb-1.5">
                {t("register.emailAddress")} <span className="text-[#FF6B35]">{t("register.required")}</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("register.placeholderEmail")}
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-[#1E2A3A] placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35] transition-all"
                autoComplete="email"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E2A3A] mb-1.5">
                {t("register.phoneNumber")} <span className="text-[#1E2A3A]/40 font-normal">{t("register.optional")}</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("register.placeholderPhone")}
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-[#1E2A3A] placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35] transition-all"
                autoComplete="tel"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E2A3A] mb-1.5">
                {t("register.password")} <span className="text-[#FF6B35]">{t("register.required")}</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("register.minChars")}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 pr-10 text-sm text-[#1E2A3A] placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35] transition-all"
                  autoComplete="new-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1E2A3A] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E2A3A] mb-1.5">
                {t("register.confirmPassword")} <span className="text-[#FF6B35]">{t("register.required")}</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t("register.repeatPassword")}
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-[#1E2A3A] placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#FF6B35]/30 focus:border-[#FF6B35] transition-all"
                autoComplete="new-password"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-[#FF6B35] text-white font-bold text-sm rounded-lg hover:bg-[#FF6B35]/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("register.creatingAccount")}
                </>
              ) : (
                t("register.createAccount")
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#1E2A3A]/60">
            {t("register.alreadyHaveAccount")}{" "}
            <Link href="/login" className="text-[#FF6B35] font-semibold hover:underline">
              {t("register.signIn")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

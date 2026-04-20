import { useState } from "react";
import { Link, useLocation } from "wouter";
import { PawPrint, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useTranslation } from "react-i18next";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import {
  CountryPhoneDropdown,
  DEFAULT_COUNTRY,
  type CountryOption,
} from "@/components/country-phone-dropdown";

export default function Register() {
  const [, navigate] = useLocation();
  const { register } = useAuth();
  const { t } = useTranslation();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState<CountryOption>(DEFAULT_COUNTRY);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function validatePhone(value: string, selectedCountry: CountryOption): string {
    if (!selectedCountry) return t("register.countryCodeRequired");
    if (!value.trim()) return t("register.phoneRequired");
    const parsed = parsePhoneNumberFromString(value, selectedCountry.code);
    if (!parsed || !parsed.isValid()) return t("register.phoneRequired");
    return "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!fullName || !email || !password) {
      setError(t("register.fillRequired"));
      return;
    }

    const phoneErr = validatePhone(phone, country);
    if (phoneErr) {
      setPhoneError(phoneErr);
      setPhoneTouched(true);
      return;
    }

    if (!city.trim()) {
      setError(t("register.cityRequired"));
      return;
    }
    if (
      password.length < 6 ||
      !/[a-z]/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[^a-zA-Z0-9]/.test(password)
    ) {
      setError(t("register.passwordLength"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("register.passwordMatch"));
      return;
    }

    const parsedPhone = parsePhoneNumberFromString(phone, country.code);
    const e164Phone = parsedPhone?.format("E.164") ?? `${country.dialCode}${phone.replace(/\D/g, "")}`;

    setIsLoading(true);
    try {
      await register({ fullName, email, phone: e164Phone, city: city.trim(), password });
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("register.registrationFailed"));
    } finally {
      setIsLoading(false);
    }
  }

  const inputCls = (hasError?: boolean) =>
    `w-full border rounded-lg px-3.5 py-2.5 text-sm text-[#333E48] placeholder:text-gray-400 outline-none focus:ring-2 transition-all ${
      hasError
        ? "border-red-400 focus:ring-red-200"
        : "border-gray-200 focus:ring-[#FA8D29]/30 focus:border-[#FA8D29]"
    }`;

  return (
    <div className="min-h-screen bg-[#FFFAF7] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="bg-[#FA8D29] text-white p-2.5 rounded-xl group-hover:scale-105 transition-transform">
              <PawPrint className="w-6 h-6" />
            </div>
            <span className="font-bold text-2xl text-[#333E48] tracking-tight">tabbani</span>
          </Link>
          <p className="mt-3 text-[#333E48]/60 text-sm">{t("register.subtitle")}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-xl font-bold text-[#333E48] mb-6">{t("register.createAccount")}</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#333E48] mb-1.5">
                {t("register.fullName")} <span className="text-[#FA8D29]">{t("register.required")}</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t("register.placeholderName")}
                className={inputCls()}
                autoComplete="name"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#333E48] mb-1.5">
                {t("register.emailAddress")} <span className="text-[#FA8D29]">{t("register.required")}</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("register.placeholderEmail")}
                className={inputCls()}
                autoComplete="email"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#333E48] mb-1.5">
                {t("register.phoneNumber")} <span className="text-[#FA8D29]">{t("register.required")}</span>
              </label>
              <CountryPhoneDropdown
                selectedCountry={country}
                onCountryChange={(c) => {
                  setCountry(c);
                  setPhone("");
                  setPhoneTouched(false);
                  setPhoneError("");
                }}
                phoneValue={phone}
                onPhoneChange={(val) => {
                  setPhone(val);
                  setPhoneTouched(true);
                  if (phoneError) setPhoneError(validatePhone(val, country));
                }}
                disabled={isLoading}
                error={phoneError}
                touched={phoneTouched}
                label=""
                instanceId="register"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#333E48] mb-1.5">
                {t("register.city")} <span className="text-[#FA8D29]">{t("register.required")}</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={t("register.placeholderCity")}
                className={inputCls()}
                autoComplete="address-level2"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#333E48] mb-1.5">
                {t("register.password")} <span className="text-[#FA8D29]">{t("register.required")}</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("register.minChars")}
                  className={inputCls()}
                  autoComplete="new-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#333E48] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#333E48] mb-1.5">
                {t("register.confirmPassword")} <span className="text-[#FA8D29]">{t("register.required")}</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t("register.repeatPassword")}
                className={inputCls()}
                autoComplete="new-password"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-[#FA8D29] text-white font-bold text-sm rounded-lg hover:bg-[#FA8D29]/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-2"
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

          <p className="mt-6 text-center text-sm text-[#333E48]/60">
            {t("register.alreadyHaveAccount")}{" "}
            <Link href="/login" className="text-[#FA8D29] font-semibold hover:underline">
              {t("register.signIn")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

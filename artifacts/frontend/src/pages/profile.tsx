import { useState, useEffect, useRef, useMemo } from "react";
import {
  User, PawPrint, FileText, Heart, Bell, Users, MapPin, Settings, Edit2, Loader2, CheckCircle2, Clock, XCircle, ChevronDown, Search, X, Eye, EyeOff,
} from "lucide-react";
import {
  useGetMyProfile, useUpdateMyProfile, useGetMyPets, useGetMyApplications, useGetMyFavourites, useGetMyDonations, useListLostFoundReports,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import {
  parsePhoneNumberFromString,
  getCountries,
  getCountryCallingCode,
  AsYouType,
  CountryCode,
} from "libphonenumber-js";

const sidebarLinks = [
  { label: "Profile", icon: User },
  { label: "My Pets", icon: PawPrint },
  { label: "Applications", icon: FileText },
  { label: "Favourite", icon: Heart },
  { label: "Notifications", icon: Bell },
  { label: "Volunteer", icon: Users },
  { label: "Lost&Found", icon: MapPin },
  { label: "Settings", icon: Settings },
];

const REGION_NAMES = new Intl.DisplayNames(["en"], { type: "region" });

interface CountryOption {
  code: CountryCode;
  name: string;
  dialCode: string;
  flag: string;
}

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

const ALL_COUNTRIES: CountryOption[] = getCountries()
  .map((code) => {
    const name = REGION_NAMES.of(code) ?? code;
    const dialCode = `+${getCountryCallingCode(code)}`;
    return { code, name, dialCode, flag: getFlagEmoji(code) };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

function findCountryByName(name: string): CountryOption | undefined {
  return ALL_COUNTRIES.find((c) => c.name.toLowerCase() === name.toLowerCase());
}

function findCountryByCode(code: string): CountryOption | undefined {
  return ALL_COUNTRIES.find((c) => c.code === code);
}

interface CountryPhoneDropdownProps {
  selectedCountry: CountryOption;
  onCountryChange: (country: CountryOption) => void;
  phoneValue: string;
  onPhoneChange: (val: string) => void;
  disabled?: boolean;
  error?: string;
  touched?: boolean;
}

const LISTBOX_ID = "country-listbox";

function CountryPhoneDropdown({
  selectedCountry,
  onCountryChange,
  phoneValue,
  onPhoneChange,
  disabled,
  error,
  touched,
}: CountryPhoneDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return ALL_COUNTRIES;
    return ALL_COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.dialCode.includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [search]);

  useEffect(() => {
    if (open) {
      setFocusedIndex(Math.max(0, filtered.findIndex((c) => c.code === selectedCountry.code)));
      setTimeout(() => searchRef.current?.focus(), 50);
    } else {
      setSearch("");
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setFocusedIndex(0);
    }
  }, [search]);

  useEffect(() => {
    if (open && listRef.current) {
      const item = listRef.current.querySelectorAll("[role='option']")[focusedIndex] as HTMLElement | undefined;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [focusedIndex, open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const chosen = filtered[focusedIndex];
      if (chosen) {
        onCountryChange(chosen);
        setOpen(false);
        triggerRef.current?.focus();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  const hasError = touched && !!error;

  return (
    <div className="space-y-1">
      <label id="phone-label" className="text-xs font-semibold text-gray-500">Phone Number</label>
      <div className={`flex rounded-xl border overflow-visible ${hasError ? "border-red-400" : "border-gray-200"} ${disabled ? "bg-gray-50" : "bg-white"}`}>
        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <button
            ref={triggerRef}
            type="button"
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={open ? LISTBOX_ID : undefined}
            aria-label={`Country code: ${selectedCountry.name} ${selectedCountry.dialCode}`}
            onClick={() => !disabled && setOpen((v) => !v)}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " " || e.key === "ArrowDown") && !disabled) {
                e.preventDefault();
                setOpen(true);
              } else if (e.key === "Escape") {
                setOpen(false);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-[#1E2A3A] border-r border-gray-200 rounded-l-xl transition-colors h-full ${
              disabled ? "cursor-default opacity-60 bg-gray-50" : "hover:bg-gray-50 cursor-pointer"
            }`}
          >
            <span className="text-base leading-none" aria-hidden="true">{selectedCountry.flag}</span>
            <span className="text-xs text-gray-500">{selectedCountry.dialCode}</span>
            {!disabled && <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />}
          </button>

          {open && (
            <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="p-2 border-b border-gray-100">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                  <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" aria-hidden="true" />
                  <input
                    ref={searchRef}
                    role="combobox"
                    aria-autocomplete="list"
                    aria-controls={LISTBOX_ID}
                    aria-activedescendant={filtered[focusedIndex] ? `country-option-${filtered[focusedIndex].code}` : undefined}
                    aria-label="Search country"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Search country..."
                    className="flex-1 bg-transparent text-sm outline-none text-[#1E2A3A] placeholder-gray-400"
                  />
                  {search && (
                    <button type="button" onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600" aria-label="Clear search">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <div
                id={LISTBOX_ID}
                role="listbox"
                aria-label="Countries"
                ref={listRef}
                className="max-h-52 overflow-y-auto"
              >
                {filtered.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No results</p>
                ) : (
                  filtered.map((c, idx) => (
                    <button
                      key={c.code}
                      id={`country-option-${c.code}`}
                      role="option"
                      aria-selected={c.code === selectedCountry.code}
                      type="button"
                      onClick={() => {
                        onCountryChange(c);
                        setOpen(false);
                        triggerRef.current?.focus();
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-gray-50 ${
                        c.code === selectedCountry.code ? "bg-primary/5 font-semibold" : ""
                      } ${idx === focusedIndex ? "bg-gray-100 outline-none" : ""}`}
                    >
                      <span className="text-base" aria-hidden="true">{c.flag}</span>
                      <span className="flex-1 text-[#1E2A3A] truncate">{c.name}</span>
                      <span className="text-gray-400 text-xs font-mono">{c.dialCode}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <input
          type="tel"
          value={phoneValue}
          disabled={disabled}
          aria-labelledby="phone-label"
          aria-invalid={hasError}
          aria-describedby={hasError ? "phone-error" : undefined}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^\d\s\-().+]/g, "");
            const formatter = new AsYouType(selectedCountry.code);
            const formatted = formatter.input(raw.replace(/\D/g, ""));
            onPhoneChange(formatted);
          }}
          className={`flex-1 px-3 py-2.5 text-sm text-[#1E2A3A] outline-none rounded-r-xl focus:ring-2 focus:ring-inset ${
            hasError ? "focus:ring-red-300" : "focus:ring-primary/20"
          } ${disabled ? "bg-gray-50 text-gray-500" : "bg-white"}`}
          placeholder={disabled ? "" : `Enter phone number`}
        />
      </div>
      {hasError && <p id="phone-error" className="text-xs text-red-500 mt-0.5" role="alert">{error}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
    approved:  { color: "bg-green-100 text-green-600", icon: CheckCircle2 },
    pending:   { color: "bg-yellow-100 text-yellow-600", icon: Clock },
    rejected:  { color: "bg-red-100 text-red-500", icon: XCircle },
    active:    { color: "bg-green-100 text-green-600", icon: CheckCircle2 },
    completed: { color: "bg-blue-100 text-blue-500", icon: CheckCircle2 },
  };
  const conf = map[status] ?? { color: "bg-gray-100 text-gray-500", icon: Clock };
  const Icon = conf.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold capitalize ${conf.color}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
}

interface FormState {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  country: CountryOption;
  city: string;
}

interface TouchedState {
  fullName: boolean;
  email: boolean;
  password: boolean;
  phone: boolean;
  country: boolean;
  city: boolean;
}

interface ErrorsState {
  fullName?: string;
  email?: string;
  password?: string;
  phone?: string;
  city?: string;
}

function validateEmail(email: string): string | undefined {
  if (!email.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email address";
  return undefined;
}

function validatePhone(phone: string, countryCode: CountryCode): string | undefined {
  if (!phone.trim()) return "Phone number is required";
  const parsed = parsePhoneNumberFromString(phone, countryCode);
  if (!parsed || !parsed.isValid()) return "Invalid phone number for selected country";
  return undefined;
}

function validatePassword(password: string): string | undefined {
  if (!password || password === PASSWORD_SENTINEL) return undefined;
  if (password.length < 8) return "Password must be at least 8 characters";
  return undefined;
}

type PasswordStrength = "weak" | "medium" | "strong";

function getPasswordStrength(password: string): PasswordStrength | null {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  if (score <= 2) return "weak";
  if (score <= 3) return "medium";
  return "strong";
}

const STRENGTH_CONFIG: Record<PasswordStrength, { label: string; color: string; bg: string; width: string }> = {
  weak:   { label: "Weak",   color: "text-red-500",    bg: "bg-red-400",    width: "w-1/3" },
  medium: { label: "Medium", color: "text-yellow-500",  bg: "bg-yellow-400", width: "w-2/3" },
  strong: { label: "Strong", color: "text-green-500",   bg: "bg-green-500",  width: "w-full" },
};

function validateForm(form: FormState): ErrorsState {
  const errors: ErrorsState = {};
  if (!form.fullName.trim()) errors.fullName = "Full name is required";
  const emailErr = validateEmail(form.email);
  if (emailErr) errors.email = emailErr;
  const pwErr = validatePassword(form.password);
  if (pwErr) errors.password = pwErr;
  const phoneErr = validatePhone(form.phone, form.country.code);
  if (phoneErr) errors.phone = phoneErr;
  if (!form.city.trim()) errors.city = "City is required";
  return errors;
}

const PASSWORD_SENTINEL = "\x00\x00UNCHANGED\x00\x00";

const DEFAULT_COUNTRY = findCountryByName("Jordan") ?? ALL_COUNTRIES[0];

function buildInitialForm(profile: { fullName?: string; email?: string; phone?: string; country?: string; city?: string } | null): FormState {
  const countryObj = profile?.country ? (findCountryByName(profile.country) ?? DEFAULT_COUNTRY) : DEFAULT_COUNTRY;
  return {
    fullName: profile?.fullName ?? "",
    email: profile?.email ?? "",
    password: PASSWORD_SENTINEL,
    phone: profile?.phone ?? "",
    country: countryObj,
    city: profile?.city ?? "",
  };
}

const NO_TOUCHED: TouchedState = {
  fullName: false,
  email: false,
  password: false,
  phone: false,
  country: false,
  city: false,
};

export default function Profile() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("Profile");

  const { data: profile, isLoading } = useGetMyProfile();
  const updateMutation = useUpdateMyProfile();
  const { data: myPets, isLoading: petsLoading } = useGetMyPets();
  const { data: applications, isLoading: appLoading } = useGetMyApplications();
  const { data: favourites, isLoading: favLoading } = useGetMyFavourites();
  const { data: donations, isLoading: donLoading } = useGetMyDonations();
  const { data: lostFoundData, isLoading: lfLoading } = useListLostFoundReports({ limit: 20 });

  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [savedForm, setSavedForm] = useState<FormState>(() => buildInitialForm(null));
  const [form, setForm] = useState<FormState>(() => buildInitialForm(null));
  const [touched, setTouched] = useState<TouchedState>(NO_TOUCHED);

  useEffect(() => {
    if (profile) {
      const initial = buildInitialForm(profile);
      setForm(initial);
      setSavedForm(initial);
    }
  }, [profile]);

  const errors = useMemo(() => validateForm(form), [form]);
  const isFormValid = Object.keys(errors).length === 0;

  const handleEdit = () => {
    setIsEditing(true);
    setShowPassword(false);
    setPasswordChanged(false);
    setTouched(NO_TOUCHED);
  };

  const handleCancel = () => {
    setForm({ ...savedForm, password: PASSWORD_SENTINEL });
    setIsEditing(false);
    setShowPassword(false);
    setPasswordChanged(false);
    setTouched(NO_TOUCHED);
  };

  const handleBlur = (field: keyof TouchedState) => {
    setTouched((t) => ({ ...t, [field]: true }));
  };

  const handlePasswordChange = (value: string) => {
    if (!passwordChanged) {
      setPasswordChanged(true);
      setForm({ ...form, password: value.endsWith(PASSWORD_SENTINEL) ? value.replace(PASSWORD_SENTINEL, "") : value });
    } else {
      setForm({ ...form, password: value });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ fullName: true, email: true, password: false, phone: true, country: true, city: true });
    if (!isFormValid) return;

    const parsedPhone = parsePhoneNumberFromString(form.phone, form.country.code);
    const e164Phone = parsedPhone?.format("E.164") ?? `${form.country.dialCode}${form.phone.replace(/\D/g, "")}`;

    const updateData: Record<string, string> = {
      fullName: form.fullName,
      email: form.email,
      phone: e164Phone,
      country: form.country.name,
      city: form.city,
    };

    if (passwordChanged && form.password) {
      updateData.password = form.password;
    }

    try {
      await updateMutation.mutateAsync({ data: updateData as any });
      setSavedForm({ ...form, password: PASSWORD_SENTINEL });
      setForm({ ...form, password: PASSWORD_SENTINEL });
      setIsEditing(false);
      setShowPassword(false);
      setPasswordChanged(false);
      setTouched(NO_TOUCHED);
      toast({ title: "Profile saved successfully." });
    } catch {
      toast({ title: "Failed to save profile", variant: "destructive" });
    }
  };

  const displayName = profile?.fullName || "User";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const readOnlyClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#1E2A3A] outline-none bg-gray-50 text-gray-500 cursor-default";
  const editClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#1E2A3A] outline-none focus:ring-2 focus:ring-primary/30 bg-white";
  const errorClass = "w-full border border-red-400 rounded-xl px-4 py-2.5 text-sm text-[#1E2A3A] outline-none focus:ring-2 focus:ring-red-200 bg-white";

  function fieldClass(field: keyof ErrorsState) {
    if (!isEditing) return readOnlyClass;
    if (touched[field as keyof TouchedState] && errors[field]) return errorClass;
    return editClass;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Sidebar */}
          <div
            className="w-full md:w-64 flex-shrink-0 rounded-2xl p-5 text-white"
            style={{ backgroundColor: "#1E2A3A" }}
          >
            <div className="flex flex-col items-center mb-6 pt-2">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-3 text-2xl font-bold text-white overflow-hidden">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span>{avatarLetter}</span>
                )}
              </div>
              <p className="font-bold text-base">{displayName}</p>
              <button
                type="button"
                onClick={() => { setActiveTab("Profile"); handleEdit(); }}
                className="flex items-center gap-1 mt-1.5 bg-white/10 hover:bg-white/20 rounded-full px-3 py-1 text-xs transition-colors"
              >
                <Edit2 className="w-3 h-3" /> Edit Profile
              </button>
            </div>

            <nav className="space-y-1">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                const isActive = activeTab === link.label;
                return (
                  <button
                    key={link.label}
                    onClick={() => setActiveTab(link.label)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive ? "bg-white text-[#1E2A3A]" : "text-white/70 hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">

            {/* ── Profile Tab ── */}
            {activeTab === "Profile" && (
              isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="flex justify-center mb-8">
                    <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden text-3xl font-bold text-primary">
                      {profile?.avatarUrl ? (
                        <img src={profile.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{avatarLetter}</span>
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500">Full Name</label>
                      <input
                        value={form.fullName}
                        disabled={!isEditing}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        onBlur={() => handleBlur("fullName")}
                        className={fieldClass("fullName")}
                        placeholder={isEditing ? "Your full name" : ""}
                      />
                      {isEditing && touched.fullName && errors.fullName && (
                        <p className="text-xs text-red-500">{errors.fullName}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500">Email</label>
                      <input
                        type="email"
                        value={form.email}
                        disabled={!isEditing}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        onBlur={() => handleBlur("email")}
                        className={fieldClass("email")}
                        placeholder={isEditing ? "your@email.com" : ""}
                      />
                      {isEditing && touched.email && errors.email && (
                        <p className="text-xs text-red-500">{errors.email}</p>
                      )}
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                      <div className="flex items-baseline justify-between">
                        <label className="text-xs font-semibold text-gray-500">Password</label>
                        {isEditing && (
                          <span className="text-[10px] text-gray-400">Change password (optional)</span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={(showPassword && passwordChanged) ? "text" : "password"}
                          autoComplete="new-password"
                          value={passwordChanged ? form.password : "••••••••••••"}
                          disabled={!isEditing}
                          onChange={(e) => handlePasswordChange(e.target.value)}
                          onFocus={() => {
                            if (isEditing && !passwordChanged) {
                              setPasswordChanged(true);
                              setForm({ ...form, password: "" });
                            }
                          }}
                          onBlur={() => {
                            handleBlur("password");
                            if (passwordChanged && !form.password) {
                              setPasswordChanged(false);
                              setForm({ ...form, password: PASSWORD_SENTINEL });
                            }
                          }}
                          className={`${fieldClass("password")} pr-10`}
                          placeholder={isEditing && passwordChanged ? "Enter new password" : ""}
                        />
                        {isEditing && passwordChanged && (
                          <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                      {isEditing && passwordChanged && touched.password && errors.password && (
                        <p className="text-xs text-red-500">{errors.password}</p>
                      )}
                      {isEditing && passwordChanged && form.password && (() => {
                        const strength = getPasswordStrength(form.password);
                        if (!strength) return null;
                        const cfg = STRENGTH_CONFIG[strength];
                        return (
                          <div className="space-y-1 mt-1">
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full ${cfg.bg} ${cfg.width} rounded-full transition-all duration-300`} />
                            </div>
                            <p className={`text-[10px] font-semibold ${cfg.color}`}>
                              Password strength: {cfg.label}
                            </p>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Phone with country code */}
                    <CountryPhoneDropdown
                      selectedCountry={form.country}
                      onCountryChange={(c) => {
                        setForm({ ...form, country: c, phone: "" });
                        setTouched((t) => ({ ...t, phone: false }));
                      }}
                      phoneValue={form.phone}
                      onPhoneChange={(val) => {
                        setForm({ ...form, phone: val });
                        setTouched((t) => ({ ...t, phone: true }));
                      }}
                      disabled={!isEditing}
                      error={errors.phone}
                      touched={touched.phone}
                    />

                    {/* Country */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500">Country</label>
                      <input
                        value={form.country.name}
                        disabled
                        readOnly
                        className={readOnlyClass}
                      />
                      <p className="text-xs text-gray-400">Country is set via the phone field above.</p>
                    </div>

                    {/* City */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500">City</label>
                      <input
                        value={form.city}
                        disabled={!isEditing}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        onBlur={() => handleBlur("city")}
                        className={fieldClass("city")}
                        placeholder={isEditing ? "Your city" : ""}
                      />
                      {isEditing && touched.city && errors.city && (
                        <p className="text-xs text-red-500">{errors.city}</p>
                      )}
                    </div>

                    {/* Buttons */}
                    <div className="col-span-full flex items-center justify-center gap-3 mt-2">
                      {!isEditing ? (
                        <button
                          type="button"
                          onClick={handleEdit}
                          className="px-12 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
                        >
                          Edit Profile
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={handleCancel}
                            className="px-8 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={!isFormValid || updateMutation.isPending}
                            className="px-12 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updateMutation.isPending ? "Saving..." : "Save"}
                          </button>
                        </>
                      )}
                    </div>
                  </form>
                </>
              )
            )}

            {/* ── My Pets Tab ── */}
            {activeTab === "My Pets" && (
              petsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : !myPets || myPets.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <PawPrint className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-lg font-semibold text-[#1E2A3A]">No pets listed yet</p>
                  <p className="text-sm mt-1">Pets you list for adoption or fostering will appear here.</p>
                  <Link href="/adopt" className="mt-4 inline-block px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm">
                    Add a Pet
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <h2 className="font-display font-bold text-lg text-[#1E2A3A] mb-4">My Listed Pets</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {myPets.map((pet) => (
                      <Link key={pet.id} href={`/pets/${pet.id}`}>
                        <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-all cursor-pointer">
                          <img
                            src={pet.imageUrls?.[0] || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400"}
                            alt={pet.name}
                            className="w-full h-28 object-cover"
                          />
                          <div className="p-3">
                            <p className="font-bold text-sm text-[#1E2A3A]">{pet.name}</p>
                            <p className="text-xs text-gray-400 capitalize">{pet.type} · {pet.city}</p>
                            <StatusBadge status={pet.status} />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            )}

            {/* ── Applications Tab ── */}
            {activeTab === "Applications" && (
              appLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-6">
                  <h2 className="font-display font-bold text-lg text-[#1E2A3A]">My Applications</h2>

                  {(applications?.adoptionRequests?.length ?? 0) > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Adoption Requests</h3>
                      <div className="space-y-2">
                        {applications?.adoptionRequests?.map((req) => (
                          <div key={req.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <img
                              src={req.petImageUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200"}
                              alt={req.petName || "Pet"}
                              className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-[#1E2A3A] truncate">{req.petName || "Unknown Pet"}</p>
                              <p className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</p>
                            </div>
                            <StatusBadge status={req.status} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(applications?.fosterRequests?.length ?? 0) > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Foster Requests</h3>
                      <div className="space-y-2">
                        {applications?.fosterRequests?.map((req) => (
                          <div key={req.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <img
                              src={req.petImageUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200"}
                              alt={req.petName || "Pet"}
                              className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-[#1E2A3A] truncate">{req.petName || "Unknown Pet"}</p>
                              <p className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</p>
                            </div>
                            <StatusBadge status={req.status} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!applications?.adoptionRequests?.length && !applications?.fosterRequests?.length && (
                    <div className="text-center py-16 text-gray-400">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-lg font-semibold text-[#1E2A3A]">No applications yet</p>
                      <p className="text-sm mt-1">Your adoption and foster applications will appear here.</p>
                    </div>
                  )}
                </div>
              )
            )}

            {/* ── Favourite Tab ── */}
            {activeTab === "Favourite" && (
              favLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : !favourites || favourites.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-lg font-semibold text-[#1E2A3A]">No favourites yet</p>
                  <p className="text-sm mt-1">Save pets to your favourites while browsing.</p>
                  <Link href="/adopt" className="mt-4 inline-block px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm">
                    Browse Pets
                  </Link>
                </div>
              ) : (
                <div>
                  <h2 className="font-display font-bold text-lg text-[#1E2A3A] mb-4">Saved Pets</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {favourites.map((pet) => (
                      <Link key={pet.id} href={`/pets/${pet.id}`}>
                        <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-all cursor-pointer">
                          <img
                            src={pet.imageUrls?.[0] || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400"}
                            alt={pet.name}
                            className="w-full h-28 object-cover"
                          />
                          <div className="p-3">
                            <p className="font-bold text-sm text-[#1E2A3A]">{pet.name}</p>
                            <p className="text-xs text-gray-400 capitalize">{pet.type} · {pet.city}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            )}

            {/* ── Notifications Tab ── */}
            {activeTab === "Notifications" && (
              <div className="space-y-8">
                <div>
                  <h2 className="font-display font-bold text-lg text-[#1E2A3A] mb-4">Notifications</h2>
                  <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100 text-gray-400">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-semibold text-[#1E2A3A]">No notifications yet</p>
                    <p className="text-sm mt-1">You'll be notified about adoption updates, messages, and more.</p>
                  </div>
                </div>

                <div>
                  <h2 className="font-display font-bold text-lg text-[#1E2A3A] mb-4">Donation History</h2>
                  {donLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : !donations || donations.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100 text-gray-400">
                      <p className="font-semibold text-[#1E2A3A]">No donations yet</p>
                      <p className="text-sm mt-1">Your donation activity will appear here.</p>
                      <Link href="/donate" className="mt-4 inline-block px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm">
                        Make a Donation
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {donations.map((don) => (
                        <div key={don.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div>
                            <p className="font-bold text-sm text-[#1E2A3A] capitalize">{don.type} donation</p>
                            <p className="text-xs text-gray-400">{new Date(don.createdAt).toLocaleDateString()}</p>
                            {don.description && <p className="text-xs text-gray-500 mt-0.5">{don.description}</p>}
                          </div>
                          {don.amount && (
                            <span className="font-bold text-primary text-sm">{don.amount} JD</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Lost&Found Tab ── */}
            {activeTab === "Lost&Found" && (
              lfLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div>
                  <h2 className="font-display font-bold text-lg text-[#1E2A3A] mb-4">Recent Lost & Found Reports</h2>
                  {!lostFoundData?.reports || lostFoundData.reports.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                      <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-lg font-semibold text-[#1E2A3A]">No reports yet</p>
                      <Link href="/lost-found" className="mt-4 inline-block px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm">
                        View Lost & Found
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {lostFoundData.reports.slice(0, 6).map((report) => (
                        <div key={report.id} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                          <div className="relative">
                            <img
                              src={report.imageUrls?.[0] || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400"}
                              alt={report.name}
                              className="w-full h-24 object-cover"
                            />
                            <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-white text-xs font-bold ${report.reportType === "lost" ? "bg-red-500" : "bg-[#00B8A0]"}`}>
                              {report.reportType === "lost" ? "LOST" : "FOUND"}
                            </span>
                          </div>
                          <div className="p-3">
                            <p className="font-bold text-sm text-[#1E2A3A]">{report.name}</p>
                            <p className="text-xs text-gray-400 capitalize">{report.type} · {report.city}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 text-center">
                    <Link href="/lost-found" className="text-primary text-sm font-bold hover:underline">
                      View All Reports →
                    </Link>
                  </div>
                </div>
              )
            )}

            {/* ── Volunteer Tab ── */}
            {activeTab === "Volunteer" && (
              <div className="text-center py-16 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-lg font-semibold text-[#1E2A3A]">Volunteer opportunities</p>
                <p className="text-sm mt-1">Coming soon.</p>
              </div>
            )}

            {/* ── Settings Tab ── */}
            {activeTab === "Settings" && (
              <div className="text-center py-16 text-gray-400">
                <Settings className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-lg font-semibold text-[#1E2A3A]">Settings</p>
                <p className="text-sm mt-1">Coming soon.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

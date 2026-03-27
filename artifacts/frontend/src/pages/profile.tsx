import { useState, useEffect, useRef, useMemo } from "react";
import {
  User, PawPrint, FileText, Heart, Bell, Users, MapPin, Edit2, Loader2, CheckCircle2, Clock, XCircle, ChevronDown, Search, X, Eye, EyeOff, LogOut, Plus, Camera,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Link, useLocation } from "wouter";
import {
  useGetMyProfile, useUpdateMyProfile, useGetMyPets, useGetMyApplications, useGetMyFavourites, useListLostFoundReports, useCreatePet, type Pet,
} from "@workspace/api-client-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface PetNotification {
  id: number;
  userId: number;
  petId: number | null;
  petName: string | null;
  status: "accepted" | "rejected";
  message: string;
  read: boolean;
  createdAt: string;
}

function useGetMyNotifications() {
  return useQuery<PetNotification[]>({
    queryKey: ["/api/users/me/notifications"],
    queryFn: async () => {
      const res = await fetch("/api/users/me/notifications", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json();
    },
  });
}

function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/users/me/notifications/${id}/read`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to mark as read");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/me/notifications"] });
    },
  });
}
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

function calculateAge(birthday: string): string {
  if (!birthday) return "";
  const birth = new Date(birthday);
  const now = new Date();
  const totalMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (totalMonths < 0) return "";
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (years === 0) return `${months} month${months !== 1 ? "s" : ""}`;
  if (months === 0) return `${years} year${years !== 1 ? "s" : ""}`;
  return `${years} yr${years !== 1 ? "s" : ""} ${months} mo`;
}

interface AddPetModalProps {
  onClose: () => void;
  onSuccess: () => void;
  userName: string;
}

function AddPetModal({ onClose, onSuccess, userName }: AddPetModalProps) {
  const { toast } = useToast();
  const createPet = useCreatePet();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [section, setSection] = useState<1 | 2>(1);

  const [form, setForm] = useState({
    name: "",
    type: "dog",
    breed: "",
    birthday: "",
    gender: "male",
    weightKg: "",
    sterilized: false as boolean,
    yearlyVaccines: false as boolean,
    story: "",
    whatsappUrl: "",
    purpose: "adopt" as "adopt" | "foster" | "both",
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const ageDisplay = useMemo(() => calculateAge(form.birthday), [form.birthday]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const newFiles = [...imageFiles, ...files];
    const newPreviews = [...imagePreviews, ...files.map(f => URL.createObjectURL(f))];
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const removeImage = (idx: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== idx);
    const newPreviews = imagePreviews.filter((_, i) => i !== idx);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const validateSection1 = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Pet name is required";
    if (!form.type) e.type = "Type is required";
    if (!form.breed.trim()) e.breed = "Breed is required";
    if (!form.birthday) e.birthday = "Birthdate is required";
    if (!form.gender) e.gender = "Gender is required";
    if (!form.weightKg.trim()) e.weightKg = "Weight is required";
    if (!form.story.trim()) e.story = "Pet story is required";
    if (imageFiles.length === 0) e.images = "At least one photo is required";
    return e;
  };

  const validateSection2 = () => {
    const e: Record<string, string> = {};
    if (!form.whatsappUrl.trim()) e.whatsappUrl = "WhatsApp URL is required";
    if (!form.purpose) e.purpose = "Availability type is required";
    return e;
  };

  const handleNext = () => {
    const e = validateSection1();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      const touchAll: Record<string, boolean> = {};
      Object.keys(e).forEach(k => { touchAll[k] = true; });
      setTouched(touchAll);
      return;
    }
    setErrors({});
    setSection(2);
  };

  const filesToBase64 = (files: File[]): Promise<string[]> => {
    return Promise.all(
      files.map(
        file =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const e2 = validateSection2();
    if (Object.keys(e2).length > 0) {
      setErrors(e2);
      const touchAll: Record<string, boolean> = {};
      Object.keys(e2).forEach(k => { touchAll[k] = true; });
      setTouched(touchAll);
      return;
    }

    let imageUrls: string[] = imagePreviews;
    try {
      if (imageFiles.length > 0) {
        imageUrls = await filesToBase64(imageFiles);
      }
    } catch {
      imageUrls = imagePreviews;
    }

    const ageMonths = (() => {
      if (!form.birthday) return 0;
      const birth = new Date(form.birthday);
      const now = new Date();
      return Math.max(0, (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth()));
    })();

    createPet.mutate(
      {
        data: {
          name: form.name,
          type: form.type as Pet["type"],
          breed: form.breed || undefined,
          gender: form.gender as "male" | "female",
          ageMonths,
          weightKg: form.weightKg || undefined,
          size: "medium",
          city: "Jordan",
          purpose: form.purpose,
          sterilized: form.sterilized,
          yearlyVaccines: form.yearlyVaccines,
          birthday: form.birthday || undefined,
          story: form.story || undefined,
          imageUrls,
          whatsappUrl: form.whatsappUrl || undefined,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Your pet has been submitted for review" });
          onSuccess();
          onClose();
        },
        onError: () => {
          toast({ title: "Failed to submit pet. Please try again.", variant: "destructive" });
        },
      }
    );
  };

  const inputCls = (field: string) =>
    `w-full border rounded-xl px-3 py-2.5 text-sm text-[#1E2A3A] outline-none focus:ring-2 transition-colors ${
      touched[field] && errors[field]
        ? "border-red-400 focus:ring-red-200"
        : "border-gray-200 focus:ring-primary/20"
    }`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-[#1E2A3A]">Add a Pet</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {section === 1 ? "Section 1 of 2 — Pet Information" : "Section 2 of 2 — Owner Information"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {section === 1 && (
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Pet Name *</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    onBlur={() => setTouched(t => ({ ...t, name: true }))}
                    className={inputCls("name")}
                    placeholder="e.g. Buddy"
                  />
                  {touched.name && errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Type *</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className={inputCls("type")}
                  >
                    {["dog", "cat", "rabbit", "bird", "other"].map(t => (
                      <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Breed *</label>
                  <input
                    value={form.breed}
                    onChange={e => setForm(f => ({ ...f, breed: e.target.value }))}
                    onBlur={() => setTouched(t => ({ ...t, breed: true }))}
                    className={inputCls("breed")}
                    placeholder="e.g. Labrador"
                  />
                  {touched.breed && errors.breed && <p className="text-xs text-red-500 mt-0.5">{errors.breed}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Birthdate *</label>
                  <input
                    type="date"
                    value={form.birthday}
                    onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))}
                    onBlur={() => setTouched(t => ({ ...t, birthday: true }))}
                    max={new Date().toISOString().split("T")[0]}
                    className={inputCls("birthday")}
                  />
                  {touched.birthday && errors.birthday && <p className="text-xs text-red-500 mt-0.5">{errors.birthday}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Age (auto-calculated)</label>
                  <input
                    value={ageDisplay}
                    readOnly
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-500 cursor-default outline-none"
                    placeholder="Select birthdate"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Gender *</label>
                  <select
                    value={form.gender}
                    onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                    className={inputCls("gender")}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Weight (kg) *</label>
                  <input
                    value={form.weightKg}
                    onChange={e => setForm(f => ({ ...f, weightKg: e.target.value }))}
                    onBlur={() => setTouched(t => ({ ...t, weightKg: true }))}
                    className={inputCls("weightKg")}
                    placeholder="e.g. 5.2"
                    type="number"
                    step="0.1"
                    min="0"
                  />
                  {touched.weightKg && errors.weightKg && <p className="text-xs text-red-500 mt-0.5">{errors.weightKg}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Sterilized *</label>
                  <div className="flex gap-2">
                    {[true, false].map(val => (
                      <button
                        key={String(val)}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, sterilized: val }))}
                        className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                          form.sterilized === val
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {val ? "Yes" : "No"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Yearly Vaccines *</label>
                  <div className="flex gap-2">
                    {[true, false].map(val => (
                      <button
                        key={String(val)}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, yearlyVaccines: val }))}
                        className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                          form.yearlyVaccines === val
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {val ? "Yes" : "No"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Pet Story *</label>
                <textarea
                  value={form.story}
                  onChange={e => setForm(f => ({ ...f, story: e.target.value }))}
                  onBlur={() => setTouched(t => ({ ...t, story: true }))}
                  rows={3}
                  className={`${inputCls("story")} resize-none`}
                  placeholder="Tell us about your pet's personality, history, and what makes them special..."
                />
                {touched.story && errors.story && <p className="text-xs text-red-500 mt-0.5">{errors.story}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">Photos *</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors hover:bg-gray-50 ${
                    touched.images && errors.images ? "border-red-400" : "border-gray-200"
                  }`}
                >
                  <Camera className="w-6 h-6 mx-auto mb-1.5 text-gray-300" />
                  <p className="text-sm text-gray-500">Click to upload photos</p>
                  <p className="text-xs text-gray-400 mt-0.5">Multiple photos allowed</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
                {touched.images && errors.images && <p className="text-xs text-red-500 mt-0.5">{errors.images}</p>}
                {imagePreviews.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {imagePreviews.map((src, idx) => (
                      <div key={idx} className="relative">
                        <img src={src} alt={`preview ${idx}`} className="w-16 h-16 object-cover rounded-xl border border-gray-200" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
                >
                  Next: Owner Info →
                </button>
              </div>
            </div>
          )}

          {section === 2 && (
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Your Name</label>
                <input
                  value={userName}
                  readOnly
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-500 cursor-default outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">WhatsApp URL *</label>
                <input
                  value={form.whatsappUrl}
                  onChange={e => setForm(f => ({ ...f, whatsappUrl: e.target.value }))}
                  onBlur={() => setTouched(t => ({ ...t, whatsappUrl: true }))}
                  className={inputCls("whatsappUrl")}
                  placeholder="https://wa.me/9627xxxxxxxx"
                  type="url"
                />
                {touched.whatsappUrl && errors.whatsappUrl && (
                  <p className="text-xs text-red-500 mt-0.5">{errors.whatsappUrl}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">Format: https://wa.me/[country code][number]</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">Availability *</label>
                <div className="flex gap-2">
                  {[
                    { value: "adopt", label: "Adoption" },
                    { value: "foster", label: "Foster" },
                    { value: "both", label: "Both" },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, purpose: opt.value as "adopt" | "foster" | "both" }))}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                        form.purpose === opt.value
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setSection(1)}
                  className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={createPet.isPending}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {createPet.isPending ? (
                    <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</span>
                  ) : (
                    "Submit Pet"
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function buildInitialForm(profile: { fullName?: string | null; email?: string | null; phone?: string | null; country?: string | null; city?: string | null } | null): FormState {
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
  const { logout } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("Profile");
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const { data: profile, isLoading } = useGetMyProfile();
  const updateMutation = useUpdateMyProfile();
  const { data: myPets, isLoading: petsLoading, refetch: refetchPets } = useGetMyPets();
  const { data: applications, isLoading: appLoading } = useGetMyApplications();
  const { data: favourites, isLoading: favLoading } = useGetMyFavourites();
  const { data: notifications, isLoading: notifLoading } = useGetMyNotifications();
  const markRead = useMarkNotificationRead();
  const { data: lostFoundData, isLoading: lfLoading } = useListLostFoundReports({ limit: 20 });

  const [showAddPetModal, setShowAddPetModal] = useState(false);
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

  const handleLogoutConfirm = async () => {
    await logout();
    setLocation("/");
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
    <div>
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
              <div className="pt-2 border-t border-white/10 mt-2">
                <button
                  onClick={() => setShowLogoutDialog(true)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors text-red-300 hover:bg-red-500/20 hover:text-red-200"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
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
              <>
                {showAddPetModal && (
                  <AddPetModal
                    onClose={() => setShowAddPetModal(false)}
                    onSuccess={() => refetchPets()}
                    userName={profile?.fullName ?? ""}
                  />
                )}
                {petsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="font-display font-bold text-lg text-[#1E2A3A]">My Pets</h2>
                      <button
                        onClick={() => setShowAddPetModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Add Pet
                      </button>
                    </div>
                    {(!myPets || myPets.length === 0) ? (
                      <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-gray-100">
                        <PawPrint className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-base font-semibold text-[#1E2A3A]">No pets listed yet</p>
                        <p className="text-sm mt-1">Click "Add Pet" to submit a pet for adoption or fostering.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {(myPets as (Pet & { rejected?: boolean })[]).map((pet) => {
                          const approvalStatus = pet.rejected ? "rejected" : pet.approved ? "approved" : "pending";
                          const badgeMap = {
                            approved: { color: "bg-green-100 text-green-700", icon: CheckCircle2, label: "Approved" },
                            pending: { color: "bg-yellow-100 text-yellow-700", icon: Clock, label: "Pending" },
                            rejected: { color: "bg-red-100 text-red-600", icon: XCircle, label: "Rejected" },
                          };
                          const badge = badgeMap[approvalStatus];
                          const BadgeIcon = badge.icon;
                          return (
                            <div key={pet.id} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-all">
                              <div className="relative">
                                <img
                                  src={pet.imageUrls?.[0] || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400"}
                                  alt={pet.name}
                                  className="w-full h-28 object-cover"
                                />
                              </div>
                              <div className="p-3">
                                <p className="font-bold text-sm text-[#1E2A3A] truncate">{pet.name}</p>
                                <p className="text-xs text-gray-400 capitalize mb-2">{pet.type} · {pet.breed || "Mixed"}</p>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${badge.color}`}>
                                  <BadgeIcon className="w-3 h-3" />
                                  {badge.label}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
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
              <div className="space-y-4">
                <h2 className="font-display font-bold text-lg text-[#1E2A3A]">Notifications</h2>
                {notifLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : !notifications || notifications.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100 text-gray-400">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-semibold text-[#1E2A3A]">No notifications yet</p>
                    <p className="text-sm mt-1">You'll be notified when your pet submissions are reviewed.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => { if (!notif.read) markRead.mutate(notif.id); }}
                        className={`w-full text-left flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                          notif.read
                            ? "bg-white border-gray-100 opacity-70"
                            : "bg-primary/5 border-primary/20 hover:bg-primary/10"
                        }`}
                      >
                        <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                          notif.status === "accepted" ? "bg-green-100" : "bg-red-100"
                        }`}>
                          {notif.status === "accepted"
                            ? <CheckCircle2 className="w-5 h-5 text-green-600" />
                            : <XCircle className="w-5 h-5 text-red-500" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-[#1E2A3A]">
                              {notif.petName ?? "Your pet"}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                              notif.status === "accepted"
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-500"
                            }`}>
                              {notif.status === "accepted" ? "Accepted" : "Rejected"}
                            </span>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
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

          </div>
        </div>
      </div>
    </div>

    {/* Log Out Confirmation Dialog */}
    {showLogoutDialog && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-[#1E2A3A]">Log Out</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">Are you sure you want to log out?</p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowLogoutDialog(false)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-[#1E2A3A] hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleLogoutConfirm}
              className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}

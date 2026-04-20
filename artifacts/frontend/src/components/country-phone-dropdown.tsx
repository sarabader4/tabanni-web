import { useState, useEffect, useMemo, useRef } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import {
  getCountries,
  getCountryCallingCode,
  AsYouType,
  type CountryCode,
} from "libphonenumber-js";

export type { CountryCode };

const REGION_NAMES = new Intl.DisplayNames(["en"], { type: "region" });

export interface CountryOption {
  code: CountryCode;
  name: string;
  dialCode: string;
  flag: string;
}

export function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export const ALL_COUNTRIES: CountryOption[] = getCountries()
  .map((code) => {
    const name = REGION_NAMES.of(code) ?? code;
    const dialCode = `+${getCountryCallingCode(code)}`;
    return { code, name, dialCode, flag: getFlagEmoji(code) };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

export function findCountryByName(name: string): CountryOption | undefined {
  return ALL_COUNTRIES.find((c) => c.name.toLowerCase() === name.toLowerCase());
}

export function findCountryByCode(code: string): CountryOption | undefined {
  return ALL_COUNTRIES.find((c) => c.code === code);
}

export const DEFAULT_COUNTRY: CountryOption =
  findCountryByCode("JO") ?? ALL_COUNTRIES[0];

export interface CountryPhoneDropdownProps {
  selectedCountry: CountryOption;
  onCountryChange: (country: CountryOption) => void;
  phoneValue: string;
  onPhoneChange: (val: string) => void;
  disabled?: boolean;
  error?: string;
  touched?: boolean;
  label?: string;
  instanceId?: string;
}

export function CountryPhoneDropdown({
  selectedCountry,
  onCountryChange,
  phoneValue,
  onPhoneChange,
  disabled,
  error,
  touched,
  label = "Phone Number",
  instanceId = "default",
}: CountryPhoneDropdownProps) {
  const LISTBOX_ID = `country-listbox-${instanceId}`;
  const LABEL_ID = `phone-label-${instanceId}`;
  const ERROR_ID = `phone-error-${instanceId}`;

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
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [search]);

  useEffect(() => {
    if (open) {
      setFocusedIndex(
        Math.max(0, filtered.findIndex((c) => c.code === selectedCountry.code))
      );
      setTimeout(() => searchRef.current?.focus(), 50);
    } else {
      setSearch("");
    }
  }, [open]);

  useEffect(() => {
    if (open) setFocusedIndex(0);
  }, [search]);

  useEffect(() => {
    if (open && listRef.current) {
      const item = listRef.current.querySelectorAll("[role='option']")[
        focusedIndex
      ] as HTMLElement | undefined;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [focusedIndex, open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
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
      <label id={LABEL_ID} className="text-xs font-semibold text-gray-500">
        {label}
      </label>
      <div
        className={`flex rounded-xl border overflow-visible ${
          hasError ? "border-red-400" : "border-gray-200"
        } ${disabled ? "bg-gray-50" : "bg-white"}`}
      >
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
              if (
                (e.key === "Enter" ||
                  e.key === " " ||
                  e.key === "ArrowDown") &&
                !disabled
              ) {
                e.preventDefault();
                setOpen(true);
              } else if (e.key === "Escape") {
                setOpen(false);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-[#333E48] border-r border-gray-200 rounded-l-xl transition-colors h-full ${
              disabled
                ? "cursor-default opacity-60 bg-gray-50"
                : "hover:bg-gray-50 cursor-pointer"
            }`}
          >
            <span className="text-base leading-none" aria-hidden="true">
              {selectedCountry.flag}
            </span>
            <span className="text-xs text-gray-500">
              {selectedCountry.dialCode}
            </span>
            {!disabled && (
              <ChevronDown
                className={`w-3 h-3 text-gray-400 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            )}
          </button>

          {open && (
            <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="p-2 border-b border-gray-100">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                  <Search
                    className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <input
                    ref={searchRef}
                    role="combobox"
                    aria-autocomplete="list"
                    aria-controls={LISTBOX_ID}
                    aria-activedescendant={
                      filtered[focusedIndex]
                        ? `country-option-${instanceId}-${filtered[focusedIndex].code}`
                        : undefined
                    }
                    aria-label="Search country"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Search country..."
                    className="flex-1 bg-transparent text-sm outline-none text-[#333E48] placeholder-gray-400"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="text-gray-400 hover:text-gray-600"
                      aria-label="Clear search"
                    >
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
                  <p className="text-sm text-gray-400 text-center py-4">
                    No results
                  </p>
                ) : (
                  filtered.map((c, idx) => (
                    <button
                      key={c.code}
                      id={`country-option-${instanceId}-${c.code}`}
                      role="option"
                      aria-selected={c.code === selectedCountry.code}
                      type="button"
                      onClick={() => {
                        onCountryChange(c);
                        setOpen(false);
                        triggerRef.current?.focus();
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-start transition-colors hover:bg-gray-50 ${
                        c.code === selectedCountry.code
                          ? "bg-primary/5 font-semibold"
                          : ""
                      } ${idx === focusedIndex ? "bg-gray-100 outline-none" : ""}`}
                    >
                      <span className="text-base" aria-hidden="true">
                        {c.flag}
                      </span>
                      <span className="flex-1 text-[#333E48] truncate">
                        {c.name}
                      </span>
                      <span className="text-gray-400 text-xs font-mono">
                        {c.dialCode}
                      </span>
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
          aria-labelledby={LABEL_ID}
          aria-invalid={hasError}
          aria-describedby={hasError ? ERROR_ID : undefined}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^\d\s\-().+]/g, "");
            const formatter = new AsYouType(selectedCountry.code);
            const formatted = formatter.input(raw.replace(/\D/g, ""));
            onPhoneChange(formatted);
          }}
          className={`flex-1 px-3 py-2.5 text-sm text-[#333E48] outline-none rounded-r-xl focus:ring-2 focus:ring-inset ${
            hasError ? "focus:ring-red-300" : "focus:ring-primary/20"
          } ${disabled ? "bg-gray-50 text-gray-500" : "bg-white"}`}
          placeholder={disabled ? "" : "Enter phone number"}
        />
      </div>
      {hasError && (
        <p id={ERROR_ID} className="text-xs text-red-500 mt-0.5" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

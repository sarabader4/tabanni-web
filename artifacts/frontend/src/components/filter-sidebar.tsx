import { ChevronDown, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { FilterBarState } from "@/components/filter-bar";

const petTypes = ["Dog", "Cat", "Other"];
const genders = ["Male", "Female"];
const sizes = ["Small", "Medium", "Large"];
const cities = [
  "Amman", "Zarqa", "Irbid", "Aqaba", "Salt", "Madaba",
  "Karak", "Tafila", "Ma'an", "Jerash", "Ajloun", "Mafraq",
];
const breedsByType: Record<string, string[]> = {
  dog: ["Golden Retriever", "Husky", "Labrador", "German Shepherd", "Poodle", "Beagle", "Bulldog", "Rottweiler", "Shih Tzu", "Mixed"],
  cat: ["Persian", "Siamese", "Maine Coon", "British Shorthair", "Ragdoll", "Abyssinian", "Bengal", "Sphynx", "Mixed"],
  other: ["Mixed", "Other"],
};

export interface FilterSidebarProps {
  filters: FilterBarState;
  onChange: (filters: FilterBarState) => void;
  purpose?: string;
  onPurposeChange?: (v: string) => void;
  reportType?: "lost" | "found";
  onReportTypeChange?: (v: "lost" | "found") => void;
  onClear?: () => void;
  onClose?: () => void;
}

function SidebarSelect({
  label,
  value,
  placeholder,
  options,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const active = value !== "";
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none border rounded-xl ps-3 pe-8 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer transition-colors ${
            active
              ? "border-primary/50 bg-primary/5 text-[#333E48]"
              : "border-gray-200 bg-white text-gray-400 hover:border-primary/40"
          }`}
        >
          <option value="">{placeholder ?? label}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className={`absolute end-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
            active ? "text-primary" : "text-gray-400"
          }`}
        />
      </div>
    </div>
  );
}

export function FilterSidebar({
  filters,
  onChange,
  purpose,
  onPurposeChange,
  reportType,
  onReportTypeChange,
  onClear,
  onClose,
}: FilterSidebarProps) {
  const { t } = useTranslation();

  const update = (key: keyof FilterBarState, value: string) =>
    onChange({ ...filters, [key]: value });

  const currentBreeds = filters.type ? (breedsByType[filters.type] ?? []) : [];

  const petTypeOptions = petTypes.map(pt => ({ value: pt.toLowerCase(), label: t(`filters.${pt.toLowerCase()}`) }));
  const genderOptions = genders.map(g => ({ value: g.toLowerCase(), label: t(`filters.${g.toLowerCase()}`) }));
  const sizeOptions = sizes.map(s => ({ value: s.toLowerCase(), label: t(`filters.${s.toLowerCase()}`) }));
  const cityOptions = cities.map(c => ({ value: c.toLowerCase(), label: c }));
  const breedOptions = currentBreeds.map(b => ({ value: b.toLowerCase(), label: b }));

  const ageOptions = [
    { value: "< 1 year", label: t("filters.ageUnder1") },
    { value: "1–3 years", label: t("filters.age1to3") },
    { value: "3–5 years", label: t("filters.age3to5") },
    { value: "5+ years", label: t("filters.age5plus") },
  ];

  const sterilizedOptions = [
    { value: "yes", label: t("common.yes") },
    { value: "no", label: t("common.no") },
  ];

  const purposeSelectOptions = [
    { value: "adopt", label: t("adopt.adopt") },
    { value: "foster", label: t("adopt.foster") },
    { value: "both", label: t("adopt.adoptFoster") },
  ];

  const isLostFound = reportType !== undefined;

  const activeCount = [
    purpose !== "both" && purpose ? 1 : 0,
    filters.city ? 1 : 0,
    filters.type ? 1 : 0,
    filters.breed ? 1 : 0,
    filters.gender ? 1 : 0,
    filters.minAge ? 1 : 0,
    filters.size ? 1 : 0,
    !isLostFound && filters.sterilized ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-[#333E48]">{t("filters.filters")}</span>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 bg-primary text-white text-xs font-bold rounded-full leading-none">
              {activeCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {onClear && activeCount > 0 && (
            <button
              onClick={onClear}
              className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              {t("adopt.clearFilters")}
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close filters"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Sections */}
      <div className="p-5 space-y-5">
        {/* Lost / Found toggle */}
        {isLostFound && onReportTypeChange && (
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              {t("lostFound.reportType")}
            </label>
            <div className="flex rounded-xl overflow-hidden border border-gray-200">
              <button
                onClick={() => onReportTypeChange("lost")}
                className={`flex-1 py-2.5 text-sm font-bold transition-colors ${
                  reportType === "lost"
                    ? "bg-primary text-white"
                    : "bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                {t("lostFound.lost")}
              </button>
              <button
                onClick={() => onReportTypeChange("found")}
                className={`flex-1 py-2.5 text-sm font-bold transition-colors border-s border-gray-200 ${
                  reportType === "found"
                    ? "bg-[#3D937F] text-white"
                    : "bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                {t("lostFound.found")}
              </button>
            </div>
          </div>
        )}

        {/* Purpose */}
        {onPurposeChange && (
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              {t("filters.adoptOrFoster")}
            </label>
            <div className="relative">
              <select
                value={purpose ?? "both"}
                onChange={(e) => onPurposeChange(e.target.value)}
                className="w-full appearance-none bg-white border border-gray-200 rounded-xl ps-3 pe-8 py-2.5 text-sm text-[#333E48] font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer hover:border-primary/40 transition-colors"
                aria-label={t("filters.adoptOrFoster")}
              >
                {purposeSelectOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute end-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}

        <SidebarSelect
          label={t("filters.city")}
          value={filters.city}
          options={cityOptions}
          onChange={(v) => update("city", v)}
        />

        <SidebarSelect
          label={t("filters.petType")}
          value={filters.type}
          options={petTypeOptions}
          onChange={(v) => onChange({ ...filters, type: v, breed: "" })}
        />

        <SidebarSelect
          label={t("filters.breed")}
          value={filters.breed}
          placeholder={filters.type ? t("filters.breed") : t("filters.selectTypeFirst")}
          options={breedOptions}
          onChange={(v) => update("breed", v)}
        />

        <SidebarSelect
          label={t("filters.gender")}
          value={filters.gender}
          options={genderOptions}
          onChange={(v) => update("gender", v)}
        />

        <SidebarSelect
          label={t("petDetail.age")}
          value={filters.minAge}
          options={ageOptions}
          onChange={(v) => update("minAge", v)}
        />

        <SidebarSelect
          label={t("filters.size")}
          value={filters.size}
          options={sizeOptions}
          onChange={(v) => update("size", v)}
        />

        {!isLostFound && (
          <SidebarSelect
            label={t("petDetail.sterilized")}
            value={filters.sterilized}
            options={sterilizedOptions}
            onChange={(v) => update("sterilized", v)}
          />
        )}
      </div>
    </div>
  );
}

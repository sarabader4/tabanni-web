import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface FilterBarState {
  type: string;
  gender: string;
  minAge: string;
  maxAge: string;
  size: string;
  city: string;
  breed: string;
  month: string;
  sterilized: string;
}

interface FilterBarProps {
  filters: FilterBarState;
  onChange: (filters: FilterBarState) => void;
  showMonth?: boolean;
  showSterilized?: boolean;
}

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

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white border border-gray-200 rounded-lg ps-3 pe-8 py-2 text-sm text-[#1E2A3A] font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer hover:border-primary/50 transition-colors"
      >
        <option value="">{label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute end-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
}

export function FilterBar({ filters, onChange, showMonth = false, showSterilized = false }: FilterBarProps) {
  const { t } = useTranslation();
  const update = (key: keyof FilterBarState, value: string) => {
    onChange({ ...filters, [key]: value });
  };

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

  const monthOptions = [
    { value: "january", label: t("filters.january") },
    { value: "february", label: t("filters.february") },
    { value: "march", label: t("filters.march") },
    { value: "april", label: t("filters.april") },
    { value: "may", label: t("filters.may") },
    { value: "june", label: t("filters.june") },
    { value: "july", label: t("filters.july") },
    { value: "august", label: t("filters.august") },
    { value: "september", label: t("filters.september") },
    { value: "october", label: t("filters.october") },
    { value: "november", label: t("filters.november") },
    { value: "december", label: t("filters.december") },
  ];

  const sterilizedOptions = [
    { value: "yes", label: t("common.yes") },
    { value: "no", label: t("common.no") },
  ];

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <FilterSelect
        label={t("filters.petType")}
        value={filters.type}
        options={petTypeOptions}
        onChange={(v) => onChange({ ...filters, type: v, breed: "" })}
      />
      <FilterSelect
        label={t("filters.gender")}
        value={filters.gender}
        options={genderOptions}
        onChange={(v) => update("gender", v)}
      />
      <FilterSelect
        label={t("petDetail.age")}
        value={filters.minAge}
        options={ageOptions}
        onChange={(v) => update("minAge", v)}
      />
      <FilterSelect
        label={t("filters.size")}
        value={filters.size}
        options={sizeOptions}
        onChange={(v) => update("size", v)}
      />
      <FilterSelect
        label={t("filters.city")}
        value={filters.city}
        options={cityOptions}
        onChange={(v) => update("city", v)}
      />
      <FilterSelect
        label={t("filters.breed")}
        value={filters.breed}
        options={breedOptions}
        onChange={(v) => update("breed", v)}
      />
      {showSterilized && (
        <FilterSelect
          label={t("petDetail.sterilized")}
          value={filters.sterilized}
          options={sterilizedOptions}
          onChange={(v) => update("sterilized", v)}
        />
      )}
      {showMonth && (
        <FilterSelect
          label={t("filters.month")}
          value={filters.month}
          options={monthOptions}
          onChange={(v) => update("month", v)}
        />
      )}
    </div>
  );
}

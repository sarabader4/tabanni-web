import { ChevronDown } from "lucide-react";

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

const petTypes = ["Dog", "Cat", "Rabbit", "Bird", "Other"];
const genders = ["Male", "Female"];
const sizes = ["Small", "Medium", "Large"];
const cities = [
  "Amman", "Zarqa", "Irbid", "Aqaba", "Salt", "Madaba",
  "Karak", "Tafila", "Ma'an", "Jerash", "Ajloun", "Mafraq",
];
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const breedsByType: Record<string, string[]> = {
  dog: ["Golden Retriever", "Husky", "Labrador", "German Shepherd", "Poodle", "Beagle", "Mixed"],
  cat: ["Persian", "Siamese", "Maine Coon", "British Shorthair", "Ragdoll", "Mixed"],
  rabbit: ["Holland Lop", "Mini Rex", "Lionhead", "Dutch", "Mixed"],
  bird: ["Parakeet", "Cockatiel", "Canary", "Lovebird", "African Grey", "Mixed"],
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
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm text-[#1E2A3A] font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer hover:border-primary/50 transition-colors"
      >
        <option value="">{label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt.toLowerCase()}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
}

export function FilterBar({ filters, onChange, showMonth = false, showSterilized = false }: FilterBarProps) {
  const update = (key: keyof FilterBarState, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const currentBreeds = filters.type ? (breedsByType[filters.type] ?? []) : [];

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <FilterSelect
        label="Type"
        value={filters.type}
        options={petTypes}
        onChange={(v) => onChange({ ...filters, type: v, breed: "" })}
      />
      <FilterSelect
        label="Gender"
        value={filters.gender}
        options={genders}
        onChange={(v) => update("gender", v)}
      />
      <FilterSelect
        label="Age"
        value={filters.minAge}
        options={["< 1 Year", "1–3 Years", "3–5 Years", "5+ Years"]}
        onChange={(v) => update("minAge", v)}
      />
      <FilterSelect
        label="Size"
        value={filters.size}
        options={sizes}
        onChange={(v) => update("size", v)}
      />
      <FilterSelect
        label="City"
        value={filters.city}
        options={cities}
        onChange={(v) => update("city", v)}
      />
      <FilterSelect
        label="Breed"
        value={filters.breed}
        options={currentBreeds}
        onChange={(v) => update("breed", v)}
      />
      {showSterilized && (
        <FilterSelect
          label="Sterilized"
          value={filters.sterilized}
          options={["Yes", "No"]}
          onChange={(v) => update("sterilized", v)}
        />
      )}
      {showMonth && (
        <FilterSelect
          label="Month"
          value={filters.month}
          options={months}
          onChange={(v) => update("month", v)}
        />
      )}
    </div>
  );
}

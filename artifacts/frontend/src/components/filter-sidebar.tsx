import { Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface FilterState {
  search: string;
  type: string;
  gender: string;
  size: string;
  city: string;
}

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  title?: string;
}

const JORDAN_CITIES = [
  "Amman", "Zarqa", "Irbid", "Aqaba", "Salt", "Madaba",
  "Karak", "Tafila", "Ma'an", "Jerash", "Ajloun", "Mafraq",
];

export function FilterSidebar({ filters, onChange, title }: FilterSidebarProps) {
  const { t } = useTranslation();
  const updateFilter = (key: keyof FilterState, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const sidebarTitle = title ?? t("filters.filters");

  return (
    <div className="bg-card rounded-3xl p-6 border border-border shadow-sm sticky top-28">
      <h3 className="font-display font-bold text-xl mb-6">{sidebarTitle}</h3>

      <div className="space-y-6">
        {/* Search */}
        <div>
          <label className="text-sm font-bold text-foreground mb-2 block">{t("filters.search")}</label>
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("filters.searchPlaceholder")}
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="w-full bg-muted/50 border-none rounded-xl ps-10 pe-9 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
            />
            {filters.search && (
              <button
                onClick={() => updateFilter("search", "")}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={t("profile.ariaClearSearch")}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Type */}
        <div>
          <label className="text-sm font-bold text-foreground mb-2 block">{t("filters.petType")}</label>
          <div className="flex flex-wrap gap-2">
            {(["all", "dog", "cat", "rabbit", "bird", "other"] as const).map((type) => (
              <button
                key={type}
                onClick={() => updateFilter("type", type === "all" ? "" : type)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                  (filters.type === type || (type === "all" && !filters.type))
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {t(`filters.${type}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className="text-sm font-bold text-foreground mb-2 block">{t("filters.gender")}</label>
          <div className="flex flex-wrap gap-2">
            {(["all", "male", "female"] as const).map((gender) => (
              <button
                key={gender}
                onClick={() => updateFilter("gender", gender === "all" ? "" : gender)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                  (filters.gender === gender || (gender === "all" && !filters.gender))
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {t(`filters.${gender}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Size */}
        <div>
          <label className="text-sm font-bold text-foreground mb-2 block">{t("filters.size")}</label>
          <select
            value={filters.size}
            onChange={(e) => updateFilter("size", e.target.value)}
            className="w-full bg-muted/50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none appearance-none"
          >
            <option value="">{t("filters.anySize")}</option>
            <option value="small">{t("filters.small")}</option>
            <option value="medium">{t("filters.medium")}</option>
            <option value="large">{t("filters.large")}</option>
          </select>
        </div>

        {/* City */}
        <div>
          <label className="text-sm font-bold text-foreground mb-2 block">{t("filters.city")}</label>
          <select
            value={filters.city}
            onChange={(e) => updateFilter("city", e.target.value)}
            className="w-full bg-muted/50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none appearance-none"
          >
            <option value="">{t("filters.anyCity")}</option>
            {JORDAN_CITIES.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={() => onChange({ search: "", type: "", gender: "", size: "", city: "" })}
          className="w-full py-2.5 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("filters.resetFilters")}
        </button>
      </div>
    </div>
  );
}

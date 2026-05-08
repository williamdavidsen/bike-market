import { SlidersHorizontal } from "lucide-react";
import type { ProductListQuery, ProductSort } from "../../types/api";
import { Button } from "../ui/Button";

type ProductToolbarProps = {
  total: number;
  sort: ProductSort;
  onSortChange: (sort: ProductSort) => void;
  onOpenFilters: () => void;
};

const sortOptions: Array<{ label: string; value: ProductSort }> = [
  { label: "Nyheter", value: "newest" },
  { label: "Bestselgere", value: "bestsellers" },
  { label: "Pris lav-høy", value: "price_asc" },
  { label: "Pris høy-lav", value: "price_desc" },
  { label: "Navn A-A", value: "name_asc" }
];

export function normalizeSort(value: ProductListQuery["sort"] | string | undefined): ProductSort {
  if (value === "bestsellers" || value === "price_asc" || value === "price_desc" || value === "name_asc") {
    return value;
  }

  return "newest";
}

export function ProductToolbar({ total, sort, onSortChange, onOpenFilters }: ProductToolbarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg bg-white p-3 ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-semibold text-slate-600">{total} produkter</p>
      <div className="flex gap-3">
        <Button className="gap-2 lg:hidden" onClick={onOpenFilters} type="button" variant="ghost">
          <SlidersHorizontal size={18} /> Filtrer
        </Button>
        <label className="flex items-center gap-2 text-sm font-bold text-slate-950">
          Sorter
          <select
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold"
            onChange={(event) => onSortChange(event.target.value as ProductSort)}
            value={sort}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

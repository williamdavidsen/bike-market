import type { ChangeEvent, FormEvent } from "react";
import type { Brand, Category, ProductListQuery } from "../../types/api";
import { Button } from "../ui/Button";

type ProductFiltersProps = {
  brands: Brand[];
  categories: Category[];
  filters: ProductListQuery;
  onChange: (name: keyof ProductListQuery, value: string) => void;
  onClear: () => void;
  showCategory?: boolean;
};

const sizeOptions = ["S", "M", "L", "XL", "20", "24", "28"];
const colorOptions = ["Svart", "Hvit", "Grønn", "Blå", "Rød"];

export function ProductFilters({
  brands,
  categories,
  filters,
  onChange,
  onClear,
  showCategory = true
}: ProductFiltersProps) {
  const handleInput = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onChange(event.target.name as keyof ProductListQuery, event.target.value);
  };

  const handleCheckbox = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.name as keyof ProductListQuery, event.target.checked ? "true" : "");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {showCategory ? (
        <div>
          <label className="text-sm font-bold text-slate-950" htmlFor="filter-category">
            Kategori
          </label>
          <select
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
            id="filter-category"
            name="category"
            onChange={handleInput}
            value={filters.category ?? ""}
          >
            <option value="">Alle kategorier</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div>
        <label className="text-sm font-bold text-slate-950" htmlFor="filter-brand">
          Merke
        </label>
        <select
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
          id="filter-brand"
          name="brand"
          onChange={handleInput}
          value={filters.brand ?? ""}
        >
          <option value="">Alle merker</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.slug}>
              {brand.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-bold text-slate-950" htmlFor="filter-min-price">
            Min pris
          </label>
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
            id="filter-min-price"
            min="0"
            name="minPrice"
            onChange={handleInput}
            placeholder="0"
            type="number"
            value={filters.minPrice ?? ""}
          />
        </div>
        <div>
          <label className="text-sm font-bold text-slate-950" htmlFor="filter-max-price">
            Maks pris
          </label>
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
            id="filter-max-price"
            min="0"
            name="maxPrice"
            onChange={handleInput}
            placeholder="50000"
            type="number"
            value={filters.maxPrice ?? ""}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-bold text-slate-950" htmlFor="filter-size">
            Størrelse
          </label>
          <select
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
            id="filter-size"
            name="size"
            onChange={handleInput}
            value={filters.size ?? ""}
          >
            <option value="">Alle</option>
            {sizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-bold text-slate-950" htmlFor="filter-color">
            Farge
          </label>
          <select
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
            id="filter-color"
            name="color"
            onChange={handleInput}
            value={filters.color ?? ""}
          >
            <option value="">Alle</option>
            {colorOptions.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-3 text-sm font-semibold text-slate-800">
        <input
          checked={filters.inStock === "true"}
          className="size-4 rounded border-slate-300"
          name="inStock"
          onChange={handleCheckbox}
          type="checkbox"
        />
        På lager
      </label>

      <label className="flex items-center gap-3 text-sm font-semibold text-slate-800">
        <input
          checked={filters.campaign === "true"}
          className="size-4 rounded border-slate-300"
          name="campaign"
          onChange={handleCheckbox}
          type="checkbox"
        />
        Kampanje
      </label>

      <Button className="w-full" onClick={onClear} type="button" variant="ghost">
        Nullstill filtre
      </Button>
    </form>
  );
}

import type { FormEvent } from "react";
import { Button } from "../components/ui/Button";
import {
  useAdminBrands,
  useAdminCategories,
  useCreateAdminBrand,
  useCreateAdminCategory,
  useDeleteAdminBrand,
  useDeleteAdminCategory
} from "../features/admin/adminQueries";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function AdminCategoriesPage() {
  const categoriesQuery = useAdminCategories();
  const brandsQuery = useAdminBrands();
  const createCategory = useCreateAdminCategory();
  const deleteCategory = useDeleteAdminCategory();
  const createBrand = useCreateAdminBrand();
  const deleteBrand = useDeleteAdminBrand();

  const submitCategory = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "");
    createCategory.mutate({
      name,
      slug: String(form.get("slug") || slugify(name)),
      description: String(form.get("description") || "") || null,
      isActive: true
    });
    event.currentTarget.reset();
  };

  const submitBrand = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "");
    createBrand.mutate({
      name,
      slug: String(form.get("slug") || slugify(name)),
      description: String(form.get("description") || "") || null,
      websiteUrl: String(form.get("websiteUrl") || "") || null,
      isActive: true
    });
    event.currentTarget.reset();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
        <h2 className="text-xl font-black text-slate-950">AdminCategories</h2>
        <form className="mt-4 grid gap-3" onSubmit={submitCategory}>
          <input className="rounded-lg border border-slate-300 px-3 py-2" name="name" placeholder="Kategorinavn" required />
          <input className="rounded-lg border border-slate-300 px-3 py-2" name="slug" placeholder="Slug" />
          <textarea className="rounded-lg border border-slate-300 px-3 py-2" name="description" placeholder="Beskrivelse" />
          <Button type="submit">Legg til kategori</Button>
        </form>
        <div className="mt-5 grid gap-2">
          {(categoriesQuery.data ?? []).map((category) => (
            <div className="flex items-center justify-between rounded-xl bg-[var(--brand-gray)] p-3" key={category.id}>
              <div>
                <p className="font-bold text-slate-950">{category.name}</p>
                <p className="text-xs text-slate-500">{category.slug}</p>
              </div>
              <Button onClick={() => deleteCategory.mutate(category.id)} type="button" variant="ghost">
                Slett
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
        <h2 className="text-xl font-black text-slate-950">Brand management</h2>
        <form className="mt-4 grid gap-3" onSubmit={submitBrand}>
          <input className="rounded-lg border border-slate-300 px-3 py-2" name="name" placeholder="Merkenavn" required />
          <input className="rounded-lg border border-slate-300 px-3 py-2" name="slug" placeholder="Slug" />
          <input className="rounded-lg border border-slate-300 px-3 py-2" name="websiteUrl" placeholder="Website URL" />
          <textarea className="rounded-lg border border-slate-300 px-3 py-2" name="description" placeholder="Beskrivelse" />
          <Button type="submit">Legg til merke</Button>
        </form>
        <div className="mt-5 grid gap-2">
          {(brandsQuery.data ?? []).map((brand) => (
            <div className="flex items-center justify-between rounded-xl bg-[var(--brand-gray)] p-3" key={brand.id}>
              <div>
                <p className="font-bold text-slate-950">{brand.name}</p>
                <p className="text-xs text-slate-500">{brand.slug}</p>
              </div>
              <Button onClick={() => deleteBrand.mutate(brand.id)} type="button" variant="ghost">
                Slett
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

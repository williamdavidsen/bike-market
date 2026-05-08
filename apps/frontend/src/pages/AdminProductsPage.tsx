import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ErrorState } from "../components/common/ErrorState";
import { Button } from "../components/ui/Button";
import {
  useAdminBrands,
  useAdminCategories,
  useAdminProducts,
  useCreateAdminProduct,
  useDeleteAdminProduct,
  useUpdateAdminProduct
} from "../features/admin/adminQueries";
import { formatNok } from "../lib/formatters";
import type { Product, ProductInput } from "../types/api";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function stock(product: Product) {
  return product.variants.reduce((sum, variant) => sum + (variant.inventory?.available ?? 0), 0);
}

export function AdminProductsPage() {
  const productsQuery = useAdminProducts();
  const categoriesQuery = useAdminCategories();
  const brandsQuery = useAdminBrands();
  const createProduct = useCreateAdminProduct();
  const updateProduct = useUpdateAdminProduct();
  const deleteProduct = useDeleteAdminProduct();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const products = productsQuery.data ?? [];
  const filteredProducts = useMemo(
    () => products.filter((product) => product.name.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );

  const submitProduct = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "");
    const basePriceNok = String(form.get("basePriceNok") ?? "");
    const inventoryQuantity = Number(form.get("inventoryQuantity") ?? 0);
    const payload: ProductInput = {
      categoryId: String(form.get("categoryId") ?? ""),
      brandId: String(form.get("brandId") || "") || null,
      name,
      slug: String(form.get("slug") || slugify(name)),
      description: String(form.get("description") || "") || null,
      status: String(form.get("status") ?? "ACTIVE") as ProductInput["status"],
      basePriceNok,
      salePriceNok: String(form.get("salePriceNok") || "") || null,
      currency: "NOK",
      vatRate: "25.00",
      variants: editing
        ? undefined
        : [
            {
              sku: String(form.get("sku") || `${slugify(name)}-default`),
              name: String(form.get("variantName") || "Standard"),
              color: String(form.get("color") || "") || null,
              size: String(form.get("size") || "") || null,
              inventory: {
                quantity: Number.isFinite(inventoryQuantity) ? inventoryQuantity : 0,
                reserved: 0,
                location: "main"
              }
            }
          ]
    };

    if (editing) {
      updateProduct.mutate({ id: editing.id, data: payload });
    } else {
      createProduct.mutate(payload);
    }

    setEditing(null);
    event.currentTarget.reset();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_26rem]">
      <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-black text-slate-950">Product list</h2>
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Søk produkt"
            value={search}
          />
        </div>
        {productsQuery.isError ? <ErrorState description="Produkter kunne ikke hentes." /> : null}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="py-2">Produkt</th>
                <th>Pris</th>
                <th>Status</th>
                <th>Stock</th>
                <th>Handling</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr className="border-t border-slate-100" key={product.id}>
                  <td className="py-3">
                    <Link className="font-bold text-slate-950" to={`/produkt/${product.slug}`}>
                      {product.name}
                    </Link>
                    <p className="text-xs text-slate-500">{product.category.name}</p>
                  </td>
                  <td>{formatNok(product.salePriceNok ?? product.basePriceNok)}</td>
                  <td>{product.status ?? "ACTIVE"}</td>
                  <td>{stock(product)}</td>
                  <td className="space-x-2">
                    <Button onClick={() => setEditing(product)} type="button" variant="ghost">
                      Rediger
                    </Button>
                    <Button onClick={() => deleteProduct.mutate(product.id)} type="button" variant="ghost">
                      Slett
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
        <h2 className="text-xl font-black text-slate-950">Product create/edit form</h2>
        <form className="mt-5 grid gap-3" onSubmit={submitProduct}>
          <input name="name" placeholder="Navn" defaultValue={editing?.name} className="rounded-lg border border-slate-300 px-3 py-2" required />
          <input name="slug" placeholder="Slug" defaultValue={editing?.slug} className="rounded-lg border border-slate-300 px-3 py-2" />
          <select name="categoryId" defaultValue={editing?.category.id ?? ""} className="rounded-lg border border-slate-300 px-3 py-2" required>
            <option value="">Kategori</option>
            {(categoriesQuery.data ?? []).map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <select name="brandId" defaultValue={editing?.brand?.id ?? ""} className="rounded-lg border border-slate-300 px-3 py-2">
            <option value="">Merke</option>
            {(brandsQuery.data ?? []).map((brand) => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>
          <input name="basePriceNok" placeholder="Pris NOK" defaultValue={editing?.basePriceNok} className="rounded-lg border border-slate-300 px-3 py-2" required />
          <input name="salePriceNok" placeholder="Kampanjepris" defaultValue={editing?.salePriceNok ?? ""} className="rounded-lg border border-slate-300 px-3 py-2" />
          <textarea name="description" placeholder="Beskrivelse" defaultValue={editing?.description ?? ""} className="rounded-lg border border-slate-300 px-3 py-2" />
          <select name="status" defaultValue={editing?.status ?? "ACTIVE"} className="rounded-lg border border-slate-300 px-3 py-2">
            <option value="ACTIVE">ACTIVE</option>
            <option value="DRAFT">DRAFT</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
          <div className="rounded-xl bg-[var(--brand-gray)] p-3">
            <p className="text-sm font-bold text-slate-950">Inventory management</p>
            <input name="sku" placeholder="SKU" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2" />
            <input name="variantName" placeholder="Variantnavn" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2" />
            <input name="size" placeholder="Størrelse" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2" />
            <input name="color" placeholder="Farge" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2" />
            <input name="inventoryQuantity" placeholder="Lager" type="number" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <Button type="submit">{editing ? "Lagre endringer" : "Legg til produkt"}</Button>
        </form>
      </section>
    </div>
  );
}

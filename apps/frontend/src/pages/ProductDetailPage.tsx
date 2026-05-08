import { CheckCircle2, Minus, Plus, Star, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Breadcrumb } from "../components/common/Breadcrumb";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorState } from "../components/common/ErrorState";
import { PageContainer } from "../components/layout/PageContainer";
import { StockBadge, getProductAvailableStock } from "../components/product/StockBadge";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { useAddCartItem } from "../features/cart/cartQueries";
import { useProduct } from "../features/products/productQueries";
import { getProductImageFallback } from "../lib/constants";
import { formatNok } from "../lib/formatters";
import { useAuthStore } from "../store/authStore";
import { useUiStore } from "../store/uiStore";
import type { Product, ProductImage, ProductVariant } from "../types/api";

function primaryImage(product: Product): ProductImage | undefined {
  return product.images.find((image) => image.isPrimary) ?? product.images[0];
}

function variantPrice(product: Product, variant: ProductVariant | null): string {
  return variant?.priceNok ?? product.salePriceNok ?? product.basePriceNok;
}

function uniqueValues(values: Array<string | null>): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

function isVariantAvailable(variant: ProductVariant | null): boolean {
  return (variant?.inventory?.available ?? 0) > 0;
}

export function ProductDetailPage() {
  const { slug } = useParams();
  const productQuery = useProduct(slug);
  const addCartItem = useAddCartItem();
  const openCart = useUiStore((state) => state.openCart);
  const user = useAuthStore((state) => state.user);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState<string | null>(null);

  const product = productQuery.data;
  const images = product?.images ?? [];
  const selectedVariant = product?.variants.find((variant) => variant.id === selectedVariantId) ?? null;
  const selectedImage =
    images.find((image) => image.id === selectedImageId) ?? (product ? primaryImage(product) : undefined);
  const fallbackImage = product ? getProductImageFallback(product.slug) : "/images/products/sykkel2.png";
  const sizes = useMemo(() => uniqueValues(product?.variants.map((variant) => variant.size) ?? []), [product]);
  const colors = useMemo(() => uniqueValues(product?.variants.map((variant) => variant.color) ?? []), [product]);
  const hasVariants = Boolean(product?.variants.length);
  const canAddToCart = Boolean(product && selectedVariant && isVariantAvailable(selectedVariant) && !addCartItem.isPending);
  const showVariantWarning = hasVariants && !selectedVariant;

  const chooseByOption = (kind: "size" | "color", value: string) => {
    if (!product) {
      return;
    }

    const current = selectedVariant;
    const nextVariant = product.variants.find((variant) => {
      const matchesSelectedSize = kind === "size" ? variant.size === value : !current?.size || variant.size === current.size;
      const matchesSelectedColor =
        kind === "color" ? variant.color === value : !current?.color || variant.color === current.color;

      return matchesSelectedSize && matchesSelectedColor;
    });

    setSelectedVariantId(nextVariant?.id ?? null);
    setNotice(null);
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      setNotice("Velg størrelse og farge før du legger varen i handlekurven.");
      return;
    }

    if (!user) {
      setNotice("Logg inn for å legge varen i handlekurven.");
      return;
    }

    if (!isVariantAvailable(selectedVariant)) {
      setNotice("Denne varianten er utsolgt.");
      return;
    }

    try {
      await addCartItem.mutateAsync({ variantId: selectedVariant.id, quantity });
      setNotice("Produktet ble lagt i handlekurven.");
      openCart();
    } catch {
      setNotice("Kunne ikke legge varen i handlekurven. Sjekk innlogging og prøv igjen.");
    }
  };

  if (productQuery.isLoading) {
    return (
      <PageContainer className="py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_28rem]">
          <div className="aspect-[4/3] animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />
          <div className="space-y-4 rounded-2xl bg-white p-6 ring-1 ring-slate-200">
            <div className="h-5 w-28 animate-pulse rounded bg-slate-100" />
            <div className="h-10 w-4/5 animate-pulse rounded bg-slate-100" />
            <div className="h-6 w-40 animate-pulse rounded bg-slate-100" />
            <div className="h-12 w-full animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (productQuery.isError) {
    return (
      <PageContainer className="py-8">
        <ErrorState description="Produktet kunne ikke hentes. Sjekk lenken eller prøv igjen." />
      </PageContainer>
    );
  }

  if (!product) {
    return (
      <PageContainer className="py-8">
        <EmptyState
          action={
            <Link to="/produkter">
              <Button variant="ghost">Til produkter</Button>
            </Link>
          }
          description="Produktet finnes ikke i katalogen."
          title="Produkt ikke funnet"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-8">
      <Breadcrumb
        items={[
          { label: "Hjem", href: "/" },
          { label: "Produkter", href: "/produkter" },
          { label: product.name }
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_28rem]">
        <section>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <div className="flex aspect-[4/3] items-center justify-center bg-[var(--brand-gray)]">
              <img
                alt={selectedImage?.altText ?? product.name}
                className="h-full w-full object-cover"
                onError={(event) => {
                  if (event.currentTarget.src !== new URL(fallbackImage, window.location.origin).href) {
                    event.currentTarget.src = fallbackImage;
                  }
                }}
                src={selectedImage?.url ?? fallbackImage}
              />
            </div>
          </div>

          {images.length > 1 ? (
            <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6">
              {images.map((image) => (
                <button
                  aria-label={`Vis bilde ${image.altText ?? product.name}`}
                  className={`aspect-square overflow-hidden rounded-lg bg-white ring-2 ${
                    image.id === selectedImage?.id ? "ring-[var(--brand-green)]" : "ring-slate-200"
                  }`}
                  key={image.id}
                  onClick={() => setSelectedImageId(image.id)}
                  type="button"
                >
                  <img alt={image.altText ?? product.name} className="h-full w-full object-cover" src={image.url} />
                </button>
              ))}
            </div>
          ) : null}

          <section className="mt-8 rounded-2xl bg-white p-6 ring-1 ring-slate-200">
            <h2 className="text-xl font-black text-slate-950">Produktbeskrivelse</h2>
            <p className="mt-3 leading-7 text-slate-600">
              {product.description ?? "Detaljert produktbeskrivelse kommer snart."}
            </p>
          </section>

          <section className="mt-4 rounded-2xl bg-white p-6 ring-1 ring-slate-200">
            <h2 className="text-xl font-black text-slate-950">Tekniske detaljer</h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-bold text-slate-950">Kategori</dt>
                <dd className="text-slate-600">{product.category.name}</dd>
              </div>
              <div>
                <dt className="font-bold text-slate-950">Merke</dt>
                <dd className="text-slate-600">{product.brand?.name ?? "Wheelix"}</dd>
              </div>
              <div>
                <dt className="font-bold text-slate-950">Valuta</dt>
                <dd className="text-slate-600">{product.currency}</dd>
              </div>
              <div>
                <dt className="font-bold text-slate-950">MVA</dt>
                <dd className="text-slate-600">{product.vatRate ?? "25.00"}%</dd>
              </div>
            </dl>
          </section>
        </section>

        <aside className="self-start rounded-2xl bg-white p-6 ring-1 ring-slate-200 lg:sticky lg:top-28">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase text-slate-500">{product.brand?.name ?? "Wheelix"}</p>
              <h1 className="mt-2 text-3xl font-black leading-tight text-slate-950">{product.name}</h1>
            </div>
            <StockBadge product={product} />
          </div>

          <div className="mt-4 flex items-center gap-1 text-sm text-slate-500" aria-label="Rating placeholder">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} aria-hidden="true" size={16} />
            ))}
            <span className="ml-2 font-semibold">4.8</span>
          </div>

          <div className="mt-5">
            <p className="text-3xl font-black text-slate-950">{formatNok(variantPrice(product, selectedVariant))}</p>
            {product.salePriceNok ? (
              <p className="mt-1 text-sm text-slate-500 line-through">{formatNok(product.basePriceNok)}</p>
            ) : null}
            {product.salePriceNok ? <Badge tone="green">Kampanje</Badge> : null}
          </div>

          {product.variants.length ? (
            <div className="mt-6">
              <p className="text-sm font-bold text-slate-950">Variant</p>
              <div className="mt-2 grid gap-2">
                {product.variants.map((variant) => (
                  <button
                    className={`min-h-11 rounded-lg px-4 text-left text-sm font-bold ring-1 ${
                      selectedVariant?.id === variant.id
                        ? "bg-[var(--brand-navy)] text-white ring-[var(--brand-navy)]"
                        : "bg-white text-slate-700 ring-slate-200"
                    }`}
                    key={variant.id}
                    onClick={() => {
                      setSelectedVariantId(variant.id);
                      setNotice(null);
                    }}
                    type="button"
                  >
                    {variant.name}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {sizes.length ? (
            <div className="mt-6">
              <p className="text-sm font-bold text-slate-950">Størrelse</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    className={`min-h-10 rounded-lg px-4 text-sm font-bold ring-1 ${
                      selectedVariant?.size === size
                        ? "bg-[var(--brand-navy)] text-white ring-[var(--brand-navy)]"
                        : "bg-white text-slate-700 ring-slate-200"
                    }`}
                    key={size}
                    onClick={() => chooseByOption("size", size)}
                    type="button"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {colors.length ? (
            <div className="mt-6">
              <p className="text-sm font-bold text-slate-950">Farge</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    className={`min-h-10 rounded-lg px-4 text-sm font-bold ring-1 ${
                      selectedVariant?.color === color
                        ? "bg-[var(--brand-green)] text-white ring-[var(--brand-green)]"
                        : "bg-white text-slate-700 ring-slate-200"
                    }`}
                    key={color}
                    onClick={() => chooseByOption("color", color)}
                    type="button"
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-6 rounded-xl bg-[var(--brand-gray)] p-4">
            <p className="font-bold text-slate-950">Lagerstatus</p>
            <p className="mt-1 text-sm text-slate-600">
              {selectedVariant
                ? `${selectedVariant.inventory?.available ?? 0} tilgjengelig`
                : `${getProductAvailableStock(product)} tilgjengelig totalt`}
            </p>
          </div>

          <div className="mt-6 grid gap-3 text-sm">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
              <Truck className="text-[var(--brand-green)]" size={20} />
              <span>Sendes hjem</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
              <CheckCircle2 className="text-[var(--brand-green)]" size={20} />
              <span>Hent i butikk</span>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              aria-label="Reduser antall"
              className="rounded-lg bg-white p-3 ring-1 ring-slate-200"
              disabled={quantity <= 1}
              onClick={() => setQuantity((current) => Math.max(current - 1, 1))}
              type="button"
            >
              <Minus size={16} />
            </button>
            <span className="min-w-10 text-center font-black">{quantity}</span>
            <button
              aria-label="Øk antall"
              className="rounded-lg bg-white p-3 ring-1 ring-slate-200"
              onClick={() => setQuantity((current) => current + 1)}
              type="button"
            >
              <Plus size={16} />
            </button>
          </div>

          {showVariantWarning || notice ? (
            <p className="mt-4 rounded-lg bg-[var(--brand-mint)] p-3 text-sm font-semibold text-[var(--brand-navy)]">
              {notice ?? "Velg variant før du legger varen i handlekurven."}
            </p>
          ) : null}

          <Button className="mt-5 w-full" disabled={!canAddToCart} onClick={handleAddToCart} type="button">
            {addCartItem.isPending ? "Legger til..." : "Legg i handlekurv"}
          </Button>
        </aside>
      </div>
    </PageContainer>
  );
}

import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProductImageFallback } from "../../lib/constants";
import { formatNok } from "../../lib/formatters";
import type { Product } from "../../types/api";
import { Button } from "../ui/Button";
import { StockBadge, getProductAvailableStock } from "./StockBadge";

type ProductCardProps = {
  product: Product;
};

function productPrice(product: Product): string {
  return product.salePriceNok ?? product.basePriceNok;
}

function primaryImage(product: Product) {
  return product.images.find((image) => image.isPrimary) ?? product.images[0];
}

export function ProductCard({ product }: ProductCardProps) {
  const image = primaryImage(product);
  const fallbackImage = getProductImageFallback(product.slug);
  const [imageSrc, setImageSrc] = useState(image?.url ?? fallbackImage);
  const available = getProductAvailableStock(product);
  const hasSale = Boolean(product.salePriceNok);

  useEffect(() => {
    setImageSrc(image?.url ?? fallbackImage);
  }, [fallbackImage, image?.url]);

  return (
    <article className="flex h-full flex-col rounded-lg bg-white p-3 ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:ring-emerald-200">
      <Link className="block" to={`/produkt/${product.slug}`}>
        <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-md bg-slate-100">
          <img
            alt={image?.altText ?? product.name}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={() => setImageSrc(fallbackImage)}
            src={imageSrc}
          />
        </div>
      </Link>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-slate-500">{product.brand?.name ?? "Bikemarket"}</p>
          <Link to={`/produkt/${product.slug}`}>
            <h2 className="mt-1 line-clamp-2 text-base font-black leading-6 text-slate-950">{product.name}</h2>
          </Link>
        </div>
        <StockBadge product={product} />
      </div>

      <div className="mt-3 flex items-center gap-1 text-sm text-slate-500" aria-label="Rating kommer snart">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} aria-hidden="true" size={14} />
        ))}
      </div>

      <div className="mt-3">
        <p className="text-lg font-black text-slate-950">{formatNok(productPrice(product))}</p>
        {hasSale ? <p className="text-sm text-slate-500 line-through">{formatNok(product.basePriceNok)}</p> : null}
      </div>

      <div className="mt-auto pt-5">
        <Button className="w-full" disabled={available <= 0} type="button">
          Legg i handlekurv
        </Button>
      </div>
    </article>
  );
}

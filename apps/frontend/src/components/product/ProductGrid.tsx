import type { Product } from "../../types/api";
import { ProductCard } from "./ProductCard";
import { ProductSkeleton } from "./ProductSkeleton";

type ProductGridProps = {
  isLoading: boolean;
  products: Product[];
};

export function ProductGrid({ isLoading, products }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

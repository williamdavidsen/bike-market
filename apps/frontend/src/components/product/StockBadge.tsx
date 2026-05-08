import type { Product } from "../../types/api";
import { Badge } from "../ui/Badge";

type StockBadgeProps = {
  product: Product;
};

export function getProductAvailableStock(product: Product): number {
  return product.variants.reduce((total, variant) => total + (variant.inventory?.available ?? 0), 0);
}

export function StockBadge({ product }: StockBadgeProps) {
  const available = getProductAvailableStock(product);

  if (available <= 0) {
    return <Badge tone="neutral">Utsolgt</Badge>;
  }

  if (available <= 3) {
    return <Badge tone="blue">Få igjen</Badge>;
  }

  return <Badge tone="green">På lager</Badge>;
}

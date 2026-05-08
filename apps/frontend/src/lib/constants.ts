export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export const categories = [
  { label: "Sykkel", href: "/produkter?category=sykkel" },
  { label: "Elsykkel", href: "/kategori/elsykkel" },
  { label: "Barnesykkel", href: "/produkter?category=barnesykkel" },
  { label: "Sykkelhjelm", href: "/produkter?category=sykkelhjelm" },
  { label: "Sykkelklær", href: "/produkter?category=sykkelklaer" },
  { label: "Reservedeler", href: "/produkter?category=reservedeler" },
  { label: "Tilbehør", href: "/produkter?category=tilbehor" },
  { label: "Kampanje", href: "/produkter?campaign=true" }
];

export const productImageFallbacks = [
  "/images/products/sykkel2.png",
  "/images/products/nord-road-r2.webp",
  "/images/products/sykkel3.png"
];

export function getProductImageFallback(key: string): string {
  const index = Math.abs(
    Array.from(key).reduce((sum, char) => sum + char.charCodeAt(0), 0) % productImageFallbacks.length
  );

  return productImageFallbacks[index] ?? "/images/products/sykkel2.png";
}

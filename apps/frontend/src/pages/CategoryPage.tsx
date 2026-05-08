import { useParams } from "react-router-dom";
import { ProductCatalogView } from "../features/products/ProductCatalogView";
import { useCategory } from "../features/products/productQueries";

export function CategoryPage() {
  const { slug } = useParams();
  const categoryQuery = useCategory(slug);
  const title = categoryQuery.data?.name ?? (slug ? slug.replaceAll("-", " ") : "Kategori");
  const description =
    categoryQuery.data?.description ??
    "Utforsk produkter i kategorien med samme filtrering, sortering og pagination som produktlisten.";

  return (
    <ProductCatalogView
      breadcrumbItems={[
        { label: "Hjem", href: "/" },
        { label: "Kategorier", href: "/produkter" },
        { label: title }
      ]}
      description={description}
      forcedCategory={slug}
      heading={categoryQuery.isLoading ? "Laster kategori" : title}
    />
  );
}

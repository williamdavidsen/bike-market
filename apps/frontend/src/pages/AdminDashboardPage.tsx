import { formatNok } from "../lib/formatters";
import { useAdminOrders, useAdminProducts } from "../features/admin/adminQueries";

function availableStock(product: { variants: Array<{ inventory: { available: number } | null }> }) {
  return product.variants.reduce((sum, variant) => sum + (variant.inventory?.available ?? 0), 0);
}

export function AdminDashboardPage() {
  const productsQuery = useAdminProducts();
  const ordersQuery = useAdminOrders();
  const products = productsQuery.data ?? [];
  const orders = ordersQuery.data ?? [];
  const revenue = orders
    .filter((order) => order.status === "PAID")
    .reduce((sum, order) => sum + Number(order.totalNok), 0);
  const lowStock = products.filter((product) => availableStock(product) <= 3).length;
  const pendingOrders = orders.filter((order) => order.status === "PENDING" || order.status === "PAYMENT_PROCESSING").length;

  const cards = [
    { label: "Total orders", value: orders.length },
    { label: "Total revenue", value: formatNok(revenue) },
    { label: "Low stock products", value: lowStock },
    { label: "Pending orders", value: pendingOrders }
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200" key={card.label}>
          <p className="text-sm font-bold text-slate-500">{card.label}</p>
          <p className="mt-3 text-3xl font-black text-slate-950">{card.value}</p>
        </section>
      ))}
    </div>
  );
}

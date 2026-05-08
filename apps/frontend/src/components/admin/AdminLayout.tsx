import { NavLink, Outlet } from "react-router-dom";
import { PageContainer } from "../layout/PageContainer";

const adminLinks = [
  { label: "Dashboard", to: "/admin" },
  { label: "Produkter", to: "/admin/products" },
  { label: "Ordre", to: "/admin/orders" },
  { label: "Kategorier", to: "/admin/categories" }
];

export function AdminLayout() {
  return (
    <PageContainer className="py-8">
      <div className="mb-6">
        <p className="text-sm font-bold text-[var(--brand-green)]">Admin</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Butikkstyring</h1>
      </div>
      <nav className="mb-6 flex gap-2 overflow-x-auto rounded-xl bg-white p-2 ring-1 ring-slate-200">
        {adminLinks.map((link) => (
          <NavLink
            className={({ isActive }) =>
              `whitespace-nowrap rounded-lg px-4 py-2 text-sm font-bold ${
                isActive ? "bg-[var(--brand-navy)] text-white" : "text-slate-700 hover:bg-[var(--brand-mint)]"
              }`
            }
            end={link.to === "/admin"}
            key={link.to}
            to={link.to}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </PageContainer>
  );
}

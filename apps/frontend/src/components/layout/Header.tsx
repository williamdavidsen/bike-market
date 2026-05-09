import { Search, ShoppingCart, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { categories } from "../../lib/constants";
import { useAuthStore } from "../../store/authStore";
import { useUiStore } from "../../store/uiStore";
import { BrandLogo } from "../brand/BrandLogo";
import { Button } from "../ui/Button";
import { PageContainer } from "./PageContainer";

export function Header() {
  const user = useAuthStore((state) => state.user);
  const openCart = useUiStore((state) => state.openCart);
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const currentPath = `${location.pathname}${location.search}`;
  const isCategoryActive = (href: string) => currentPath === href || location.pathname === href;

  return (
    <header className="sticky top-0 z-30 border-b border-emerald-200 bg-emerald-50/88 text-[var(--brand-navy)] shadow-[0_8px_24px_rgba(11,19,32,0.10)] backdrop-blur">
      <PageContainer>
        <div className="flex min-h-16 items-center gap-4">
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-lg text-[var(--brand-navy)] hover:bg-[var(--brand-mint)] lg:hidden"
            aria-label={isMobileMenuOpen ? "Lukk meny" : "Apne meny"}
            aria-controls="mobile-menu"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
          >
            <span className="relative block h-5 w-6" aria-hidden="true">
              <span
                className={`absolute left-0 top-0 h-0.5 w-6 rounded-full bg-current transition duration-300 ease-out ${
                  isMobileMenuOpen ? "translate-y-2 rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-2 h-0.5 w-6 rounded-full bg-current transition duration-200 ease-out ${
                  isMobileMenuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 top-4 h-0.5 w-6 rounded-full bg-current transition duration-300 ease-out ${
                  isMobileMenuOpen ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </span>
          </button>
          <Link to="/" aria-label="Bikemarket forside" className="shrink-0" onClick={closeMobileMenu}>
            <BrandLogo size="sm" />
          </Link>
          <form className="hidden flex-1 items-center rounded-xl bg-white/80 px-4 py-2 text-[var(--brand-navy)] ring-1 ring-emerald-100 lg:flex">
            <Search size={18} className="text-slate-500" aria-hidden="true" />
            <input
              className="w-full bg-transparent px-3 text-sm text-[var(--brand-navy)] outline-none placeholder:text-slate-500"
              placeholder="Sok etter elsykkel, hjelm eller reservedeler"
              aria-label="Sok"
            />
          </form>
          <nav className="ml-auto hidden items-center gap-5 text-sm font-semibold text-slate-700 md:flex">
            <NavLink className="nav-link-pop" to="/produkter">
              Produkter
            </NavLink>
            <NavLink className="nav-link-pop" to="/bestillinger">
              Mine bestillinger
            </NavLink>
            {user?.role === "ADMIN" ? (
              <NavLink className="nav-link-pop" to="/admin">
                Admin
              </NavLink>
            ) : null}
          </nav>
          <Link
            to={user ? "/konto" : "/logg-inn"}
            className="hidden rounded-lg p-2 text-[var(--brand-navy)] hover:bg-[var(--brand-mint)] sm:inline-flex"
            aria-label={user ? "Min konto" : "Logg inn"}
          >
            <UserRound size={22} />
          </Link>
          <Button variant="ghost" className="gap-2 bg-white/85 px-3 text-[var(--brand-navy)] ring-emerald-100 hover:bg-[var(--brand-mint)]" onClick={openCart} aria-label="Apne handlekurv">
            <ShoppingCart size={20} />
            <span className="hidden sm:inline">Handlekurv</span>
          </Button>
        </div>
        <nav className="hidden gap-2 overflow-x-auto border-t border-emerald-100 py-3 text-sm font-semibold text-slate-600 lg:flex">
          {categories.map((category) => (
            <Link
              key={category.href}
              to={category.href}
              className={`nav-category-link nav-link-pop whitespace-nowrap rounded-full px-3 py-1.5 transition ${
                isCategoryActive(category.href) ? "nav-category-link-active" : ""
              }`}
            >
              {category.label}
            </Link>
          ))}
        </nav>
      </PageContainer>
      {isMobileMenuOpen ? (
        <div className="fixed inset-0 top-16 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/30"
            aria-label="Lukk meny"
            onClick={closeMobileMenu}
          />
          <div
            id="mobile-menu"
            className="relative max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-emerald-100 bg-white px-4 py-5 text-[var(--brand-navy)] shadow-xl"
          >
            <form className="flex items-center rounded-xl bg-[var(--brand-gray)] px-4 py-2 ring-1 ring-emerald-100">
              <Search size={18} className="text-slate-500" aria-hidden="true" />
              <input
                className="w-full bg-transparent px-3 text-sm outline-none placeholder:text-slate-500"
                placeholder="Sok etter elsykkel, hjelm eller reservedeler"
                aria-label="Sok"
              />
            </form>
            <nav className="mt-5 grid gap-2 text-sm font-semibold text-slate-700" aria-label="Mobil hovedmeny">
              <NavLink className="nav-link-pop rounded-lg px-3 py-2 hover:bg-[var(--brand-mint)]" to="/produkter" onClick={closeMobileMenu}>
                Produkter
              </NavLink>
              <NavLink className="nav-link-pop rounded-lg px-3 py-2 hover:bg-[var(--brand-mint)]" to="/bestillinger" onClick={closeMobileMenu}>
                Mine bestillinger
              </NavLink>
              <NavLink
                className="nav-link-pop rounded-lg px-3 py-2 hover:bg-[var(--brand-mint)]"
                to={user ? "/konto" : "/logg-inn"}
                onClick={closeMobileMenu}
              >
                {user ? "Min konto" : "Logg inn"}
              </NavLink>
              {user?.role === "ADMIN" ? (
                <NavLink className="nav-link-pop rounded-lg px-3 py-2 hover:bg-[var(--brand-mint)]" to="/admin" onClick={closeMobileMenu}>
                  Admin
                </NavLink>
              ) : null}
            </nav>
            <nav
              className="mt-5 grid grid-cols-2 gap-2 border-t border-emerald-100 pt-5 text-sm font-semibold text-slate-600"
              aria-label="Mobil kategorimeny"
            >
              {categories.map((category) => (
                <Link
                  key={category.href}
                  to={category.href}
                  className={`nav-category-link nav-link-pop rounded-lg px-3 py-2 transition ${
                    isCategoryActive(category.href) ? "nav-category-link-active" : ""
                  }`}
                  onClick={closeMobileMenu}
                >
                  {category.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}

import { ArrowRight, Bike, CreditCard, RotateCcw, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { BrandLogo } from "../components/brand/BrandLogo";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { PageContainer } from "../components/layout/PageContainer";
import { categories } from "../lib/constants";
import { formatNok } from "../lib/formatters";

const trustItems = [
  { label: "Trygg betaling", icon: CreditCard },
  { label: "Rask levering", icon: Truck },
  { label: "Enkel retur", icon: RotateCcw },
  { label: "Norsk kundeservice", icon: Bike }
];

const featuredProductImage = "/images/products/sykkel2.png";

const featuredProducts = [
  { name: "Wheelix Urban E1", price: 24990, tag: "Elsykkel", image: featuredProductImage },
  { name: "Nord Road R2", price: 14990, tag: "Landevei", image: featuredProductImage },
  { name: "Barnesykkel Mini 20", price: 4990, tag: "Barnesykkel", image: featuredProductImage }
];

export function HomePage() {
  return (
    <>
      <section className="hero-pattern bg-white/35 backdrop-blur-sm">
        <PageContainer className="grid min-h-[calc(100vh-9rem)] items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Badge tone="green">Concept 3 / Gratis frakt over 999 kr</Badge>
            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
              Moderne sykler for norske veier
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Finn elsykkel, barnesykkel, hjelm og tilbehør i en rask og trygg handleopplevelse.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/produkter">
                <Button className="w-full gap-2 sm:w-auto">
                  Se produkter <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/produkter?campaign=true">
                <Button variant="ghost" className="w-full sm:w-auto">
                  Se kampanjer
                </Button>
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-[24px] bg-[var(--brand-mint)]/90 p-4 shadow-[0_8px_24px_rgba(11,19,32,0.08)]">
            <div className="relative min-h-[24rem] overflow-hidden rounded-[20px] bg-white/82 p-6 text-[var(--brand-navy)] ring-1 ring-white/80 backdrop-blur-sm">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(22,163,122,0.08)_1px,transparent_1px),linear-gradient(rgba(22,163,122,0.08)_1px,transparent_1px)] bg-[size:34px_34px]" />
              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-200/70 blur-sm" />
              <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-teal-100" />
              <div className="relative flex h-full min-h-[21rem] flex-col justify-between">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-[var(--brand-green)]">Elsykkel kampanje</p>
                    <h2 className="mt-3 max-w-sm text-3xl font-black leading-tight text-slate-950">
                      Klar for norske veier
                    </h2>
                  </div>
                  <div className="rounded-2xl bg-[var(--brand-navy)] p-4 text-white shadow-xl">
                    <BrandLogo showWordmark={false} size="md" />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/78 p-4 shadow-[0_8px_24px_rgba(11,19,32,0.08)] ring-1 ring-emerald-100">
                    <p className="text-xs font-bold uppercase text-emerald-700">Fra</p>
                    <p className="mt-1 text-2xl font-black text-slate-950">24 990 kr</p>
                    <p className="mt-1 text-xs text-slate-600">Urban E1 elsykkel</p>
                  </div>
                  <div className="rounded-2xl bg-[var(--brand-navy)]/95 p-4 text-white shadow-[0_8px_24px_rgba(11,19,32,0.10)]">
                    <p className="text-xs font-bold uppercase text-[var(--brand-mint)]">Levering</p>
                    <p className="mt-1 text-2xl font-black">2-4 dager</p>
                    <p className="mt-1 text-xs text-white/70">Trygg norsk handel</p>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/70 p-4 ring-1 ring-white/80">
                  <BrandLogo size="md" />
                  <p className="mt-3 max-w-md text-sm leading-6 text-slate-700">
                    En roligere kampanjeflate med pris, levering og merkevare i samme blikk.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      <PageContainer className="py-12">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-xl bg-white p-5 ring-1 ring-slate-200">
                <Icon className="text-[var(--brand-green)]" size={24} />
                <p className="mt-3 font-bold text-slate-950">{item.label}</p>
              </div>
            );
          })}
        </div>

        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[var(--brand-green)]">Kategorier</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Finn riktig sykkel raskt</h2>
            </div>
            <Link className="hidden text-sm font-bold text-[var(--brand-green)] sm:inline" to="/produkter">
              Alle produkter
            </Link>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category.href}
                to={category.href}
                className="rounded-xl bg-white p-5 font-bold text-slate-950 ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-[var(--brand-mint)] hover:ring-emerald-200"
              >
                {category.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-100/95 via-[var(--brand-mint)]/95 to-teal-100/95 p-6 text-[var(--brand-navy)] shadow-[0_8px_24px_rgba(11,19,32,0.10)] ring-1 ring-white/70 backdrop-blur md:p-8">
            <div className="absolute -right-16 -top-20 h-44 w-44 rounded-full bg-white/50 blur-2xl" />
            <div className="absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-emerald-300/35 blur-2xl" />
            <div className="relative">
              <p className="text-sm font-semibold text-emerald-800">Kampanjeprodukter</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Utvalgte sykler med ekstra god pris</h2>
              <p className="mt-3 max-w-2xl text-slate-800">
                Kampanjevisning kobles mot produkt-API i neste produktfase. Pris og lager hentes alltid fra backend.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-black text-slate-950">Populære produkter</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {featuredProducts.map((product) => (
              <article key={product.name} className="rounded-xl bg-white p-5 ring-1 ring-slate-200">
                <div className="aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
                  <img alt={product.name} className="h-full w-full object-cover" loading="lazy" src={product.image} />
                </div>
                <Badge tone="blue">{product.tag}</Badge>
                <h3 className="mt-3 font-bold text-slate-950">{product.name}</h3>
                <p className="mt-2 text-lg font-black text-slate-950">{formatNok(product.price)}</p>
                <p className="mt-1 text-sm text-slate-500">På lager</p>
              </article>
            ))}
          </div>
        </section>
      </PageContainer>
    </>
  );
}

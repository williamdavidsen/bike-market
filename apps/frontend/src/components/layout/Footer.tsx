import { Link } from "react-router-dom";
import { BrandLogo } from "../brand/BrandLogo";
import { PageContainer } from "./PageContainer";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-emerald-200 bg-emerald-50/88 text-[var(--brand-navy)] backdrop-blur">
      <PageContainer className="grid gap-8 py-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <BrandLogo size="sm" />
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
            Moderne sykler, elsykler og tilbehør for norske veier. Trygg betaling, rask levering og enkel retur.
          </p>
        </div>
        <div>
          <p className="font-semibold text-slate-950">Handle</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-600">
            <Link to="/produkter">Produkter</Link>
            <Link to="/handlekurv">Handlekurv</Link>
            <Link to="/bestillinger">Mine bestillinger</Link>
          </div>
        </div>
        <div>
          <p className="font-semibold text-slate-950">Hjelp</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-600">
            <Link to="/personvern">Personvern</Link>
            <Link to="/vilkar">Vilkår</Link>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}

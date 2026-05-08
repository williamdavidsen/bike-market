import { Link } from "react-router-dom";
import { PageContainer } from "../components/layout/PageContainer";
import { Button } from "../components/ui/Button";

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PageContainer className="flex min-h-screen items-center justify-center py-12">
        <section className="max-w-xl rounded-2xl bg-white p-8 text-center ring-1 ring-slate-200">
          <p className="text-sm font-bold text-emerald-700">404</p>
          <h1 className="mt-3 text-3xl font-black text-slate-950">Siden finnes ikke</h1>
          <p className="mt-3 text-slate-600">
            Vi fant ikke siden du lette etter. Gå tilbake til forsiden og finn riktig sykkel derfra.
          </p>
          <Link to="/" className="mt-6 inline-flex">
            <Button>Til forsiden</Button>
          </Link>
        </section>
      </PageContainer>
    </div>
  );
}

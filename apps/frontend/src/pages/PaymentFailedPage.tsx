import { Link } from "react-router-dom";
import { PageContainer } from "../components/layout/PageContainer";
import { Button } from "../components/ui/Button";

export function PaymentFailedPage() {
  return (
    <PageContainer className="flex min-h-[70vh] items-center justify-center py-12">
      <section className="max-w-xl rounded-2xl bg-white p-8 text-center ring-1 ring-slate-200">
        <p className="text-sm font-bold text-red-700">Betaling feilet</p>
        <h1 className="mt-3 text-3xl font-black text-slate-950">Vi kunne ikke fullføre betalingen</h1>
        <p className="mt-3 text-slate-600">Prøv igjen, eller gå tilbake til handlekurven.</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/kasse">
            <Button>Prøv igjen</Button>
          </Link>
          <Link to="/handlekurv">
            <Button variant="ghost">Til handlekurv</Button>
          </Link>
        </div>
      </section>
    </PageContainer>
  );
}

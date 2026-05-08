import { Link, useSearchParams } from "react-router-dom";
import { PageContainer } from "../components/layout/PageContainer";
import { Button } from "../components/ui/Button";

export function PaymentSuccessPage() {
  const [params] = useSearchParams();
  const orderNumber = params.get("order");

  return (
    <PageContainer className="flex min-h-[70vh] items-center justify-center py-12">
      <section className="max-w-xl rounded-2xl bg-white p-8 text-center ring-1 ring-slate-200">
        <p className="text-sm font-bold text-[var(--brand-green)]">Betaling fullført</p>
        <h1 className="mt-3 text-3xl font-black text-slate-950">Takk for bestillingen</h1>
        <p className="mt-3 text-slate-600">
          {orderNumber ? `Ordre ${orderNumber} er betalt.` : "Ordren er betalt."}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/bestillinger">
            <Button>Mine bestillinger</Button>
          </Link>
          <Link to="/">
            <Button variant="ghost">Til forsiden</Button>
          </Link>
        </div>
      </section>
    </PageContainer>
  );
}

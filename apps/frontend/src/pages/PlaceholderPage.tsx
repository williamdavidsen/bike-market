import { Link } from "react-router-dom";
import { PageContainer } from "../components/layout/PageContainer";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

type PlaceholderPageProps = {
  title: string;
  description: string;
  badge?: string;
};

export function PlaceholderPage({ title, description, badge = "Kommer snart" }: PlaceholderPageProps) {
  return (
    <PageContainer className="py-12">
      <section className="rounded-2xl bg-white p-8 ring-1 ring-slate-200">
        <Badge tone="blue">{badge}</Badge>
        <h1 className="mt-4 text-3xl font-black text-slate-950">{title}</h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">{description}</p>
        <Link to="/produkter" className="mt-6 inline-flex">
          <Button>Se produkter</Button>
        </Link>
      </section>
    </PageContainer>
  );
}

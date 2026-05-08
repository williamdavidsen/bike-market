import { PageContainer } from "../components/layout/PageContainer";

export function TermsPage() {
  return (
    <PageContainer className="py-10">
      <article className="mx-auto max-w-3xl">
        <p className="text-sm font-bold text-[var(--brand-green)]">Kjøpsvilkår</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Vilkår og betingelser</h1>
        <div className="mt-6 space-y-6 text-sm leading-7 text-slate-700">
          <section>
            <h2 className="text-xl font-black text-slate-950">Priser og MVA</h2>
            <p>Alle priser vises i norske kroner og inkluderer 25 prosent MVA der dette er relevant.</p>
          </section>
          <section>
            <h2 className="text-xl font-black text-slate-950">Levering</h2>
            <p>Bestillinger kan sendes hjem eller hentes i butikk. Frakt og estimert levering vises i kassen.</p>
          </section>
          <section>
            <h2 className="text-xl font-black text-slate-950">Retur og angrerett</h2>
            <p>Kunder har angrerett etter norsk lov. Varer må returneres i forsvarlig stand og med ordrenummer.</p>
          </section>
        </div>
      </article>
    </PageContainer>
  );
}

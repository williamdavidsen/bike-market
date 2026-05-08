import { PageContainer } from "../components/layout/PageContainer";

export function PrivacyPolicyPage() {
  return (
    <PageContainer className="py-10">
      <article className="mx-auto max-w-3xl">
        <p className="text-sm font-bold text-[var(--brand-green)]">GDPR</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Personvernerklæring</h1>
        <div className="mt-6 space-y-6 text-sm leading-7 text-slate-700">
          <section>
            <h2 className="text-xl font-black text-slate-950">Hva vi lagrer</h2>
            <p>
              Sykelix lagrer kundeopplysninger som navn, e-post, leveringsadresse, ordredata og betalingsreferanser
              for å levere varer, håndtere support og oppfylle lovpålagte krav.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-black text-slate-950">Dine rettigheter</h2>
            <p>
              Du kan be om innsyn, retting, sletting eller eksport av personopplysninger. Vi behandler forespørsler i
              tråd med GDPR og norsk personvernlovgivning.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-black text-slate-950">Cookies</h2>
            <p>
              Nødvendige cookies brukes for innlogging, handlekurv og sikkerhet. Analyse og markedsføring krever aktivt
              samtykke i cookie-banneret.
            </p>
          </section>
        </div>
      </article>
    </PageContainer>
  );
}

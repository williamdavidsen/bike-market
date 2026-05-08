import { useEffect, useState } from "react";
import { Button } from "../ui/Button";

type CookieChoice = "accepted" | "rejected" | "customized";

const storageKey = "wheelix-cookie-choice";

export function CookieBanner() {
  const [choice, setChoice] = useState<CookieChoice | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem(storageKey) as CookieChoice | null;
  });
  const [showCustomize, setShowCustomize] = useState(false);

  useEffect(() => {
    if (choice) {
      window.localStorage.setItem(storageKey, choice);
    }
  }, [choice]);

  if (choice) {
    return null;
  }

  return (
    <section
      aria-label="Informasjon om cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white p-4 shadow-xl"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-3xl">
          <p className="font-black text-slate-950">Cookies og personvern</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Vi bruker nødvendige cookies for handlekurv og innlogging. Du kan velge bort analyse og markedsføring.
          </p>
          {showCustomize ? (
            <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
              <label>
                <input checked readOnly className="mr-2" type="checkbox" />
                Nødvendige
              </label>
              <label>
                <input className="mr-2" type="checkbox" />
                Analyse
              </label>
              <label>
                <input className="mr-2" type="checkbox" />
                Markedsføring
              </label>
            </div>
          ) : null}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={() => setChoice("accepted")} type="button">
            Godta
          </Button>
          <Button onClick={() => setChoice("rejected")} type="button" variant="ghost">
            Avvis
          </Button>
          <Button
            onClick={() => (showCustomize ? setChoice("customized") : setShowCustomize(true))}
            type="button"
            variant="ghost"
          >
            Tilpass
          </Button>
        </div>
      </div>
    </section>
  );
}

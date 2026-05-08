import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ErrorState } from "../components/common/ErrorState";
import { PageContainer } from "../components/layout/PageContainer";
import { Button } from "../components/ui/Button";
import { login } from "../features/auth/authApi";
import { useAuthStore } from "../store/authStore";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectTo = new URLSearchParams(location.search).get("redirect") ?? "/konto";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Skriv inn e-post og passord.");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await login({ email, password });
      setAuth(result.tokens.accessToken, result.user);
      navigate(redirectTo);
    } catch {
      setError("Innlogging feilet. Kontroller e-post og passord.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer className="py-10">
      <div className="mx-auto max-w-md">
        <p className="text-sm font-bold text-[var(--brand-green)]">Konto</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Logg inn</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Logg inn for å se bestillinger, starte checkout og administrere handlekurven din.
        </p>

        <form className="mt-8 space-y-5 rounded-lg bg-white p-6 ring-1 ring-slate-200" onSubmit={handleSubmit}>
          <label className="block text-sm font-bold text-slate-950">
            E-post
            <input
              autoComplete="email"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
            />
          </label>

          <label className="block text-sm font-bold text-slate-950">
            Passord
            <input
              autoComplete="current-password"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </label>

          {error ? <ErrorState description={error} title="Kan ikke logge inn" /> : null}

          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Logger inn..." : "Logg inn"}
          </Button>

          <p className="text-center text-sm text-slate-600">
            Ny kunde?{" "}
            <Link className="font-bold text-[var(--brand-green)]" to="/registrer">
              Registrer deg
            </Link>
          </p>
        </form>
      </div>
    </PageContainer>
  );
}

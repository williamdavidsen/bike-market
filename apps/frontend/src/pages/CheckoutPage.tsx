import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartSummary } from "../components/cart/CartSummary";
import { ErrorState } from "../components/common/ErrorState";
import { PageContainer } from "../components/layout/PageContainer";
import { Button } from "../components/ui/Button";
import { useCart } from "../features/cart/cartQueries";
import { cartEstimatedTotal } from "../features/cart/cartSummary";
import { useCompleteMockPayment, useStartCheckout } from "../features/checkout/checkoutQueries";
import { formatNok } from "../lib/formatters";
import { useAuthStore } from "../store/authStore";
import type { CheckoutStartInput, ShippingAddressInput } from "../types/api";

type DeliveryMethod = "PICKUP" | "HOME";
type PaymentProviderChoice = "MOCK" | "VIPPS" | "STRIPE" | "KLARNA";

const paymentOptions: Array<{ label: string; value: PaymentProviderChoice }> = [
  { label: "Mock payment", value: "MOCK" },
  { label: "Vipps", value: "VIPPS" },
  { label: "Stripe", value: "STRIPE" },
  { label: "Klarna", value: "KLARNA" }
];

const initialAddress: ShippingAddressInput = {
  firstName: "",
  lastName: "",
  line1: "",
  line2: "",
  postalCode: "",
  city: "",
  country: "NO"
};

function isAddressValid(address: ShippingAddressInput): boolean {
  return Boolean(
    address.firstName.trim() &&
      address.lastName.trim() &&
      address.line1.trim() &&
      address.postalCode.trim().length >= 3 &&
      address.city.trim() &&
      address.country.trim().length >= 2
  );
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const cartQuery = useCart();
  const startCheckout = useStartCheckout();
  const completeMockPayment = useCompleteMockPayment();
  const [address, setAddress] = useState<ShippingAddressInput>(initialAddress);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("HOME");
  const [paymentProvider, setPaymentProvider] = useState<PaymentProviderChoice>("MOCK");
  const [formError, setFormError] = useState<string | null>(null);
  const cart = cartQuery.data;
  const isCartEmpty = !cart?.items.length;
  const estimatedTotal = useMemo(() => cartEstimatedTotal(cart), [cart]);
  const isSubmitting = startCheckout.isPending || completeMockPayment.isPending;

  const updateAddress = (key: keyof ShippingAddressInput, value: string) => {
    setAddress((current) => ({ ...current, [key]: value }));
    setFormError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      setFormError("Logg inn før du starter checkout.");
      return;
    }

    if (isCartEmpty) {
      setFormError("Handlekurven er tom.");
      return;
    }

    if (!isAddressValid(address)) {
      setFormError("Fyll inn navn, adresse, postnummer og by.");
      return;
    }

    const payload: CheckoutStartInput = {
      shippingAddress: {
        ...address,
        line2: address.line2?.trim() ? address.line2 : null,
        line1:
          deliveryMethod === "PICKUP"
            ? `${address.line1} (Hent i butikk)`
            : address.line1
      },
      clientTotalNok: String(estimatedTotal.toFixed(2))
    };

    try {
      const result = await startCheckout.mutateAsync(payload);

      if (paymentProvider === "MOCK") {
        const webhookResult = await completeMockPayment.mutateAsync({
          paymentId: result.paymentSession.paymentId,
          orderId: result.order.id
        });

        if (webhookResult.status === "PAID") {
          navigate(`/betaling/suksess?order=${result.order.orderNumber}`);
          return;
        }
      }

      window.location.assign(result.paymentSession.redirectUrl);
    } catch {
      navigate("/betaling/feilet");
    }
  };

  return (
    <PageContainer className="py-8">
      <div className="mb-6">
        <p className="text-sm font-bold text-[var(--brand-green)]">Checkout</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Gå til kassen</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Vi henter totalsummen fra backend og starter betaling først når adresse og levering er valgt.
        </p>
      </div>

      {cartQuery.isError ? (
        <ErrorState description="Handlekurven kunne ikke hentes. Logg inn og prøv igjen." />
      ) : null}

      <form className="grid gap-6 lg:grid-cols-[1fr_22rem]" onSubmit={handleSubmit}>
        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
            <h2 className="text-xl font-black text-slate-950">Adresse</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-bold text-slate-950">
                Fornavn
                <input
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
                  onChange={(event) => updateAddress("firstName", event.target.value)}
                  value={address.firstName}
                />
              </label>
              <label className="text-sm font-bold text-slate-950">
                Etternavn
                <input
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
                  onChange={(event) => updateAddress("lastName", event.target.value)}
                  value={address.lastName}
                />
              </label>
              <label className="text-sm font-bold text-slate-950 sm:col-span-2">
                Adresse
                <input
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
                  onChange={(event) => updateAddress("line1", event.target.value)}
                  value={address.line1}
                />
              </label>
              <label className="text-sm font-bold text-slate-950 sm:col-span-2">
                Adresse 2
                <input
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
                  onChange={(event) => updateAddress("line2", event.target.value)}
                  value={address.line2 ?? ""}
                />
              </label>
              <label className="text-sm font-bold text-slate-950">
                Postnummer
                <input
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
                  onChange={(event) => updateAddress("postalCode", event.target.value)}
                  value={address.postalCode}
                />
              </label>
              <label className="text-sm font-bold text-slate-950">
                By
                <input
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
                  onChange={(event) => updateAddress("city", event.target.value)}
                  value={address.city}
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
            <h2 className="text-xl font-black text-slate-950">Levering</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { label: "Sendes hjem", value: "HOME" as const },
                { label: "Hent i butikk", value: "PICKUP" as const }
              ].map((option) => (
                <label
                  className={`rounded-xl p-4 ring-1 ${
                    deliveryMethod === option.value
                      ? "bg-[var(--brand-mint)] ring-[var(--brand-green)]"
                      : "bg-white ring-slate-200"
                  }`}
                  key={option.value}
                >
                  <input
                    checked={deliveryMethod === option.value}
                    className="mr-2"
                    name="deliveryMethod"
                    onChange={() => setDeliveryMethod(option.value)}
                    type="radio"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
            <h2 className="text-xl font-black text-slate-950">Betaling</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {paymentOptions.map((option) => (
                <label
                  className={`rounded-xl p-4 ring-1 ${
                    paymentProvider === option.value
                      ? "bg-[var(--brand-mint)] ring-[var(--brand-green)]"
                      : "bg-white ring-slate-200"
                  }`}
                  key={option.value}
                >
                  <input
                    checked={paymentProvider === option.value}
                    className="mr-2"
                    name="paymentProvider"
                    onChange={() => setPaymentProvider(option.value)}
                    type="radio"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </section>

          {formError ? <ErrorState description={formError} title="Checkout kan ikke startes" /> : null}
        </div>

        <div className="self-start lg:sticky lg:top-28">
          <CartSummary cart={cart} />
          <Button className="mt-4 w-full" disabled={isSubmitting || isCartEmpty} type="submit">
            {isSubmitting ? "Starter checkout..." : `Betal ${formatNok(estimatedTotal)}`}
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}

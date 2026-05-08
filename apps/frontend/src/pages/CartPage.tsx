import { Link } from "react-router-dom";
import { CartLineItem } from "../components/cart/CartLineItem";
import { CartSummary } from "../components/cart/CartSummary";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorState } from "../components/common/ErrorState";
import { PageContainer } from "../components/layout/PageContainer";
import { Button } from "../components/ui/Button";
import { useCart, useClearCart, useRemoveCartItem, useUpdateCartItem } from "../features/cart/cartQueries";

export function CartPage() {
  const cartQuery = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();
  const cart = cartQuery.data;
  const isUpdating = updateItem.isPending || removeItem.isPending || clearCart.isPending;

  return (
    <PageContainer className="py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-[var(--brand-green)]">Handlekurv</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Din handlekurv</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Endre antall, fjern varer og gå videre til kassen når alt ser riktig ut.
          </p>
        </div>
        <Button
          disabled={!cart?.items.length || isUpdating}
          onClick={() => clearCart.mutate()}
          type="button"
          variant="ghost"
        >
          Tøm handlekurv
        </Button>
      </div>

      {cartQuery.isLoading ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div className="h-28 animate-pulse rounded-xl bg-white ring-1 ring-slate-200" key={index} />
            ))}
          </div>
          <div className="h-72 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />
        </div>
      ) : cartQuery.isError ? (
        <ErrorState description="Handlekurven kunne ikke hentes. Logg inn og prøv igjen." />
      ) : !cart?.items.length ? (
        <EmptyState
          action={
            <Link to="/produkter">
              <Button variant="ghost">Se produkter</Button>
            </Link>
          }
          description="Legg til en sykkel, hjelm eller tilbehør for å komme i gang."
          title="Handlekurven er tom"
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-3">
            {cart.items.map((item) => (
              <CartLineItem
                isUpdating={isUpdating}
                item={item}
                key={item.id}
                onQuantityChange={(itemId, quantity) => updateItem.mutate({ itemId, quantity })}
                onRemove={(itemId) => removeItem.mutate(itemId)}
              />
            ))}
          </div>
          <div className="self-start lg:sticky lg:top-28">
            <CartSummary cart={cart} />
          </div>
        </div>
      )}
    </PageContainer>
  );
}

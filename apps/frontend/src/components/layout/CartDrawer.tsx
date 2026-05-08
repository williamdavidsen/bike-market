import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { CartLineItem } from "../cart/CartLineItem";
import { CartSummary } from "../cart/CartSummary";
import { useCart, useRemoveCartItem, useUpdateCartItem } from "../../features/cart/cartQueries";
import { useUiStore } from "../../store/uiStore";

export function CartDrawer() {
  const isOpen = useUiStore((state) => state.isCartOpen);
  const closeCart = useUiStore((state) => state.closeCart);
  const cartQuery = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const cart = cartQuery.data;
  const isUpdating = updateItem.isPending || removeItem.isPending;

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40">
      <button className="absolute inset-0 bg-slate-950/40" onClick={closeCart} aria-label="Lukk handlekurv" />
      <aside
        aria-modal="true"
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl"
        role="dialog"
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <h2 className="text-lg font-bold text-slate-950">Handlekurv</h2>
          <button className="rounded-lg p-2 hover:bg-slate-100" onClick={closeCart} aria-label="Lukk">
            <X size={22} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {cartQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, index) => (
                <div className="h-28 animate-pulse rounded-xl bg-slate-100" key={index} />
              ))}
            </div>
          ) : cartQuery.isError ? (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-800">
              Handlekurven kunne ikke hentes. Logg inn og prøv igjen.
            </div>
          ) : !cart?.items.length ? (
            <div className="flex min-h-80 items-center justify-center text-center">
              <div>
                <p className="font-semibold text-slate-950">Handlekurven er tom</p>
                <p className="mt-2 text-sm text-slate-600">Legg til produkter for å se dem her.</p>
              </div>
            </div>
          ) : (
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
          )}
        </div>
        <div className="border-t border-slate-200 p-5">
          <CartSummary cart={cart} onCheckoutClick={closeCart} />
          <Link className="mt-3 block text-center text-sm font-bold text-[var(--brand-green)]" to="/handlekurv" onClick={closeCart}>
            Åpne handlekurv
          </Link>
        </div>
      </aside>
    </div>
  );
}

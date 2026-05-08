import { Link } from "react-router-dom";
import { cartEstimatedTotal, cartMvaIncluded, cartShippingEstimate, cartSubtotal } from "../../features/cart/cartSummary";
import { formatNok } from "../../lib/formatters";
import type { Cart } from "../../types/api";
import { Button } from "../ui/Button";

type CartSummaryProps = {
  cart: Cart | undefined;
  checkoutHref?: string;
  onCheckoutClick?: () => void;
};

export function CartSummary({ cart, checkoutHref = "/kasse", onCheckoutClick }: CartSummaryProps) {
  const itemCount = cart?.summary.itemCount ?? 0;
  const isEmpty = itemCount === 0;

  return (
    <aside className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
      <h2 className="text-lg font-black text-slate-950">Oppsummering</h2>
      <dl className="mt-5 grid gap-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-slate-600">Subtotal fra backend</dt>
          <dd className="font-bold text-slate-950">{formatNok(cartSubtotal(cart))}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-600">MVA inkludert</dt>
          <dd className="font-bold text-slate-950">{formatNok(cartMvaIncluded(cart))}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-600">Frakt estimat</dt>
          <dd className="font-bold text-slate-950">{formatNok(cartShippingEstimate(cart))}</dd>
        </div>
        <div className="border-t border-slate-200 pt-3">
          <div className="flex justify-between gap-4 text-base">
            <dt className="font-black text-slate-950">Estimert total</dt>
            <dd className="font-black text-slate-950">{formatNok(cartEstimatedTotal(cart))}</dd>
          </div>
        </div>
      </dl>
      {isEmpty ? (
        <Button className="mt-5 w-full" disabled type="button">
          Gå til kassen
        </Button>
      ) : (
        <Link onClick={onCheckoutClick} to={checkoutHref}>
          <Button className="mt-5 w-full">Gå til kassen</Button>
        </Link>
      )}
      <p className="mt-3 text-xs leading-5 text-slate-500">
        Produktpriser og subtotal hentes fra backend. Frakt og MVA vises som estimat i frontend.
      </p>
    </aside>
  );
}

import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { formatNok } from "../../lib/formatters";
import type { Cart } from "../../types/api";

type CartItem = Cart["items"][number];

type CartLineItemProps = {
  item: CartItem;
  isUpdating?: boolean;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
};

export function CartLineItem({ item, isUpdating = false, onQuantityChange, onRemove }: CartLineItemProps) {
  return (
    <article className="grid gap-4 rounded-xl bg-white p-4 ring-1 ring-slate-200 sm:grid-cols-[1fr_auto]">
      <div>
        <Link className="font-black text-slate-950 hover:text-[var(--brand-green)]" to={`/produkt/${item.product.slug}`}>
          {item.product.name}
        </Link>
        <p className="mt-1 text-sm text-slate-600">
          {item.variant.name}
          {item.variant.size ? ` / ${item.variant.size}` : ""}
          {item.variant.color ? ` / ${item.variant.color}` : ""}
        </p>
        <p className="mt-2 text-sm text-slate-500">{formatNok(item.unitPriceNok)} per stk.</p>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <div className="flex items-center gap-2">
          <button
            aria-label="Reduser antall"
            className="rounded-lg p-2 ring-1 ring-slate-200 disabled:opacity-50"
            disabled={item.quantity <= 1 || isUpdating}
            onClick={() => onQuantityChange(item.id, item.quantity - 1)}
            type="button"
          >
            <Minus size={16} />
          </button>
          <span className="min-w-8 text-center font-black">{item.quantity}</span>
          <button
            aria-label="Øk antall"
            className="rounded-lg p-2 ring-1 ring-slate-200 disabled:opacity-50"
            disabled={isUpdating}
            onClick={() => onQuantityChange(item.id, item.quantity + 1)}
            type="button"
          >
            <Plus size={16} />
          </button>
        </div>
        <p className="min-w-24 text-right font-black text-slate-950">{formatNok(item.lineTotalNok)}</p>
        <button
          aria-label="Fjern vare"
          className="rounded-lg p-2 text-red-700 ring-1 ring-red-100 hover:bg-red-50 disabled:opacity-50"
          disabled={isUpdating}
          onClick={() => onRemove(item.id)}
          type="button"
        >
          <Trash2 size={17} />
        </button>
      </div>
    </article>
  );
}

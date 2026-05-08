import { useMemo, useState } from "react";
import { Button } from "../components/ui/Button";
import { useAdminOrders, useRefundAdminOrder } from "../features/admin/adminQueries";
import { formatNok } from "../lib/formatters";
import type { OrderStatus } from "../types/api";

const statuses: Array<OrderStatus | "ALL"> = [
  "ALL",
  "PENDING",
  "PAYMENT_PROCESSING",
  "PAID",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
  "SHIPPED",
  "DELIVERED"
];

export function AdminOrdersPage() {
  const ordersQuery = useAdminOrders();
  const refundOrder = useRefundAdminOrder();
  const [status, setStatus] = useState<OrderStatus | "ALL">("ALL");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const orders = ordersQuery.data ?? [];
  const filteredOrders = useMemo(
    () => (status === "ALL" ? orders : orders.filter((order) => order.status === status)),
    [orders, status]
  );
  const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? filteredOrders[0];

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_26rem]">
      <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-black text-slate-950">Order list</h2>
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            onChange={(event) => setStatus(event.target.value as OrderStatus | "ALL")}
            value={status}
          >
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="py-2">Ordre</th>
                <th>Kunde</th>
                <th>Status</th>
                <th>Total</th>
                <th>Order detail</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr className="border-t border-slate-100" key={order.id}>
                  <td className="py-3 font-bold text-slate-950">{order.orderNumber}</td>
                  <td>{order.email ?? "-"}</td>
                  <td>{order.status}</td>
                  <td>{formatNok(order.totalNok)}</td>
                  <td>
                    <Button onClick={() => setSelectedOrderId(order.id)} type="button" variant="ghost">
                      Vis
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
        <h2 className="text-xl font-black text-slate-950">Order status update</h2>
        {selectedOrder ? (
          <>
            <p className="mt-3 font-bold">{selectedOrder.orderNumber}</p>
            <p className="text-sm text-slate-600">{selectedOrder.shippingName}</p>
            <p className="mt-3 text-sm font-bold">Status: {selectedOrder.status}</p>
            <div className="mt-4 rounded-xl bg-[var(--brand-gray)] p-3">
              {selectedOrder.items.map((item) => (
                <div className="flex justify-between gap-3 text-sm" key={item.id}>
                  <span>{item.productName}</span>
                  <span>{item.quantity} stk.</span>
                </div>
              ))}
            </div>
            <Button
              className="mt-5 w-full"
              disabled={selectedOrder.status !== "PAID" || refundOrder.isPending}
              onClick={() => refundOrder.mutate(selectedOrder.id)}
              type="button"
              variant="ghost"
            >
              Marker REFUNDED
            </Button>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              Full status update for SHIPPED/DELIVERED krever eget backend-endepunkt; refund er koblet til eksisterende admin API.
            </p>
          </>
        ) : (
          <p className="mt-3 text-sm text-slate-600">Ingen ordre funnet.</p>
        )}
      </section>
    </div>
  );
}

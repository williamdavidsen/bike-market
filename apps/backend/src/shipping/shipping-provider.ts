import type { OrderView } from "../services/checkout.service.js";

export type ShippingQuote = {
  provider: "BRING_POSTEN";
  serviceCode: string;
  serviceName: string;
  amountNok: string;
  currency: "NOK";
  estimatedDeliveryDays: number;
};

export interface ShippingProvider {
  quote(order: OrderView): Promise<ShippingQuote>;
  createShipment(order: OrderView): Promise<{ trackingNumber: string; labelUrl?: string }>;
}

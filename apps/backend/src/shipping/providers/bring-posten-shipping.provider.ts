import { AppError } from "../../errors/app-error.js";
import type { OrderView } from "../../services/checkout.service.js";
import type { ShippingProvider, ShippingQuote } from "../shipping-provider.js";

export class BringPostenShippingProvider implements ShippingProvider {
  public async quote(_order: OrderView): Promise<ShippingQuote> {
    throw new AppError(
      "Bring/Posten shipping provider is not configured yet",
      501,
      "SHIPPING_PROVIDER_NOT_READY"
    );
  }

  public async createShipment(
    _order: OrderView
  ): Promise<{ trackingNumber: string; labelUrl?: string }> {
    throw new AppError(
      "Bring/Posten shipping provider is not configured yet",
      501,
      "SHIPPING_PROVIDER_NOT_READY"
    );
  }
}

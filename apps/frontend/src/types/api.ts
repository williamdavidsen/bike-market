export type ApiSuccess<T> = {
  success: true;
  data: T;
  message: string;
};

export type ApiErrorBody = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorBody;

export class ApiError extends Error {
  public readonly code: string;
  public readonly status: number;

  public constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

export type UserRole = "CUSTOMER" | "ADMIN";

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResult = {
  user: User;
  tokens: AuthTokens;
};

export type Category = {
  id: string;
  parentId?: string | null;
  name: string;
  slug: string;
  description: string | null;
  sortOrder?: number;
  isActive?: boolean;
};

export type Brand = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  websiteUrl?: string | null;
  isActive?: boolean;
};

export type ProductImage = {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder?: number;
};

export type ProductVariant = {
  id: string;
  sku: string;
  name: string;
  color: string | null;
  size: string | null;
  priceNok: string | null;
  inventory: {
    quantity: number;
    reserved: number;
    available: number;
  } | null;
};

export type Product = {
  id: string;
  categoryId?: string;
  brandId?: string | null;
  name: string;
  slug: string;
  description: string | null;
  status?: "DRAFT" | "ACTIVE" | "ARCHIVED";
  basePriceNok: string;
  salePriceNok: string | null;
  currency: string;
  vatRate?: string;
  category: Category;
  brand: Brand | null;
  images: ProductImage[];
  variants: ProductVariant[];
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResult<T> = {
  items: T[];
  pagination: Pagination;
};

export type ProductSort = "newest" | "bestsellers" | "price_asc" | "price_desc" | "name_asc";

export type ProductListQuery = {
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  size?: string;
  color?: string;
  inStock?: string;
  campaign?: string;
  sort?: ProductSort;
  page?: string;
  limit?: string;
};

export type ProductDetailResponse = {
  product: Product;
};

export type AddCartItemInput = {
  variantId: string;
  quantity: number;
};

export type UpdateCartItemInput = {
  itemId: string;
  quantity: number;
};

export type PaymentSession = {
  paymentId: string;
  provider: "MOCK" | "STRIPE" | "VIPPS" | "KLARNA";
  providerReference: string;
  redirectUrl: string;
  amountNok: string;
  currency: string;
};

export type Cart = {
  id: string;
  currency: string;
  items: Array<{
    id: string;
    variantId: string;
    quantity: number;
    unitPriceNok: string;
    lineTotalNok: string;
    product: {
      id: string;
      name: string;
      slug: string;
    };
    variant: {
      id: string;
      sku: string;
      name: string;
      color: string | null;
      size: string | null;
    };
  }>;
  summary: {
    subtotalNok: string;
    itemCount: number;
  };
};

export type OrderStatus =
  | "PENDING"
  | "PAYMENT_PROCESSING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED"
  | "SHIPPED"
  | "DELIVERED";

export type Order = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  currency?: string;
  email?: string;
  shippingName?: string;
  shippingLine1?: string;
  shippingLine2?: string | null;
  shippingPostal?: string;
  shippingCity?: string;
  shippingCountry?: string;
  subtotalNok: string;
  shippingNok: string;
  taxNok: string;
  totalNok: string;
  items: Array<{
    id: string;
    productName: string;
    variantName: string | null;
    quantity: number;
    lineTotalNok: string;
  }>;
};

export type ShippingAddressInput = {
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string | null;
  postalCode: string;
  city: string;
  country: string;
};

export type CheckoutStartInput = {
  shippingAddress: ShippingAddressInput;
  clientTotalNok?: string;
};

export type CheckoutStartResult = {
  order: Order;
  paymentSession: PaymentSession;
};

export type PaymentWebhookResult = {
  processed: boolean;
  status: "PAID" | "FAILED" | "REFUNDED";
};

export type ProductVariantInput = {
  sku: string;
  name: string;
  color?: string | null;
  size?: string | null;
  priceNok?: string | null;
  inventory?: {
    quantity?: number;
    reserved?: number;
    location?: string;
  };
};

export type ProductInput = {
  categoryId: string;
  brandId?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  status?: "DRAFT" | "ACTIVE" | "ARCHIVED";
  basePriceNok: string;
  salePriceNok?: string | null;
  currency?: string;
  vatRate?: string;
  variants?: ProductVariantInput[];
  images?: Array<{
    url: string;
    altText?: string | null;
    sortOrder?: number;
    isPrimary?: boolean;
  }>;
};

export type ProductUpdateInput = Partial<ProductInput>;

export type CategoryInput = {
  name: string;
  slug: string;
  description?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};

export type BrandInput = {
  name: string;
  slug: string;
  description?: string | null;
  websiteUrl?: string | null;
  isActive?: boolean;
};

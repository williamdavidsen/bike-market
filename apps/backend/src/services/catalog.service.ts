import { prisma } from "../db/prisma.js";
import { AppError } from "../errors/app-error.js";

export type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export type PaginationQuery = {
  page?: number;
  limit?: number;
};

export type ProductListQuery = PaginationQuery & {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  inStock?: boolean;
  campaign?: boolean;
  sort?: "newest" | "price_asc" | "price_desc" | "name_asc";
};

export type PaginatedResult<T> = {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type CatalogCategory = {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type CatalogBrand = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  websiteUrl: string | null;
  isActive: boolean;
};

export type CatalogProductImage = {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
};

export type CatalogInventory = {
  quantity: number;
  reserved: number;
  location: string;
  available: number;
};

export type CatalogProductVariant = {
  id: string;
  sku: string;
  name: string;
  color: string | null;
  size: string | null;
  priceNok: string | null;
  barcode: string | null;
  isActive: boolean;
  inventory: CatalogInventory | null;
};

export type CatalogProduct = {
  id: string;
  categoryId: string;
  brandId: string | null;
  name: string;
  slug: string;
  description: string | null;
  status: ProductStatus;
  basePriceNok: string;
  salePriceNok: string | null;
  currency: string;
  vatRate: string;
  category: CatalogCategory;
  brand: CatalogBrand | null;
  images: CatalogProductImage[];
  variants: CatalogProductVariant[];
};

export type CategoryInput = {
  parentId?: string | null;
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

export type ProductVariantInput = {
  sku: string;
  name: string;
  color?: string | null;
  size?: string | null;
  priceNok?: string | null;
  barcode?: string | null;
  isActive?: boolean;
  inventory?: {
    quantity?: number;
    reserved?: number;
    location?: string;
  };
};

export type ProductImageInput = {
  url: string;
  altText?: string | null;
  sortOrder?: number;
  isPrimary?: boolean;
};

export type ProductInput = {
  categoryId: string;
  brandId?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  status?: ProductStatus;
  basePriceNok: string;
  salePriceNok?: string | null;
  currency?: string;
  vatRate?: string;
  variants?: ProductVariantInput[];
  images?: ProductImageInput[];
};

export type ProductUpdateInput = Partial<ProductInput>;
export type CategoryUpdateInput = Partial<CategoryInput>;
export type BrandUpdateInput = Partial<BrandInput>;

export interface CatalogService {
  listProducts(query: ProductListQuery): Promise<PaginatedResult<CatalogProduct>>;
  getProductBySlug(slug: string): Promise<CatalogProduct>;
  createProduct(input: ProductInput): Promise<CatalogProduct>;
  updateProduct(id: string, input: ProductUpdateInput): Promise<CatalogProduct>;
  deleteProduct(id: string): Promise<void>;
  listCategories(): Promise<CatalogCategory[]>;
  getCategoryBySlug(slug: string): Promise<CatalogCategory>;
  createCategory(input: CategoryInput): Promise<CatalogCategory>;
  updateCategory(id: string, input: CategoryUpdateInput): Promise<CatalogCategory>;
  deleteCategory(id: string): Promise<void>;
  listBrands(): Promise<CatalogBrand[]>;
  createBrand(input: BrandInput): Promise<CatalogBrand>;
  updateBrand(id: string, input: BrandUpdateInput): Promise<CatalogBrand>;
  deleteBrand(id: string): Promise<void>;
}

type PrismaDelegate<T> = {
  findMany(args?: unknown): Promise<T[]>;
  findUnique(args: unknown): Promise<T | null>;
  findFirst(args: unknown): Promise<T | null>;
  count(args?: unknown): Promise<number>;
  create(args: unknown): Promise<T>;
  update(args: unknown): Promise<T>;
  delete(args: unknown): Promise<T>;
};

type PrismaCatalogClient = {
  product: PrismaDelegate<DatabaseProduct>;
  category: PrismaDelegate<DatabaseCategory>;
  brand: PrismaDelegate<DatabaseBrand>;
};

type DecimalLike = {
  toString(): string;
};

type DatabaseCategory = CatalogCategory;
type DatabaseBrand = CatalogBrand;
type DatabaseProductImage = CatalogProductImage & {
  productId: string;
};
type DatabaseInventory = {
  quantity: number;
  reserved: number;
  location: string;
};
type DatabaseProductVariant = Omit<CatalogProductVariant, "priceNok" | "inventory"> & {
  productId: string;
  priceNok: DecimalLike | string | number | null;
  inventory: DatabaseInventory | null;
};
type DatabaseProduct = Omit<
  CatalogProduct,
  "basePriceNok" | "salePriceNok" | "vatRate" | "category" | "brand" | "images" | "variants"
> & {
  basePriceNok: DecimalLike | string | number;
  salePriceNok: DecimalLike | string | number | null;
  vatRate: DecimalLike | string | number;
  category: DatabaseCategory;
  brand: DatabaseBrand | null;
  images: DatabaseProductImage[];
  variants: DatabaseProductVariant[];
};

const catalogClient = prisma as unknown as PrismaCatalogClient;

function decimalToString(value: DecimalLike | string | number | null): string | null {
  if (value === null) {
    return null;
  }

  return value.toString();
}

function productInclude() {
  return {
    category: true,
    brand: true,
    images: { orderBy: { sortOrder: "asc" } },
    variants: {
      include: { inventory: true },
      orderBy: { name: "asc" }
    }
  };
}

function buildPagination(query: PaginationQuery) {
  const page = Math.max(query.page ?? 1, 1);
  const limit = Math.min(Math.max(query.limit ?? 20, 1), 100);

  return {
    page,
    limit,
    skip: (page - 1) * limit
  };
}

function mapProduct(product: DatabaseProduct): CatalogProduct {
  return {
    ...product,
    basePriceNok: decimalToString(product.basePriceNok) ?? "0",
    salePriceNok: decimalToString(product.salePriceNok),
    vatRate: decimalToString(product.vatRate) ?? "0",
    images: product.images.map(({ productId: _productId, ...image }) => image),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      name: variant.name,
      color: variant.color,
      size: variant.size,
      priceNok: decimalToString(variant.priceNok),
      barcode: variant.barcode,
      isActive: variant.isActive,
      inventory: variant.inventory
        ? {
            ...variant.inventory,
            available: Math.max(variant.inventory.quantity - variant.inventory.reserved, 0)
          }
        : null
    }))
  };
}

function productWhere(query: ProductListQuery): Record<string, unknown> {
  const where: Record<string, unknown> = {
    status: "ACTIVE"
  };

  if (query.category) {
    where.category = { slug: query.category };
  }

  if (query.brand) {
    where.brand = { slug: query.brand };
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.basePriceNok = {
      ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
      ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {})
    };
  }

  if (query.campaign) {
    where.salePriceNok = { not: null };
  }

  if (query.size || query.color || query.inStock !== undefined) {
    where.variants = {
      some: {
        ...(query.size ? { size: query.size } : {}),
        ...(query.color ? { color: query.color } : {}),
        ...(query.inStock ? { inventory: { quantity: { gt: 0 } } } : {})
      }
    };
  }

  return where;
}

function productOrderBy(sort: ProductListQuery["sort"]): Record<string, string> {
  if (sort === "price_asc") {
    return { basePriceNok: "asc" };
  }

  if (sort === "price_desc") {
    return { basePriceNok: "desc" };
  }

  if (sort === "name_asc") {
    return { name: "asc" };
  }

  return { createdAt: "desc" };
}

function productCreateData(input: ProductInput): Record<string, unknown> {
  return {
    categoryId: input.categoryId,
    brandId: input.brandId,
    name: input.name,
    slug: input.slug,
    description: input.description,
    status: input.status ?? "DRAFT",
    basePriceNok: input.basePriceNok,
    salePriceNok: input.salePriceNok,
    currency: input.currency ?? "NOK",
    vatRate: input.vatRate ?? "25.00",
    images: input.images?.length
      ? {
          create: input.images
        }
      : undefined,
    variants: input.variants?.length
      ? {
          create: input.variants.map((variant) => ({
            sku: variant.sku,
            name: variant.name,
            color: variant.color,
            size: variant.size,
            priceNok: variant.priceNok,
            barcode: variant.barcode,
            isActive: variant.isActive ?? true,
            inventory: variant.inventory
              ? {
                  create: {
                    quantity: variant.inventory.quantity ?? 0,
                    reserved: variant.inventory.reserved ?? 0,
                    location: variant.inventory.location ?? "main"
                  }
                }
              : undefined
          }))
        }
      : undefined
  };
}

function productUpdateData(input: ProductUpdateInput): Record<string, unknown> {
  return {
    ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
    ...(input.brandId !== undefined ? { brandId: input.brandId } : {}),
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.slug !== undefined ? { slug: input.slug } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.basePriceNok !== undefined ? { basePriceNok: input.basePriceNok } : {}),
    ...(input.salePriceNok !== undefined ? { salePriceNok: input.salePriceNok } : {}),
    ...(input.currency !== undefined ? { currency: input.currency } : {}),
    ...(input.vatRate !== undefined ? { vatRate: input.vatRate } : {})
  };
}

export class PrismaCatalogService implements CatalogService {
  public async listProducts(query: ProductListQuery): Promise<PaginatedResult<CatalogProduct>> {
    const pagination = buildPagination(query);
    const where = productWhere(query);
    const [items, total] = await Promise.all([
      catalogClient.product.findMany({
        where,
        include: productInclude(),
        orderBy: productOrderBy(query.sort),
        skip: pagination.skip,
        take: pagination.limit
      }),
      catalogClient.product.count({ where })
    ]);

    return {
      items: items.map(mapProduct),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit)
      }
    };
  }

  public async getProductBySlug(slug: string): Promise<CatalogProduct> {
    const product = await catalogClient.product.findFirst({
      where: { slug, status: "ACTIVE" },
      include: productInclude()
    });

    if (!product) {
      throw new AppError("Product was not found", 404, "PRODUCT_NOT_FOUND");
    }

    return mapProduct(product);
  }

  public async createProduct(input: ProductInput): Promise<CatalogProduct> {
    const product = await catalogClient.product.create({
      data: productCreateData(input),
      include: productInclude()
    });

    return mapProduct(product);
  }

  public async updateProduct(id: string, input: ProductUpdateInput): Promise<CatalogProduct> {
    const product = await catalogClient.product.update({
      where: { id },
      data: productUpdateData(input),
      include: productInclude()
    });

    return mapProduct(product);
  }

  public async deleteProduct(id: string): Promise<void> {
    await catalogClient.product.delete({ where: { id } });
  }

  public async listCategories(): Promise<CatalogCategory[]> {
    return catalogClient.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
    });
  }

  public async getCategoryBySlug(slug: string): Promise<CatalogCategory> {
    const category = await catalogClient.category.findFirst({ where: { slug, isActive: true } });

    if (!category) {
      throw new AppError("Category was not found", 404, "CATEGORY_NOT_FOUND");
    }

    return category;
  }

  public async createCategory(input: CategoryInput): Promise<CatalogCategory> {
    return catalogClient.category.create({ data: input });
  }

  public async updateCategory(id: string, input: CategoryUpdateInput): Promise<CatalogCategory> {
    return catalogClient.category.update({ where: { id }, data: input });
  }

  public async deleteCategory(id: string): Promise<void> {
    await catalogClient.category.delete({ where: { id } });
  }

  public async listBrands(): Promise<CatalogBrand[]> {
    return catalogClient.brand.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" }
    });
  }

  public async createBrand(input: BrandInput): Promise<CatalogBrand> {
    return catalogClient.brand.create({ data: input });
  }

  public async updateBrand(id: string, input: BrandUpdateInput): Promise<CatalogBrand> {
    return catalogClient.brand.update({ where: { id }, data: input });
  }

  public async deleteBrand(id: string): Promise<void> {
    await catalogClient.brand.delete({ where: { id } });
  }
}

export const catalogService = new PrismaCatalogService();

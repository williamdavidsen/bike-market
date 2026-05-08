import assert from "node:assert/strict";
import { describe, it } from "node:test";
import request from "supertest";
import { createApp } from "../src/app.js";
import type {
  BrandInput,
  BrandUpdateInput,
  CatalogBrand,
  CatalogCategory,
  CatalogProduct,
  CatalogService,
  CategoryInput,
  CategoryUpdateInput,
  PaginatedResult,
  ProductInput,
  ProductListQuery,
  ProductUpdateInput
} from "../src/services/catalog.service.js";
import { createAccessToken } from "../src/utils/token.js";

class InMemoryCatalogService implements CatalogService {
  public categories: CatalogCategory[] = [
    {
      id: "cat-electric",
      parentId: null,
      name: "Elsykkel",
      slug: "elsykkel",
      description: "Elektriske sykler",
      sortOrder: 1,
      isActive: true
    },
    {
      id: "cat-road",
      parentId: null,
      name: "Landevei",
      slug: "landevei",
      description: "Raske sykler",
      sortOrder: 2,
      isActive: true
    }
  ];

  public brands: CatalogBrand[] = [
    {
      id: "brand-wheelix",
      name: "Wheelix",
      slug: "wheelix",
      description: "Private label",
      websiteUrl: null,
      isActive: true
    },
    {
      id: "brand-nord",
      name: "Nord",
      slug: "nord",
      description: null,
      websiteUrl: null,
      isActive: true
    }
  ];

  public products: CatalogProduct[] = [
    this.product({
      id: "prod-urban",
      categoryId: "cat-electric",
      brandId: "brand-wheelix",
      name: "Wheelix Urban E1",
      slug: "wheelix-urban-e1",
      basePriceNok: "24990.00",
      salePriceNok: "22990.00",
      color: "Svart",
      size: "M",
      quantity: 7
    }),
    this.product({
      id: "prod-road",
      categoryId: "cat-road",
      brandId: "brand-nord",
      name: "Nord Road R2",
      slug: "nord-road-r2",
      basePriceNok: "14990.00",
      salePriceNok: null,
      color: "Rød",
      size: "L",
      quantity: 0
    })
  ];

  public async listProducts(query: ProductListQuery): Promise<PaginatedResult<CatalogProduct>> {
    let items = [...this.products].filter((product) => product.status === "ACTIVE");

    if (query.category) {
      items = items.filter((product) => product.category.slug === query.category);
    }

    if (query.brand) {
      items = items.filter((product) => product.brand?.slug === query.brand);
    }

    if (query.minPrice !== undefined) {
      items = items.filter((product) => Number(product.basePriceNok) >= (query.minPrice ?? 0));
    }

    if (query.maxPrice !== undefined) {
      items = items.filter(
        (product) => Number(product.basePriceNok) <= (query.maxPrice ?? Infinity)
      );
    }

    if (query.size) {
      items = items.filter((product) =>
        product.variants.some((variant) => variant.size === query.size)
      );
    }

    if (query.color) {
      items = items.filter((product) =>
        product.variants.some((variant) => variant.color === query.color)
      );
    }

    if (query.inStock) {
      items = items.filter((product) =>
        product.variants.some((variant) => (variant.inventory?.available ?? 0) > 0)
      );
    }

    if (query.campaign) {
      items = items.filter((product) => product.salePriceNok !== null);
    }

    if (query.sort === "price_asc") {
      items.sort((a, b) => Number(a.basePriceNok) - Number(b.basePriceNok));
    }

    if (query.sort === "price_desc") {
      items.sort((a, b) => Number(b.basePriceNok) - Number(a.basePriceNok));
    }

    if (query.sort === "name_asc") {
      items.sort((a, b) => a.name.localeCompare(b.name));
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    return {
      items: items.slice((page - 1) * limit, page * limit),
      pagination: {
        page,
        limit,
        total: items.length,
        totalPages: Math.ceil(items.length / limit)
      }
    };
  }

  public async getProductBySlug(slug: string): Promise<CatalogProduct> {
    const product = this.products.find((item) => item.slug === slug);

    assert.ok(product, "product should exist in test fixture");

    return product;
  }

  public async createProduct(input: ProductInput): Promise<CatalogProduct> {
    const category =
      this.categories.find((item) => item.id === input.categoryId) ?? this.categories[0];
    const brand = this.brands.find((item) => item.id === input.brandId) ?? null;

    assert.ok(category, "category fixture should exist");

    const product: CatalogProduct = {
      id: `prod-${this.products.length + 1}`,
      categoryId: input.categoryId,
      brandId: input.brandId ?? null,
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
      status: input.status ?? "DRAFT",
      basePriceNok: input.basePriceNok,
      salePriceNok: input.salePriceNok ?? null,
      currency: input.currency ?? "NOK",
      vatRate: input.vatRate ?? "25.00",
      category,
      brand,
      images: [],
      variants: []
    };

    this.products.push(product);

    return product;
  }

  public async updateProduct(id: string, input: ProductUpdateInput): Promise<CatalogProduct> {
    const product = this.products.find((item) => item.id === id);

    assert.ok(product, "product should exist in test fixture");
    Object.assign(product, input);

    return product;
  }

  public async deleteProduct(id: string): Promise<void> {
    this.products = this.products.filter((item) => item.id !== id);
  }

  public async listCategories(): Promise<CatalogCategory[]> {
    return this.categories;
  }

  public async getCategoryBySlug(slug: string): Promise<CatalogCategory> {
    const category = this.categories.find((item) => item.slug === slug);

    assert.ok(category, "category should exist in test fixture");

    return category;
  }

  public async createCategory(input: CategoryInput): Promise<CatalogCategory> {
    const category: CatalogCategory = {
      id: `cat-${this.categories.length + 1}`,
      parentId: input.parentId ?? null,
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
      sortOrder: input.sortOrder ?? 0,
      isActive: input.isActive ?? true
    };

    this.categories.push(category);

    return category;
  }

  public async updateCategory(id: string, input: CategoryUpdateInput): Promise<CatalogCategory> {
    const category = this.categories.find((item) => item.id === id);

    assert.ok(category, "category should exist in test fixture");
    Object.assign(category, input);

    return category;
  }

  public async deleteCategory(id: string): Promise<void> {
    this.categories = this.categories.filter((item) => item.id !== id);
  }

  public async listBrands(): Promise<CatalogBrand[]> {
    return this.brands;
  }

  public async createBrand(input: BrandInput): Promise<CatalogBrand> {
    const brand: CatalogBrand = {
      id: `brand-${this.brands.length + 1}`,
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
      websiteUrl: input.websiteUrl ?? null,
      isActive: input.isActive ?? true
    };

    this.brands.push(brand);

    return brand;
  }

  public async updateBrand(id: string, input: BrandUpdateInput): Promise<CatalogBrand> {
    const brand = this.brands.find((item) => item.id === id);

    assert.ok(brand, "brand should exist in test fixture");
    Object.assign(brand, input);

    return brand;
  }

  public async deleteBrand(id: string): Promise<void> {
    this.brands = this.brands.filter((item) => item.id !== id);
  }

  private product(input: {
    id: string;
    categoryId: string;
    brandId: string;
    name: string;
    slug: string;
    basePriceNok: string;
    salePriceNok: string | null;
    color: string;
    size: string;
    quantity: number;
  }): CatalogProduct {
    const category = this.categories.find((item) => item.id === input.categoryId);
    const brand = this.brands.find((item) => item.id === input.brandId);

    assert.ok(category, "category fixture should exist");
    assert.ok(brand, "brand fixture should exist");

    return {
      id: input.id,
      categoryId: input.categoryId,
      brandId: input.brandId,
      name: input.name,
      slug: input.slug,
      description: null,
      status: "ACTIVE",
      basePriceNok: input.basePriceNok,
      salePriceNok: input.salePriceNok,
      currency: "NOK",
      vatRate: "25.00",
      category,
      brand,
      images: [
        {
          id: `${input.id}-image`,
          url: `https://example.com/${input.slug}.jpg`,
          altText: input.name,
          sortOrder: 0,
          isPrimary: true
        }
      ],
      variants: [
        {
          id: `${input.id}-variant`,
          sku: `${input.id}-sku`,
          name: `${input.size} / ${input.color}`,
          color: input.color,
          size: input.size,
          priceNok: null,
          barcode: null,
          isActive: true,
          inventory: {
            quantity: input.quantity,
            reserved: 0,
            location: "main",
            available: input.quantity
          }
        }
      ]
    };
  }
}

function adminToken(): string {
  return createAccessToken({
    id: "admin-1",
    email: "admin@example.com",
    role: "ADMIN"
  });
}

function customerToken(): string {
  return createAccessToken({
    id: "customer-1",
    email: "customer@example.com",
    role: "CUSTOMER"
  });
}

describe("catalog product endpoints", () => {
  it("lists products with pagination metadata", async () => {
    const response = await request(createApp({ catalogService: new InMemoryCatalogService() }))
      .get("/api/products")
      .expect(200);

    assert.equal(response.body.success, true);
    assert.equal(response.body.data.items.length, 2);
    assert.equal(response.body.data.pagination.total, 2);
  });

  it("filters products by category", async () => {
    const response = await request(createApp({ catalogService: new InMemoryCatalogService() }))
      .get("/api/products")
      .query({ category: "elsykkel" })
      .expect(200);

    assert.equal(response.body.data.items.length, 1);
    assert.equal(response.body.data.items[0].slug, "wheelix-urban-e1");
  });

  it("filters products by price range", async () => {
    const response = await request(createApp({ catalogService: new InMemoryCatalogService() }))
      .get("/api/products")
      .query({ minPrice: 20000, maxPrice: 26000 })
      .expect(200);

    assert.equal(response.body.data.items.length, 1);
    assert.equal(response.body.data.items[0].basePriceNok, "24990.00");
  });

  it("returns product detail by slug", async () => {
    const response = await request(createApp({ catalogService: new InMemoryCatalogService() }))
      .get("/api/products/wheelix-urban-e1")
      .expect(200);

    assert.equal(response.body.data.product.slug, "wheelix-urban-e1");
    assert.equal(response.body.data.product.variants[0].inventory.available, 7);
    assert.equal(response.body.data.product.images[0].isPrimary, true);
  });

  it("blocks non-admin users from creating products", async () => {
    const response = await request(createApp({ catalogService: new InMemoryCatalogService() }))
      .post("/api/admin/products")
      .set("Authorization", `Bearer ${customerToken()}`)
      .send({
        categoryId: "cat-electric",
        name: "Blocked Product",
        slug: "blocked-product",
        basePriceNok: "999.00"
      })
      .expect(403);

    assert.equal(response.body.error.code, "FORBIDDEN");
  });

  it("allows admins to create products with variants, images, and inventory", async () => {
    const service = new InMemoryCatalogService();
    const response = await request(createApp({ catalogService: service }))
      .post("/api/admin/products")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({
        categoryId: "cat-electric",
        brandId: "brand-wheelix",
        name: "Wheelix Cargo C1",
        slug: "wheelix-cargo-c1",
        status: "ACTIVE",
        basePriceNok: "34990.00",
        variants: [
          {
            sku: "CARGO-C1",
            name: "One size",
            inventory: { quantity: 3 }
          }
        ],
        images: [
          {
            url: "https://example.com/cargo.jpg",
            isPrimary: true
          }
        ]
      })
      .expect(201);

    assert.equal(response.body.data.product.slug, "wheelix-cargo-c1");
    assert.equal(service.products.length, 3);
  });

  it("allows admins to update and delete products", async () => {
    const service = new InMemoryCatalogService();
    const app = createApp({ catalogService: service });

    const updated = await request(app)
      .patch("/api/admin/products/prod-urban")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({
        name: "Wheelix Urban E1 Oppdatert",
        salePriceNok: "21990.00"
      })
      .expect(200);

    assert.equal(updated.body.data.product.name, "Wheelix Urban E1 Oppdatert");
    assert.equal(updated.body.data.product.salePriceNok, "21990.00");

    await request(app)
      .delete("/api/admin/products/prod-urban")
      .set("Authorization", `Bearer ${adminToken()}`)
      .expect(200);

    assert.equal(
      service.products.some((product) => product.id === "prod-urban"),
      false
    );
  });
});

describe("category and brand endpoints", () => {
  it("lists categories and brands", async () => {
    const app = createApp({ catalogService: new InMemoryCatalogService() });
    const categories = await request(app).get("/api/categories").expect(200);
    const brands = await request(app).get("/api/brands").expect(200);

    assert.equal(categories.body.data.categories.length, 2);
    assert.equal(brands.body.data.brands.length, 2);
  });

  it("returns category detail by slug", async () => {
    const response = await request(createApp({ catalogService: new InMemoryCatalogService() }))
      .get("/api/categories/elsykkel")
      .expect(200);

    assert.equal(response.body.data.category.slug, "elsykkel");
  });
});

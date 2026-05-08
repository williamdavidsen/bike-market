import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate-request.middleware.js";
import type { CatalogService } from "../services/catalog.service.js";
import type { ProductListQuery } from "../services/catalog.service.js";
import { catalogService } from "../services/catalog.service.js";
import { sendSuccess } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

const idParamSchema = z.object({
  id: z.string().min(1)
});

const slugParamSchema = z.object({
  slug: z.string().min(1)
});

const productListQuerySchema = z.object({
  category: z.string().min(1).optional(),
  brand: z.string().min(1).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  size: z.string().min(1).optional(),
  color: z.string().min(1).optional(),
  inStock: z.coerce.boolean().optional(),
  campaign: z.coerce.boolean().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "name_asc"]).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional()
});

const categorySchema = z.object({
  parentId: z.string().min(1).nullable().optional(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional()
});

const categoryUpdateSchema = categorySchema.partial();

const brandSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable().optional(),
  websiteUrl: z.url().nullable().optional(),
  isActive: z.boolean().optional()
});

const brandUpdateSchema = brandSchema.partial();

const productVariantSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  color: z.string().nullable().optional(),
  size: z.string().nullable().optional(),
  priceNok: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  inventory: z
    .object({
      quantity: z.number().int().nonnegative().optional(),
      reserved: z.number().int().nonnegative().optional(),
      location: z.string().min(1).optional()
    })
    .optional()
});

const productImageSchema = z.object({
  url: z.url(),
  altText: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  isPrimary: z.boolean().optional()
});

const productSchema = z.object({
  categoryId: z.string().min(1),
  brandId: z.string().min(1).nullable().optional(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
  basePriceNok: z.string().min(1),
  salePriceNok: z.string().nullable().optional(),
  currency: z.string().min(3).max(3).optional(),
  vatRate: z.string().min(1).optional(),
  variants: z.array(productVariantSchema).optional(),
  images: z.array(productImageSchema).optional()
});

const productUpdateSchema = productSchema.partial();

function adminOnly(router: Router): Router {
  router.use(requireAuth, requireRole("ADMIN"));
  return router;
}

function routeParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export function createCatalogRouters(service: CatalogService = catalogService) {
  const productsRouter = Router();
  const categoriesRouter = Router();
  const brandsRouter = Router();
  const adminRouter = adminOnly(Router());

  productsRouter.get(
    "/",
    validateRequest({ query: productListQuerySchema }),
    asyncHandler(async (_req, res) => {
      const products = await service.listProducts(res.locals.validatedQuery as ProductListQuery);

      sendSuccess(res, products, "Products listed");
    })
  );

  productsRouter.get(
    "/:slug",
    validateRequest({ params: slugParamSchema }),
    asyncHandler(async (req, res) => {
      const product = await service.getProductBySlug(routeParam(req.params.slug));

      sendSuccess(res, { product }, "Product detail");
    })
  );

  categoriesRouter.get(
    "/",
    asyncHandler(async (_req, res) => {
      const categories = await service.listCategories();

      sendSuccess(res, { categories }, "Categories listed");
    })
  );

  categoriesRouter.get(
    "/:slug",
    validateRequest({ params: slugParamSchema }),
    asyncHandler(async (req, res) => {
      const category = await service.getCategoryBySlug(routeParam(req.params.slug));

      sendSuccess(res, { category }, "Category detail");
    })
  );

  brandsRouter.get(
    "/",
    asyncHandler(async (_req, res) => {
      const brands = await service.listBrands();

      sendSuccess(res, { brands }, "Brands listed");
    })
  );

  adminRouter.post(
    "/products",
    validateRequest({ body: productSchema }),
    asyncHandler(async (req, res) => {
      const product = await service.createProduct(req.body);

      sendSuccess(res, { product }, "Product created", 201);
    })
  );

  adminRouter.patch(
    "/products/:id",
    validateRequest({ params: idParamSchema, body: productUpdateSchema }),
    asyncHandler(async (req, res) => {
      const product = await service.updateProduct(routeParam(req.params.id), req.body);

      sendSuccess(res, { product }, "Product updated");
    })
  );

  adminRouter.delete(
    "/products/:id",
    validateRequest({ params: idParamSchema }),
    asyncHandler(async (req, res) => {
      await service.deleteProduct(routeParam(req.params.id));

      sendSuccess(res, {}, "Product deleted");
    })
  );

  adminRouter.post(
    "/categories",
    validateRequest({ body: categorySchema }),
    asyncHandler(async (req, res) => {
      const category = await service.createCategory(req.body);

      sendSuccess(res, { category }, "Category created", 201);
    })
  );

  adminRouter.patch(
    "/categories/:id",
    validateRequest({ params: idParamSchema, body: categoryUpdateSchema }),
    asyncHandler(async (req, res) => {
      const category = await service.updateCategory(routeParam(req.params.id), req.body);

      sendSuccess(res, { category }, "Category updated");
    })
  );

  adminRouter.delete(
    "/categories/:id",
    validateRequest({ params: idParamSchema }),
    asyncHandler(async (req, res) => {
      await service.deleteCategory(routeParam(req.params.id));

      sendSuccess(res, {}, "Category deleted");
    })
  );

  adminRouter.post(
    "/brands",
    validateRequest({ body: brandSchema }),
    asyncHandler(async (req, res) => {
      const brand = await service.createBrand(req.body);

      sendSuccess(res, { brand }, "Brand created", 201);
    })
  );

  adminRouter.patch(
    "/brands/:id",
    validateRequest({ params: idParamSchema, body: brandUpdateSchema }),
    asyncHandler(async (req, res) => {
      const brand = await service.updateBrand(routeParam(req.params.id), req.body);

      sendSuccess(res, { brand }, "Brand updated");
    })
  );

  adminRouter.delete(
    "/brands/:id",
    validateRequest({ params: idParamSchema }),
    asyncHandler(async (req, res) => {
      await service.deleteBrand(routeParam(req.params.id));

      sendSuccess(res, {}, "Brand deleted");
    })
  );

  return {
    productsRouter,
    categoriesRouter,
    brandsRouter,
    adminRouter
  };
}

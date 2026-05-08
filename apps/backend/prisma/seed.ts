import { prisma } from "../src/db/prisma.js";

async function main(): Promise<void> {
  const category = await prisma.category.upsert({
    where: { slug: "elsykkel" },
    update: {},
    create: {
      name: "Elsykkel",
      slug: "elsykkel",
      description: "Elektriske sykler for by, tur og pendling",
      sortOrder: 10
    }
  });

  const brand = await prisma.brand.upsert({
    where: { slug: "wheelix" },
    update: {},
    create: {
      name: "Wheelix",
      slug: "wheelix",
      description: "Wheelix private label"
    }
  });

  const product = await prisma.product.upsert({
    where: { slug: "wheelix-urban-e1" },
    update: {},
    create: {
      categoryId: category.id,
      brandId: brand.id,
      name: "Wheelix Urban E1",
      slug: "wheelix-urban-e1",
      description: "Komfortabel elsykkel for norske bygater",
      status: "ACTIVE",
      basePriceNok: "24990.00",
      images: {
        create: {
          url: "/images/products/sykkel2.png",
          altText: "Wheelix Urban E1 elsykkel",
          isPrimary: true
        }
      },
      variants: {
        create: {
          sku: "SYK-URBAN-E1-M-BLK",
          name: "Medium / Svart",
          color: "Svart",
          size: "M",
          inventory: {
            create: {
              quantity: 12,
              location: "oslo-main"
            }
          }
        }
      }
    }
  });

  console.log(`Seeded ${category.name}, ${brand.name}, ${product.name}`);
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}

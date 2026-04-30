import { PrismaClient } from "@prisma/client";
import { slugify } from "@/lib/utils";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "guitars-basses" },
      update: {},
      create: {
        name: "Guitars & Basses",
        slug: "guitars-basses",
        description: "Electric guitars, acoustic guitars, and bass guitars",
      },
    }),
    prisma.category.upsert({
      where: { slug: "drums-percussion" },
      update: {},
      create: {
        name: "Drums & Percussion",
        slug: "drums-percussion",
        description: "Drum kits, cymbals, and percussion instruments",
      },
    }),
    prisma.category.upsert({
      where: { slug: "studio-equipment" },
      update: {},
      create: {
        name: "Studio Equipment",
        slug: "studio-equipment",
        description: "Audio interfaces, monitors, headphones, and recording gear",
      },
    }),
    prisma.category.upsert({
      where: { slug: "keyboards" },
      update: {},
      create: {
        name: "Keyboards & Synths",
        slug: "keyboards",
        description: "Digital pianos, keyboards, and synthesizers",
      },
    }),
  ]);

  console.log(`Created ${categories.length} categories`);

  // Create brands
  const brands = await Promise.all([
    prisma.brand.upsert({
      where: { slug: "hartke" },
      update: {},
      create: { name: "Hartke", slug: "hartke" },
    }),
    prisma.brand.upsert({
      where: { slug: "presonus" },
      update: {},
      create: { name: "PreSonus", slug: "presonus" },
    }),
    prisma.brand.upsert({
      where: { slug: "fender" },
      update: {},
      create: { name: "Fender", slug: "fender" },
    }),
    prisma.brand.upsert({
      where: { slug: "yamaha" },
      update: {},
      create: { name: "Yamaha", slug: "yamaha" },
    }),
  ]);

  console.log(`Created ${brands.length} brands`);

  // Create products
  const products = [
    {
      name: "Hartke VX410 Bass Cabinet",
      description: "400W 4x10 bass cabinet with HyDrive speakers for powerful, deep bass tones.",
      price: 499.99,
      categorySlug: "guitars-basses",
      brandSlug: "hartke",
      inventory: 15,
    },
    {
      name: "PreSonus AudioBox USB 96",
      description: "Compact 2x2 USB audio interface with 2 mic preamps.",
      price: 99.99,
      categorySlug: "studio-equipment",
      brandSlug: "presonus",
      inventory: 25,
    },
    {
      name: "Yamaha Stage Custom Birch",
      description: "5-piece drum kit with birch shells and hardware.",
      price: 799.99,
      categorySlug: "drums-percussion",
      brandSlug: "yamaha",
      inventory: 8,
    },
    {
      name: "Fender Player Stratocaster",
      description: "Classic alder body with three Player Series single-coil pickups.",
      price: 849.99,
      categorySlug: "guitars-basses",
      brandSlug: "fender",
      inventory: 12,
    },
    {
      name: "PreSonus Eris E8 Studio Monitors",
      description: "8-inch 2-way studio monitors with accurate sound reproduction.",
      price: 399.99,
      categorySlug: "studio-equipment",
      brandSlug: "presonus",
      inventory: 20,
    },
  ];

  for (const product of products) {
    const slug = slugify(product.name);
    const category = categories.find((c) => c.slug === product.categorySlug);
    const brand = brands.find((b) => b.slug === product.brandSlug);

    if (category) {
      await prisma.product.upsert({
        where: { slug },
        update: {},
        create: {
          name: product.name,
          slug,
          description: product.description,
          price: product.price,
          categoryId: category.id,
          brandId: brand?.id,
          inventory: product.inventory,
          sku: `SKU-${slug.toUpperCase()}`,
        },
      });
    }
  }

  console.log(`Created ${products.length} products`);
  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

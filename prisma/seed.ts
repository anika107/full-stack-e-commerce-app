import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/db";

// Seeds the categories, products, and inventory tables with data shaped like
// the admin panel's mock catalog (src/lib/admin-data.ts). Run with:
//   npm run db:seed
// Safe to re-run: it clears the three tables first (FK order).

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

const CATEGORIES = [
  "Audio",
  "Wearables",
  "Smart Home",
  "Accessories",
  "Gaming",
  "Cameras",
] as const;

type CategoryName = (typeof CATEGORIES)[number];

type ProductSeed = {
  name: string;
  category: CategoryName;
  price: number;
  quantity: number;
  createdDaysAgo: number;
  updatedDaysAgo: number;
};

// First 12 match the mock catalog exactly; the rest round out each category.
const PRODUCTS: ProductSeed[] = [
  { name: "Aurora Wireless Headphones", category: "Audio", price: 129, quantity: 142, createdDaysAgo: 150, updatedDaysAgo: 2 },
  { name: "Pulse Earbuds Pro", category: "Audio", price: 89, quantity: 64, createdDaysAgo: 140, updatedDaysAgo: 3 },
  { name: "Echo Studio Speaker", category: "Audio", price: 179, quantity: 34, createdDaysAgo: 96, updatedDaysAgo: 5 },
  { name: "Wave Over-Ear Headphones", category: "Audio", price: 99, quantity: 76, createdDaysAgo: 88, updatedDaysAgo: 6 },
  { name: "Mic Drop USB Microphone", category: "Audio", price: 69, quantity: 12, createdDaysAgo: 45, updatedDaysAgo: 4 },

  { name: "Nova Smartwatch S2", category: "Wearables", price: 199, quantity: 8, createdDaysAgo: 130, updatedDaysAgo: 4 },
  { name: "Stride Fitness Band", category: "Wearables", price: 59, quantity: 210, createdDaysAgo: 120, updatedDaysAgo: 6 },
  { name: "Nova Smartwatch Mini", category: "Wearables", price: 149, quantity: 47, createdDaysAgo: 80, updatedDaysAgo: 7 },
  { name: "Pulse Heart Rate Strap", category: "Wearables", price: 39, quantity: 88, createdDaysAgo: 75, updatedDaysAgo: 9 },
  { name: "Zen Sleep Ring", category: "Wearables", price: 119, quantity: 5, createdDaysAgo: 38, updatedDaysAgo: 3 },

  { name: "Halo Smart Bulb 4-Pack", category: "Smart Home", price: 39, quantity: 12, createdDaysAgo: 110, updatedDaysAgo: 7 },
  { name: "Lumen Smart Speaker", category: "Smart Home", price: 79, quantity: 0, createdDaysAgo: 100, updatedDaysAgo: 8 },
  { name: "Halo Smart Plug 2-Pack", category: "Smart Home", price: 29, quantity: 160, createdDaysAgo: 92, updatedDaysAgo: 10 },
  { name: "Lumen Video Doorbell", category: "Smart Home", price: 139, quantity: 22, createdDaysAgo: 66, updatedDaysAgo: 12 },
  { name: "Breeze Smart Thermostat", category: "Smart Home", price: 119, quantity: 9, createdDaysAgo: 52, updatedDaysAgo: 5 },

  { name: "Orbit Charging Pad", category: "Accessories", price: 29, quantity: 320, createdDaysAgo: 95, updatedDaysAgo: 9 },
  { name: "Pulse Charging Cable", category: "Accessories", price: 19, quantity: 18, createdDaysAgo: 90, updatedDaysAgo: 10 },
  { name: "Orbit GaN Charger 65W", category: "Accessories", price: 49, quantity: 240, createdDaysAgo: 84, updatedDaysAgo: 11 },
  { name: "Shield Tempered Glass 2-Pack", category: "Accessories", price: 15, quantity: 300, createdDaysAgo: 70, updatedDaysAgo: 13 },
  { name: "Vault Laptop Sleeve", category: "Accessories", price: 39, quantity: 65, createdDaysAgo: 60, updatedDaysAgo: 14 },

  { name: "Titan Mechanical Keyboard", category: "Gaming", price: 149, quantity: 95, createdDaysAgo: 85, updatedDaysAgo: 11 },
  { name: "Volt RGB Mouse", category: "Gaming", price: 49, quantity: 140, createdDaysAgo: 80, updatedDaysAgo: 13 },
  { name: "Rift Gaming Headset", category: "Gaming", price: 89, quantity: 58, createdDaysAgo: 62, updatedDaysAgo: 15 },
  { name: "Blaze Mouse Pad XL", category: "Gaming", price: 24, quantity: 110, createdDaysAgo: 55, updatedDaysAgo: 16 },
  { name: "Core Game Controller", category: "Gaming", price: 59, quantity: 0, createdDaysAgo: 40, updatedDaysAgo: 17 },

  { name: "Prism 4K Action Cam", category: "Cameras", price: 299, quantity: 26, createdDaysAgo: 70, updatedDaysAgo: 15 },
  { name: "Focus 50mm Lens", category: "Cameras", price: 449, quantity: 4, createdDaysAgo: 60, updatedDaysAgo: 20 },
  { name: "Prism Tripod Pro", category: "Cameras", price: 79, quantity: 41, createdDaysAgo: 48, updatedDaysAgo: 18 },
  { name: "Focus Camera Bag", category: "Cameras", price: 59, quantity: 33, createdDaysAgo: 42, updatedDaysAgo: 19 },
  { name: "Lumen Ring Light", category: "Cameras", price: 45, quantity: 0, createdDaysAgo: 30, updatedDaysAgo: 21 },
];

async function main() {
  // Clear in FK order so re-runs are idempotent.
  await prisma.inventory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  const categoryIds = new Map<CategoryName, string>();
  for (const name of CATEGORIES) {
    const category = await prisma.category.create({ data: { name } });
    categoryIds.set(name, category.id);
  }

  await prisma.product.createMany({
    data: PRODUCTS.map((p) => ({
      name: p.name,
      price: p.price,
      categoryId: categoryIds.get(p.category)!,
      createdAt: daysAgo(p.createdDaysAgo),
    })),
  });

  const created = await prisma.product.findMany();
  const idByName = new Map(created.map((p) => [p.name, p.id]));

  await prisma.inventory.createMany({
    data: PRODUCTS.map((p) => ({
      productId: idByName.get(p.name)!,
      quantity: p.quantity,
      updatedAt: daysAgo(p.updatedDaysAgo),
    })),
  });

  const [categoryCount, productCount, inventoryCount, outOfStock] = await Promise.all([
    prisma.category.count(),
    prisma.product.count(),
    prisma.inventory.count(),
    prisma.inventory.count({ where: { quantity: 0 } }),
  ]);

  console.log(
    `Seeded ${categoryCount} categories, ${productCount} products, ${inventoryCount} inventory rows (${outOfStock} out of stock)`,
  );

  // Admin accounts are always created from outside (never self-registered),
  // so they're upserted — never wiped by a re-seed.
  const adminEmail = process.env.ADMIN_SEED_EMAIL ?? "admin@storefront.dev";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? "storefront123";
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Store Owner",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: "ADMIN",
    },
  });

  console.log(`Admin user ready: ${admin.email} (${admin.role.toLowerCase()})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

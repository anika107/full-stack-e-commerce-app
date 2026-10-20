import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/db";

// Seeds the catalog (categories, products, inventory), demo customers, and
// 12 months of orders so the admin dashboard can read real data. Run with:
//   npm run db:seed
// Safe to re-run: catalog and orders are cleared first (FK order); users are
// upserted, never wiped.

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

// Category-relevant dummy photos from Unsplash's CDN (all URLs verified at
// write time). Per-product mapping first, category fallback second.
const u = (id: string) => `https://images.unsplash.com/${id}?w=600&h=750&fit=crop&q=80&auto=format`;

const PRODUCT_IMAGE_URLS: Record<string, string> = {
  "Aurora Wireless Headphones": u("photo-1505740420928-5e560c06d30e"),
  "Pulse Earbuds Pro": u("photo-1572569511254-d8f925fe2cbb"),
  "Echo Studio Speaker": u("photo-1545454675-3531b543be5d"),
  "Wave Over-Ear Headphones": u("photo-1484704849700-f032a568e944"),
  "Mic Drop USB Microphone": u("photo-1590602847861-f357a9332bbc"),
  "Nova Smartwatch S2": u("photo-1523275335684-37898b6baf30"),
  "Stride Fitness Band": u("photo-1575311373937-040b8e1fd5b6"),
  "Nova Smartwatch Mini": u("photo-1579586337278-3befd40fd17a"),
  "Pulse Heart Rate Strap": u("photo-1508685096489-7aacd43bd3b1"),
  "Zen Sleep Ring": u("photo-1605100804763-247f67b3557e"),
  "Halo Smart Bulb 4-Pack": u("photo-1550985616-10810253b84d"),
  "Lumen Smart Speaker": u("photo-1558002038-1055907df827"),
  "Halo Smart Plug 2-Pack": u("photo-1523206489230-c012c64b2b48"),
  "Lumen Video Doorbell": u("photo-1541140532154-b024d705b90a"),
  "Breeze Smart Thermostat": u("photo-1558002038-1055907df827"),
  "Orbit Charging Pad": u("photo-1526925539332-aa3b66e35444"),
  "Pulse Charging Cable": u("photo-1544816155-12df9643f363"),
  "Orbit GaN Charger 65W": u("photo-1523206489230-c012c64b2b48"),
  "Shield Tempered Glass 2-Pack": u("photo-1544816155-12df9643f363"),
  "Vault Laptop Sleeve": u("photo-1544816155-12df9643f363"),
  "Titan Mechanical Keyboard": u("photo-1587829741301-dc798b83add3"),
  "Volt RGB Mouse": u("photo-1527864550417-7fd91fc51a46"),
  "Rift Gaming Headset": u("photo-1505740420928-5e560c06d30e"),
  "Blaze Mouse Pad XL": u("photo-1526925539332-aa3b66e35444"),
  "Core Game Controller": u("photo-1606144042614-b2417e99c4e3"),
  "Prism 4K Action Cam": u("photo-1502920917128-1aa500764cbd"),
  "Focus 50mm Lens": u("photo-1516724562728-afc824a36e84"),
  "Prism Tripod Pro": u("photo-1516035069371-29a1b244cc32"),
  "Focus Camera Bag": u("photo-1553062407-98eeb64c6a62"),
  "Lumen Ring Light": u("photo-1598488035139-bdbb2231ce04"),
};

const PRODUCT_DESCRIPTIONS: Record<string, string> = {
  "Aurora Wireless Headphones":
    "Flagship over-ear headphones with active noise cancellation, 40-hour battery life, and plush memory-foam ear cushions for all-day comfort.",
  "Pulse Earbuds Pro":
    "True wireless earbuds with punchy sound, a pocketable charging case, and IPX5 sweat resistance for workouts and commutes.",
  "Echo Studio Speaker":
    "Room-filling smart speaker with rich bass, far-field mics, and multiroom pairing for whole-home audio.",
  "Wave Over-Ear Headphones":
    "Comfort-first over-ear headphones with a neutral sound signature, folding design, and a braided detachable cable.",
  "Mic Drop USB Microphone":
    "Plug-and-play USB condenser microphone with cardioid pickup and a built-in mute tap for streams and calls.",
  "Nova Smartwatch S2":
    "A bright AMOLED smartwatch with GPS, heart-rate tracking, sleep insights, and a two-week battery.",
  "Stride Fitness Band":
    "A lightweight activity band that tracks steps, workouts, and recovery with a focus on all-day wearability.",
  "Nova Smartwatch Mini":
    "The compact edition: same health tracking as the S2 in a smaller case with swappable bands.",
  "Pulse Heart Rate Strap":
    "Chest-worn heart-rate strap with dual Bluetooth/ANT+ for accurate training data on every ride and run.",
  "Zen Sleep Ring":
    "A titanium sleep ring that quietly tracks heart rate, temperature, and sleep stages — no screen, no buzzing.",
  "Halo Smart Bulb 4-Pack":
    "Dimmable smart bulbs with warm-to-cool white tuning, schedules, and voice-assistant control.",
  "Lumen Smart Speaker":
    "A fabric-wrapped smart speaker with clear 360° sound and hands-free control of your connected home.",
  "Halo Smart Plug 2-Pack":
    "Compact smart plugs that make any appliance app-controlled — schedules, timers, and energy monitoring included.",
  "Lumen Video Doorbell":
    "A 2K video doorbell with package detection, two-way talk, and night vision for peace of mind.",
  "Breeze Smart Thermostat":
    "A learning thermostat that trims your energy bill with smart schedules, geofencing, and room sensors.",
  "Orbit Charging Pad":
    "A slim 15W wireless charging pad with anti-slip surface and foreign-object detection.",
  "Pulse Charging Cable":
    "Reinforced braided USB-C cable rated for 30,000 bends — the one that lives in your bag.",
  "Orbit GaN Charger 65W":
    "A pocket-sized GaN charger that fast-charges a laptop, phone, and earbuds at once.",
  "Shield Tempered Glass 2-Pack":
    "9H tempered glass screen protectors with an easy-alignment frame and oleophobic coating.",
  "Vault Laptop Sleeve":
    "A padded felt sleeve with a magnetic flap that fits 13–14\" laptops and slips into any bag.",
  "Titan Mechanical Keyboard":
    "Hot-swappable mechanical keyboard with RGB backlighting, gasket mount, and a satisfying thock.",
  "Volt RGB Mouse":
    "A lightweight gaming mouse with a 26K sensor, six programmable buttons, and underglow RGB.",
  "Rift Gaming Headset":
    "Wired gaming headset with spatial audio, a flip-to-mute mic, and memory-foam earcups for long sessions.",
  "Blaze Mouse Pad XL":
    "A 90×40cm stitched-edge desk mat with a smooth glide surface and non-slip base.",
  "Core Game Controller":
    "A comfortable wireless controller with hall-effect sticks, back buttons, and 30-hour battery.",
  "Prism 4K Action Cam":
    "A rugged 4K action camera with stabilization, waterproof housing, and a front display for vlogging.",
  "Focus 50mm Lens":
    "A fast 50mm prime with creamy bokeh and metal barrel — the classic portrait workhorse.",
  "Prism Tripod Pro":
    "A carbon-fiber travel tripod with fluid pan head that folds to 40cm and holds 8kg.",
  "Focus Camera Bag":
    "A weatherproof camera bag with modular dividers, side access, and a padded laptop slot.",
  "Lumen Ring Light":
    "An 18\" ring light with adjustable color temperature and a phone mount for flawless calls and streams.",
};

const FALLBACK_DESCRIPTION =
  "A ShopPilot catalog pick — quality-checked, fairly priced, and ready to ship.";

const CATEGORY_IMAGE_URLS: Record<CategoryName, string> = {
  Audio: u("photo-1505740420928-5e560c06d30e"),
  Wearables: u("photo-1523275335684-37898b6baf30"),
  "Smart Home": u("photo-1558002038-1055907df827"),
  Accessories: u("photo-1523206489230-c012c64b2b48"),
  Gaming: u("photo-1587829741301-dc798b83add3"),
  Cameras: u("photo-1516035069371-29a1b244cc32"),
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
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
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
      imageUrl: PRODUCT_IMAGE_URLS[p.name] ?? CATEGORY_IMAGE_URLS[p.category],
      description: PRODUCT_DESCRIPTIONS[p.name] ?? FALLBACK_DESCRIPTION,
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
  const adminEmail = process.env.ADMIN_SEED_EMAIL ?? "admin@gmail.com";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? "admin123";
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

  await seedCustomersAndOrders();
}

const CUSTOMER_NAMES = [
  "Jamie Rivera", "Sam Okafor", "Priya Nair", "Diego Costa", "Lena Fischer",
  "Tom Becker", "Aya Tanaka", "Marcus Lee", "Sofia Rossi", "Kenji Sato",
  "Hana Kim", "Omar Haddad", "Emma Novak", "Lucas Meyer", "Nadia Ali",
  "Felix Braun", "Mira Patel", "Jonas Lind", "Yuki Mori", "Grace Osei",
  "Ivan Petrov", "Chloe Dubois", "Ravi Menon", "Zoe Walker",
] as const;

type OrderStatus = "PAID" | "PENDING" | "REFUNDED" | "FAILED";

// Weighted to look like a healthy store: mostly paid, few failed.
function randomStatus(): OrderStatus {
  const roll = Math.random();
  if (roll < 0.75) return "PAID";
  if (roll < 0.87) return "PENDING";
  if (roll < 0.95) return "REFUNDED";
  return "FAILED";
}

// A random instant within the calendar month `monthsAgo` months before now,
// clamped to the current time for the running month.
function randomDateInMonth(monthsAgo: number): Date {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const end = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 1);
  const clampedEnd = end > now ? now : end;
  return new Date(start.getTime() + Math.random() * (clampedEnd.getTime() - start.getTime()));
}

async function seedCustomersAndOrders() {
  // Demo customers are upserted like the admin — never wiped by a re-seed.
  const customers = [];
  for (let i = 0; i < CUSTOMER_NAMES.length; i++) {
    const email = `customer${String(i + 1).padStart(2, "0")}@example.com`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name: CUSTOMER_NAMES[i],
        email,
        passwordHash: await bcrypt.hash("customer123", 10),
        role: "CUSTOMER",
      },
    });
    customers.push(user);
  }

  const products = await prisma.product.findMany();
  const productPool = products.map((p) => ({ id: p.id, price: Number(p.price) }));

  // 12 months of orders, growing month over month so the dashboard chart
  // trends upward like real sales data.
  const orders = [];
  const items = [];
  for (let monthsAgo = 11; monthsAgo >= 0; monthsAgo--) {
    const count = Math.round(35 + (11 - monthsAgo) * 8 + Math.random() * 6);
    for (let i = 0; i < count; i++) {
      const orderId = crypto.randomUUID();
      const customer = customers[Math.floor(Math.random() * customers.length)];
      orders.push({
        id: orderId,
        customerId: customer.id,
        status: randomStatus(),
        createdAt: randomDateInMonth(monthsAgo),
      });

      // 1–4 distinct items per order, price snapshotted at order time.
      const itemCount = 1 + Math.floor(Math.random() * 4);
      const picked = [...productPool].sort(() => Math.random() - 0.5).slice(0, itemCount);
      for (const product of picked) {
        items.push({
          id: crypto.randomUUID(),
          orderId,
          productId: product.id,
          quantity: 1 + Math.floor(Math.random() * 3),
          unitPrice: product.price,
        });
      }
    }
  }

  await prisma.order.createMany({ data: orders });
  await prisma.orderItem.createMany({ data: items });

  console.log(
    `Seeded ${customers.length} demo customers, ${orders.length} orders, ${items.length} order items`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

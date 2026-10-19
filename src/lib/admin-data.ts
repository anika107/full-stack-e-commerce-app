import type { IconName } from "@/components/admin/icons";

// Mock data for the admin panel UI. Replace with Prisma queries when wiring up the backend.

export type ProductStatus = "active" | "draft" | "archived";
export type OrderStatus = "paid" | "pending" | "refunded" | "failed";

export type Kpi = {
  label: string;
  value: string;
  delta: { direction: "up" | "down"; good: boolean; text: string; period: string };
  spark: number[];
};

export const kpis: Kpi[] = [
  {
    label: "Total revenue",
    value: "$162.8K",
    delta: { direction: "up", good: true, text: "+12.4%", period: "vs last month" },
    spark: [8.2, 9.1, 9.8, 11.2, 10.4, 11.6, 12.4, 12.9, 13.8, 14.2, 15.1, 16.3],
  },
  {
    label: "Orders",
    value: "1,429",
    delta: { direction: "up", good: true, text: "+8.1%", period: "vs last month" },
    spark: [96, 104, 98, 115, 109, 122, 118, 131, 126, 138, 133, 149],
  },
  {
    label: "Products",
    value: "86",
    delta: { direction: "up", good: true, text: "+3", period: "this month" },
    spark: [72, 74, 75, 78, 79, 80, 81, 82, 83, 84, 85, 86],
  },
  {
    label: "Stock alerts",
    value: "5",
    delta: { direction: "down", good: true, text: "-2", period: "vs last month" },
    spark: [11, 10, 12, 9, 10, 8, 9, 8, 7, 8, 6, 5],
  },
];

export const revenueSeries = [
  { label: "Nov 2025", value: 9.8 },
  { label: "Dec 2025", value: 12.1 },
  { label: "Jan 2026", value: 10.4 },
  { label: "Feb 2026", value: 11.2 },
  { label: "Mar 2026", value: 13.1 },
  { label: "Apr 2026", value: 12.4 },
  { label: "May 2026", value: 14.8 },
  { label: "Jun 2026", value: 13.6 },
  { label: "Jul 2026", value: 16.2 },
  { label: "Aug 2026", value: 15.1 },
  { label: "Sep 2026", value: 17.8 },
  { label: "Oct 2026", value: 19.4 },
];

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: ProductStatus;
  updated: string;
};

export const products: Product[] = [
  { id: "p-1", name: "Aurora Wireless Headphones", sku: "AU-1001", category: "Audio", price: 129, stock: 142, status: "active", updated: "Oct 16, 2026" },
  { id: "p-2", name: "Pulse Earbuds Pro", sku: "AU-1002", category: "Audio", price: 89, stock: 64, status: "active", updated: "Oct 15, 2026" },
  { id: "p-3", name: "Nova Smartwatch S2", sku: "WE-2001", category: "Wearables", price: 199, stock: 8, status: "active", updated: "Oct 14, 2026" },
  { id: "p-4", name: "Stride Fitness Band", sku: "WE-2002", category: "Wearables", price: 59, stock: 210, status: "active", updated: "Oct 12, 2026" },
  { id: "p-5", name: "Halo Smart Bulb 4-Pack", sku: "SH-3001", category: "Smart Home", price: 39, stock: 12, status: "active", updated: "Oct 11, 2026" },
  { id: "p-6", name: "Lumen Smart Speaker", sku: "SH-3002", category: "Smart Home", price: 79, stock: 0, status: "draft", updated: "Oct 10, 2026" },
  { id: "p-7", name: "Orbit Charging Pad", sku: "AC-4001", category: "Accessories", price: 29, stock: 320, status: "active", updated: "Oct 9, 2026" },
  { id: "p-8", name: "Pulse Charging Cable", sku: "AC-4003", category: "Accessories", price: 19, stock: 18, status: "active", updated: "Oct 8, 2026" },
  { id: "p-9", name: "Titan Mechanical Keyboard", sku: "GA-5001", category: "Gaming", price: 149, stock: 95, status: "active", updated: "Oct 7, 2026" },
  { id: "p-10", name: "Volt RGB Mouse", sku: "GA-5002", category: "Gaming", price: 49, stock: 140, status: "draft", updated: "Oct 5, 2026" },
  { id: "p-11", name: "Prism 4K Action Cam", sku: "CA-6001", category: "Cameras", price: 299, stock: 26, status: "active", updated: "Oct 3, 2026" },
  { id: "p-12", name: "Focus 50mm Lens", sku: "CA-6002", category: "Cameras", price: 449, stock: 4, status: "archived", updated: "Sep 28, 2026" },
];

export type Order = {
  id: string;
  customer: string;
  email: string;
  items: number;
  total: number;
  status: OrderStatus;
  date: string;
};

export const orders: Order[] = [
  { id: "1042", customer: "Jamie Rivera", email: "jamie@example.com", items: 2, total: 248, status: "paid", date: "Oct 18, 2026" },
  { id: "1041", customer: "Sam Okafor", email: "sam@example.com", items: 1, total: 129, status: "pending", date: "Oct 18, 2026" },
  { id: "1040", customer: "Priya Nair", email: "priya@example.com", items: 3, total: 447, status: "paid", date: "Oct 17, 2026" },
  { id: "1039", customer: "Diego Costa", email: "diego@example.com", items: 1, total: 79, status: "refunded", date: "Oct 17, 2026" },
  { id: "1038", customer: "Lena Fischer", email: "lena@example.com", items: 2, total: 168, status: "paid", date: "Oct 16, 2026" },
  { id: "1037", customer: "Tom Becker", email: "tom@example.com", items: 1, total: 89, status: "failed", date: "Oct 15, 2026" },
  { id: "1036", customer: "Aya Tanaka", email: "aya@example.com", items: 1, total: 199, status: "paid", date: "Oct 15, 2026" },
  { id: "1035", customer: "Marcus Lee", email: "marcus@example.com", items: 2, total: 38, status: "paid", date: "Oct 14, 2026" },
  { id: "1034", customer: "Sofia Rossi", email: "sofia@example.com", items: 4, total: 516, status: "paid", date: "Oct 13, 2026" },
  { id: "1033", customer: "Kenji Sato", email: "kenji@example.com", items: 1, total: 149, status: "pending", date: "Oct 12, 2026" },
  { id: "1032", customer: "Hana Kim", email: "hana@example.com", items: 2, total: 228, status: "paid", date: "Oct 12, 2026" },
  { id: "1031", customer: "Omar Haddad", email: "omar@example.com", items: 1, total: 29, status: "refunded", date: "Oct 11, 2026" },
];

export type CategoryInfo = {
  id: string;
  name: string;
  icon: IconName;
  count: number;
  revenue: number; // $K
};

export const categories: CategoryInfo[] = [
  { id: "cat-audio", name: "Audio", icon: "speaker", count: 24, revenue: 48.2 },
  { id: "cat-wearables", name: "Wearables", icon: "watch", count: 17, revenue: 36.9 },
  { id: "cat-smarthome", name: "Smart Home", icon: "home", count: 14, revenue: 29.4 },
  { id: "cat-accessories", name: "Accessories", icon: "plug", count: 20, revenue: 12.8 },
  { id: "cat-gaming", name: "Gaming", icon: "gamepad", count: 7, revenue: 21.6 },
  { id: "cat-cameras", name: "Cameras", icon: "camera", count: 4, revenue: 18.3 },
];

export type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  reorder: number;
  updated: string;
};

export const inventory: InventoryItem[] = [
  { id: "p-1", name: "Aurora Wireless Headphones", sku: "AU-1001", category: "Audio", quantity: 142, reorder: 20, updated: "Oct 16, 2026" },
  { id: "p-2", name: "Pulse Earbuds Pro", sku: "AU-1002", category: "Audio", quantity: 64, reorder: 25, updated: "Oct 15, 2026" },
  { id: "p-3", name: "Nova Smartwatch S2", sku: "WE-2001", category: "Wearables", quantity: 8, reorder: 15, updated: "Oct 14, 2026" },
  { id: "p-4", name: "Stride Fitness Band", sku: "WE-2002", category: "Wearables", quantity: 210, reorder: 40, updated: "Oct 12, 2026" },
  { id: "p-5", name: "Halo Smart Bulb 4-Pack", sku: "SH-3001", category: "Smart Home", quantity: 12, reorder: 20, updated: "Oct 11, 2026" },
  { id: "p-6", name: "Lumen Smart Speaker", sku: "SH-3002", category: "Smart Home", quantity: 0, reorder: 15, updated: "Oct 10, 2026" },
  { id: "p-7", name: "Orbit Charging Pad", sku: "AC-4001", category: "Accessories", quantity: 320, reorder: 50, updated: "Oct 9, 2026" },
  { id: "p-8", name: "Pulse Charging Cable", sku: "AC-4003", category: "Accessories", quantity: 18, reorder: 25, updated: "Oct 8, 2026" },
  { id: "p-9", name: "Titan Mechanical Keyboard", sku: "GA-5001", category: "Gaming", quantity: 95, reorder: 30, updated: "Oct 7, 2026" },
  { id: "p-10", name: "Volt RGB Mouse", sku: "GA-5002", category: "Gaming", quantity: 140, reorder: 35, updated: "Oct 5, 2026" },
  { id: "p-11", name: "Prism 4K Action Cam", sku: "CA-6001", category: "Cameras", quantity: 26, reorder: 10, updated: "Oct 3, 2026" },
  { id: "p-12", name: "Focus 50mm Lens", sku: "CA-6002", category: "Cameras", quantity: 4, reorder: 8, updated: "Sep 28, 2026" },
];

// Items at or below their reorder point (includes out-of-stock).
export const lowStock = inventory.filter((i) => i.quantity <= i.reorder);

export const totalUnits = inventory.reduce((sum, i) => sum + i.quantity, 0);

import Link from "next/link";
import { Suspense } from "react";
import { CartBadge } from "@/components/storefront/cart-badge";
import { Icon } from "@/components/admin/icons";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
];

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream font-sans text-stone-900 antialiased dark:bg-stone-950 dark:text-stone-50">
      <header className="sticky top-0 z-20 border-b border-stone-200/70 bg-cream/85 backdrop-blur-md dark:border-stone-800/70 dark:bg-stone-950/85">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-8 px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
              <Icon name="package" className="h-4 w-4 text-white" />
            </span>
            <span className="font-display text-xl font-semibold tracking-tight">ShopPilot</span>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative rounded-full px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:text-stone-950 dark:text-stone-400 dark:hover:text-stone-50"
              >
                {item.label}
                <span className="absolute inset-x-4 -bottom-px h-px origin-left scale-x-0 bg-stone-950 transition-transform duration-200 group-hover:scale-x-100 dark:bg-stone-50" />
              </Link>
            ))}
          </nav>
          <div className="ml-auto">
            {/* Cookie read stays inside its own boundary so the shell stays static */}
            <Suspense
              fallback={
                <Link
                  href="/cart"
                  aria-label="Cart"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-stone-600 transition-colors hover:bg-stone-200/70 dark:text-stone-400 dark:hover:bg-stone-800"
                >
                  <Icon name="cart" className="h-5 w-5" />
                </Link>
              }
            >
              <CartBadge />
            </Suspense>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-stone-950 text-stone-300">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-16 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                <Icon name="package" className="h-4 w-4 text-white" />
              </span>
              <span className="font-display text-xl font-semibold tracking-tight text-white">
                ShopPilot
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone-400">
              Thoughtful tech for everyday life. Audio, wearables, smart home, and gaming —
              curated, fair-priced, shipped fast.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Shop</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/products" className="text-stone-400 transition-colors hover:text-white">
                  All products
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-stone-400 transition-colors hover:text-white">
                  Cart
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Company
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/admin" className="text-stone-400 transition-colors hover:text-white">
                  Admin
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-stone-800 py-6 text-center text-xs text-stone-500">
          © 2026 ShopPilot. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

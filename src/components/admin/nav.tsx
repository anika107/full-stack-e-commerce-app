"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./icons";

const NAV: { section: string; items: { href: string; label: string; icon: IconName; exact?: boolean }[] }[] = [
  {
    section: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: "dashboard", exact: true }],
  },
  {
    section: "Sales",
    items: [{ href: "/admin/orders", label: "Orders", icon: "cart" }],
  },
  {
    section: "Catalog",
    items: [
      { href: "/admin/products", label: "Products", icon: "package" },
      { href: "/admin/categories", label: "Categories", icon: "tags" },
    ],
  },
  {
    section: "Operations",
    items: [{ href: "/admin/inventory", label: "Inventory", icon: "warehouse" }],
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
      {NAV.map((group) => (
        <div key={group.section}>
          <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            {group.section}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-zinc-800 text-white"
                        : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100"
                    }`}
                  >
                    <Icon name={item.icon} className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

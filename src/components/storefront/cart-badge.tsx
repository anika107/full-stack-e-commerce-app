import Link from "next/link";
import { readCartLines } from "@/lib/cart";
import { Icon } from "@/components/admin/icons";

// Server component: reads the cart cookie so the header count is always real.
// Rendered inside a Suspense boundary by the storefront layout.
export async function CartBadge() {
  const lines = await readCartLines();
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${count} items`}
      className="relative flex h-9 items-center gap-2 rounded-full px-3 text-stone-600 transition-colors hover:bg-stone-200/70 hover:text-stone-950 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-50"
    >
      <Icon name="cart" className="h-5 w-5" />
      {count > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-semibold tabular-nums text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

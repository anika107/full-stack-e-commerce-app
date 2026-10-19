import type { Metadata } from "next";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { AdminNav } from "@/components/admin/nav";
import { Icon } from "@/components/admin/icons";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Storefront Admin" },
};

// The panel reads the session cookie on every request, so it renders
// per-request instead of being prerendered into the static shell.
export const instant = false;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user ?? null;
  const initials = user
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";
  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      {/* Sidebar (hidden below md) */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col bg-zinc-900 md:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-zinc-800 px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Icon name="package" className="h-4.5 w-4.5 text-white" />
          </span>
          <span className="text-sm font-semibold text-white">Storefront</span>
          <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
            Admin
          </span>
        </div>

        <AdminNav />

        <div className="space-y-3 border-t border-zinc-800 p-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800/60 hover:text-zinc-100"
          >
            <Icon name="store" className="h-4 w-4" />
            View store
          </Link>
          <div className="flex items-center gap-2.5 rounded-lg bg-zinc-800/50 px-3 py-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-xs font-semibold text-zinc-200">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-200">{user?.name}</p>
              <p className="truncate text-xs text-zinc-500">{user?.email}</p>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
            >
              <button
                type="submit"
                aria-label="Sign out"
                title="Sign out"
                className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-700/60 hover:text-zinc-100"
              >
                <Icon name="log-out" className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col md:pl-60">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-zinc-200 bg-white/80 px-6 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
          <span className="flex items-center gap-2 text-sm font-semibold md:hidden">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Icon name="package" className="h-4 w-4" />
            </span>
            Storefront
          </span>

          <div className="relative ml-auto hidden w-64 sm:block">
            <Icon
              name="search"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            />
            <input
              className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-zinc-600"
              placeholder="Search…"
              aria-label="Search"
            />
          </div>

          <button
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <Icon name="bell" className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-blue-500" />
          </button>

          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
            {initials}
          </span>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}

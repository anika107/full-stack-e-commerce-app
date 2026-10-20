import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getOrders, isOrderStatus } from "@/lib/services";
import { Badge } from "@/components/admin/ui/badge";
import { NavSelect } from "@/components/admin/nav-select";
import { PageHeader } from "@/components/admin/ui/page-header";
import { Td, Th } from "@/components/admin/ui/table";

export const metadata: Metadata = { title: "Orders" };

const TONE = { PAID: "good", PENDING: "warning", REFUNDED: "serious", FAILED: "critical" } as const;
const LABEL = { PAID: "Paid", PENDING: "Pending", REFUNDED: "Refunded", FAILED: "Failed" } as const;

const FILTERS = [
  { value: "all", label: "All orders" },
  { value: "PAID", label: "Paid" },
  { value: "PENDING", label: "Pending" },
  { value: "REFUNDED", label: "Refunded" },
  { value: "FAILED", label: "Failed" },
];

const PAGE_SIZE = 20;

function OrdersSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-9 w-56 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-96 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  return (
    <Suspense fallback={<OrdersSkeleton />}>
      <OrdersTable searchParams={searchParams} />
    </Suspense>
  );
}

async function OrdersTable({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status = params.status && isOrderStatus(params.status) ? params.status : "all";
  const page = Math.max(1, Number(params.page) || 1);

  const { rows, total, pageSize } = await getOrders({ status, page, pageSize: PAGE_SIZE });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const from = total === 0 ? 0 : (clampedPage - 1) * pageSize + 1;
  const to = Math.min(clampedPage * pageSize, total);

  const pageHref = (target: number) => {
    const search = new URLSearchParams();
    if (status !== "all") search.set("status", status);
    if (target > 1) search.set("page", String(target));
    const qs = search.toString();
    return qs ? `/admin/orders?${qs}` : "/admin/orders";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Review and manage customer orders."
        actions={
          <NavSelect
            param="status"
            value={status}
            options={FILTERS}
            ariaLabel="Filter orders"
            resetParams={["page"]}
          />
        }
      />

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <Th>Order</Th>
                <Th>Customer</Th>
                <Th right>Items</Th>
                <Th right>Total</Th>
                <Th>Status</Th>
                <Th>Date</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {rows.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                  <Td className="font-medium text-zinc-900 dark:text-zinc-50">#{order.id}</Td>
                  <Td>
                    <p className="font-medium text-zinc-900 dark:text-zinc-50">{order.customer}</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">{order.email}</p>
                  </Td>
                  <Td right>{order.items}</Td>
                  <Td right className="font-medium text-zinc-900 dark:text-zinc-50">
                    ${order.total.toFixed(2)}
                  </Td>
                  <Td>
                    <Badge tone={TONE[order.status]}>{LABEL[order.status]}</Badge>
                  </Td>
                  <Td className="whitespace-nowrap text-zinc-500 dark:text-zinc-400">{order.date}</Td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    No orders match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Showing {from}–{to} of {total}
          </p>
          <div className="flex gap-1">
            {clampedPage > 1 ? (
              <Link
                href={pageHref(clampedPage - 1)}
                className="flex h-8 items-center gap-1 rounded-lg border border-zinc-200 px-3 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                Previous
              </Link>
            ) : (
              <span className="flex h-8 items-center rounded-lg border border-zinc-200 px-3 text-xs font-medium text-zinc-300 dark:border-zinc-800 dark:text-zinc-600">
                Previous
              </span>
            )}
            {clampedPage < totalPages ? (
              <Link
                href={pageHref(clampedPage + 1)}
                className="flex h-8 items-center gap-1 rounded-lg border border-zinc-200 px-3 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                Next
              </Link>
            ) : (
              <span className="flex h-8 items-center rounded-lg border border-zinc-200 px-3 text-xs font-medium text-zinc-300 dark:border-zinc-800 dark:text-zinc-600">
                Next
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

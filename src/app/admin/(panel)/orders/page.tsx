import type { Metadata } from "next";
import { Suspense } from "react";
import { getOrders, ORDER_STATUS_META, ORDER_STATUSES } from "@/lib/services";
import { NavSelect } from "@/components/ui/nav-select";
import { OrdersTable } from "@/components/admin/orders-table";
import { PageHeader } from "@/components/admin/ui/page-header";
import { OrdersSkeleton } from "@/components/skeletons";
import { firstParam } from "@/lib/url";
import { parsePage } from "@/lib/pagination";

export const metadata: Metadata = { title: "Orders" };

const FILTERS = [
  { value: "all", label: "All orders" },
  ...ORDER_STATUSES.map((status) => ({ value: status, label: ORDER_STATUS_META[status].label })),
];

const PAGE_SIZE = 20;

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  return (
    <Suspense fallback={<OrdersSkeleton />}>
      <Orders searchParams={searchParams} />
    </Suspense>
  );
}

async function Orders({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const result = await getOrders({
    status: firstParam(params.status),
    page: parsePage(firstParam(params.page)),
    pageSize: PAGE_SIZE,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Review and manage customer orders."
        actions={
          <NavSelect
            param="status"
            value={result.status}
            options={FILTERS}
            ariaLabel="Filter orders"
            resetParams={["page"]}
          />
        }
      />
      <OrdersTable result={result} />
    </div>
  );
}

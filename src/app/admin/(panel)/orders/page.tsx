import type { Metadata } from "next";
import { Suspense } from "react";
import { getOrders, isOrderStatus } from "@/lib/services";
import { NavSelect } from "@/components/ui/nav-select";
import { OrdersTable } from "@/components/admin/orders-table";
import { PageHeader } from "@/components/admin/ui/page-header";
import { OrdersSkeleton } from "@/components/skeletons";

export const metadata: Metadata = { title: "Orders" };

const FILTERS = [
  { value: "all", label: "All orders" },
  { value: "PAID", label: "Paid" },
  { value: "PENDING", label: "Pending" },
  { value: "REFUNDED", label: "Refunded" },
  { value: "FAILED", label: "Failed" },
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
  const status = params.status && isOrderStatus(params.status) ? params.status : "all";
  const page = Math.max(1, Number(params.page) || 1);

  const result = await getOrders({ status, page, pageSize: PAGE_SIZE });

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
      <OrdersTable result={result} status={status} />
    </div>
  );
}

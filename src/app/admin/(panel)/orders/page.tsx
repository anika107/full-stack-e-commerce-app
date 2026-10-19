import type { Metadata } from "next";
import { orders, type OrderStatus } from "@/lib/admin-data";
import { Badge } from "@/components/admin/ui/badge";
import { PageHeader } from "@/components/admin/ui/page-header";
import { Select } from "@/components/admin/ui/select";
import { Td, Th } from "@/components/admin/ui/table";

export const metadata: Metadata = { title: "Orders" };

const TONE = { paid: "good", pending: "warning", refunded: "serious", failed: "critical" } as const;
const LABEL = { paid: "Paid", pending: "Pending", refunded: "Refunded", failed: "Failed" } as const;

const FILTERS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All orders" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "refunded", label: "Refunded" },
  { value: "failed", label: "Failed" },
];

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="Review and manage customer orders."
        actions={
          <Select
            ariaLabel="Filter orders"
            options={FILTERS}
            defaultValue="all"
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
              {orders.map((o) => (
                <tr key={o.id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                  <Td className="font-medium text-zinc-900 dark:text-zinc-50">#{o.id}</Td>
                  <Td>
                    <p className="font-medium text-zinc-900 dark:text-zinc-50">{o.customer}</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">{o.email}</p>
                  </Td>
                  <Td right>{o.items}</Td>
                  <Td right className="font-medium text-zinc-900 dark:text-zinc-50">
                    ${o.total.toFixed(2)}
                  </Td>
                  <Td>
                    <Badge tone={TONE[o.status]}>{LABEL[o.status]}</Badge>
                  </Td>
                  <Td className="whitespace-nowrap text-zinc-500 dark:text-zinc-400">{o.date}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

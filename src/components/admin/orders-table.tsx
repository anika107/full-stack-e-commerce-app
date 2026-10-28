import { Badge } from "./ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Td, Th } from "./ui/table";
import { buildUrl } from "@/lib/url";
import { formatMoney } from "@/lib/format";
import { ORDER_STATUS_META } from "@/lib/services";
import type { getOrders } from "@/lib/services";

type OrdersResult = Awaited<ReturnType<typeof getOrders>>;

// Orders table + pagination. The active filter comes from `result` (normalized
// by the service) and is used to build page links that preserve it.
export function OrdersTable({ result }: { result: OrdersResult }) {
  const { rows, total, page, pageSize, status } = result;

  const pageHref = (target: number) =>
    buildUrl("/admin/orders", {
      status: status === "all" ? undefined : status,
      page: target > 1 ? target : undefined,
    });

  return (
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
                  {formatMoney(order.total)}
                </Td>
                <Td>
                  <Badge tone={ORDER_STATUS_META[order.status].tone}>
                    {ORDER_STATUS_META[order.status].label}
                  </Badge>
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
      <div className="border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <Pagination total={total} page={page} pageSize={pageSize} hrefFor={pageHref} />
      </div>
    </div>
  );
}

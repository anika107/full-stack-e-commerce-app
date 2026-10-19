import type { ReactNode } from "react";

export function Th({
  children,
  right = false,
  className = "",
}: {
  children?: ReactNode;
  right?: boolean;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ${
        right ? "text-right" : "text-left"
      } ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  right = false,
  className = "",
}: {
  children?: ReactNode;
  right?: boolean;
  className?: string;
}) {
  return (
    <td
      className={`px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300 ${
        right ? "text-right tabular-nums" : ""
      } ${className}`}
    >
      {children}
    </td>
  );
}

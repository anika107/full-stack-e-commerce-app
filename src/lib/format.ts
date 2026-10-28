const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const formatMoney = (value: number) => money.format(value);

// "$1.2K" — raw dollars in, compact thousands out. Used by admin widgets.
export const formatK = (value: number) => `$${(value / 1000).toFixed(1)}K`;

// Compact KPI money: $1.2K above a thousand, whole dollars below.
export const formatCompactMoney = (value: number) =>
  value >= 1000 ? formatK(value) : `$${Math.round(value)}`;

const date = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export const formatDate = (value: Date) => date.format(value);

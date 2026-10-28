// Shared domain-agnostic types. Kept free of server-only imports so both
// server and client components can consume them.

// Uniform result for server actions: `ok` plus an optional user-facing message.
export type ActionState = { ok: boolean; message?: string };

// Uniform shape for paginated list queries. Services extend it with the
// effective filter values they normalized (e.g. { status: "all" }).
export type PageResult<T> = {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
};

// Chart-friendly series point; values are in dollars unless noted.
export type RevenuePoint = { label: string; value: number };

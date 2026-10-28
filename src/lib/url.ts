// URL helpers for the URL-driven filter pattern used across pages.

// Take the first value of a searchParams entry (they may be arrays).
export const firstParam = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

// Build a URL for a path with a new set of query params. Empty or undefined
// values are dropped so default filters don't pollute the URL.
export const buildUrl = (
  base: string,
  entries: Record<string, string | number | undefined>,
): string => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(entries)) {
    if (value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `${base}?${qs}` : base;
};

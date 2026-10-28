// Pagination math shared by list services, pages, and the <Pagination>
// component so windowing stays consistent everywhere.

export const parsePage = (value: string | undefined): number =>
  Math.max(1, Number(value) || 1);

export const pageWindow = (
  total: number,
  page: number,
  pageSize: number,
): { totalPages: number; clampedPage: number; from: number; to: number } => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const from = total === 0 ? 0 : (clampedPage - 1) * pageSize + 1;
  const to = Math.min(clampedPage * pageSize, total);
  return { totalPages, clampedPage, from, to };
};

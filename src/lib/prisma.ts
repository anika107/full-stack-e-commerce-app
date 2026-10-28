// Small helpers for working with Prisma error shapes.

export const isPrismaError = (error: unknown, code: string): boolean =>
  (error as { code?: string } | null)?.code === code;

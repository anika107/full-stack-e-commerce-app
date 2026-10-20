import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

// The gate every service getter calls first, so authorization can't be
// forgotten at a call site. cache() dedupes repeated calls within a render.
export const verifySession = cache(async () => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/admin/login");
  return session;
});

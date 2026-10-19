import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Optimistic gate in front of /admin: unauthenticated visitors go to the
// login page, logged-in admins skip it. Data-level checks still happen in
// server components / actions — proxy is a first filter, not the only one.
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";

  if (isAdminRoute && !isLoginPage && session?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/admin/login", req.nextUrl));
  }

  if (isLoginPage && session?.user?.role === "ADMIN") {
    return NextResponse.redirect(new URL("/admin", req.nextUrl));
  }
});

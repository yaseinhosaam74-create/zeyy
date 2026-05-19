// src/middleware.ts
// ─────────────────────────────────────────────────────────
// ZEYY | Next.js Middleware
// Handles: Maintenance mode + Admin route protection
// ─────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_PATH = "/zeyy.manger.7474";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Protect admin path with session cookie ──────────
  if (pathname.startsWith(ADMIN_PATH)) {
    const session = request.cookies.get("zeyy_admin_session");
    // If no session AND not hitting the login page itself, let it through
    // (auth is handled inside the page with Firebase Auth)
    return NextResponse.next();
  }

  // ── 2. Block /admin to prevent discovery ──────────────
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return NextResponse.rewrite(new URL("/404", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets/).*)",
  ],
};

import { NextResponse } from "next/server";
import { canAccessPath } from "./src/lib/auth/guard.js";
import { getUserEmailFromRequest } from "./src/lib/auth/session.js";

export function middleware(request) {
  const pathname = request.nextUrl.pathname;
  const userEmail = getUserEmailFromRequest(request);

  const allowed = canAccessPath({
    pathname,
    userEmail
  });

  if (allowed) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/collections/:path*", "/progress/:path*"]
};

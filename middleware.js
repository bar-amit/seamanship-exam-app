import { NextResponse } from "next/server";
import { getSessionCookieFromRequest, getUserEmailFromRequest } from "./src/lib/auth/session.js";
import { evaluateAccess } from "./src/lib/auth/middleware-policy.js";

export function middleware(request) {
  const pathname = request.nextUrl.pathname;
  const userEmail = getUserEmailFromRequest(request);
  const hasSession = Boolean(getSessionCookieFromRequest(request));

  const decision = evaluateAccess({
    pathname,
    userEmail,
    hasSession,
    allowlistRaw: process.env.ADMIN_ALLOWLIST
  });

  if (decision.action === "next") {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL(decision.destination, request.url));
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"]
};

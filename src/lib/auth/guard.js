import { isAllowlistedAdmin, parseAdminAllowlist } from "./allowlist.js";

const ADMIN_PREFIX = "/admin";
const AUTH_REQUIRED_PREFIXES = ["/dashboard", "/collections", "/progress", ADMIN_PREFIX];

export function isAdminPath(pathname) {
  return pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`);
}

export function requiresAuth(pathname) {
  return AUTH_REQUIRED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function canAccessPath({
  pathname,
  userEmail,
  hasSession = Boolean(userEmail),
  allowlistRaw = process.env.ADMIN_ALLOWLIST
}) {

  if (!requiresAuth(pathname)) {
    return true;
  }

  if (!hasSession) {
    return false;
  }

  if (!isAdminPath(pathname)) {
    return true;
  }

  if (!userEmail) {
    return false;
  }

  const allowlist = parseAdminAllowlist(allowlistRaw);
  return isAllowlistedAdmin(userEmail, allowlist);
}

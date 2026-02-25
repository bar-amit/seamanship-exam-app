import { isAllowlistedAdmin, parseAdminAllowlist } from "./allowlist.js";

const ADMIN_PREFIX = "/admin";
const AUTH_REQUIRED_PREFIXES = ["/dashboard", "/collections", "/progress", ADMIN_PREFIX];

function normalizePathname(pathname) {
  return String(pathname ?? "").toLowerCase();
}

export function isAdminPath(pathname) {
  const normalized = normalizePathname(pathname);
  return normalized === ADMIN_PREFIX || normalized.startsWith(`${ADMIN_PREFIX}/`);
}

export function requiresAuth(pathname) {
  const normalized = normalizePathname(pathname);
  return AUTH_REQUIRED_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`)
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

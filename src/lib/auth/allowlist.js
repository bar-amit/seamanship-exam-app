const DEFAULT_ADMIN_ALLOWLIST = "";

export function parseAdminAllowlist(rawValue = DEFAULT_ADMIN_ALLOWLIST) {
  return new Set(
    rawValue
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isAllowlistedAdmin(email, allowlist = parseAdminAllowlist(process.env.ADMIN_ALLOWLIST)) {
  if (!email) {
    return false;
  }
  return allowlist.has(email.trim().toLowerCase());
}

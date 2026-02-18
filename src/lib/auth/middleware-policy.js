import { canAccessPath, isAdminPath } from "./guard.js";

export function evaluateAccess({ pathname, userEmail, allowlistRaw = process.env.ADMIN_ALLOWLIST }) {
  const allowed = canAccessPath({ pathname, userEmail, allowlistRaw });

  if (allowed) {
    return { action: "next" };
  }

  if (isAdminPath(pathname)) {
    return { action: "redirect", destination: "/" };
  }

  return { action: "redirect", destination: "/" };
}

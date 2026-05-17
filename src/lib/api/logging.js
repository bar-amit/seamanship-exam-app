import { jsonError } from "./response.js";

function normalizeError(error, fallback) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message || fallback
    };
  }

  return {
    name: "Error",
    message: fallback
  };
}

export function buildApiErrorLog({ route, method, status, error, fallback = "Internal server error." }) {
  const normalized = normalizeError(error, fallback);

  return {
    event: "api.error",
    route,
    method,
    status,
    error: normalized
  };
}

export function logApiError({
  route,
  method,
  status,
  error,
  fallback,
  logger = console.error
}) {
  const entry = buildApiErrorLog({ route, method, status, error, fallback });
  logger(entry);
  return entry;
}

export function jsonLoggedError(error, { route, method, status = 500, fallback, logger } = {}) {
  logApiError({ route, method, status, error, fallback, logger });
  return jsonError(error, { status, fallback });
}

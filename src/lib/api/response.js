import { NextResponse } from "next/server";

export function jsonResult(result) {
  return NextResponse.json(result.body, { status: result.status });
}

export function jsonResultWithCookies(result) {
  const response = jsonResult(result);
  for (const cookie of result.cookies ?? []) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }
  return response;
}

export function jsonError(error, { status, fallback } = {}) {
  return NextResponse.json(
    {
      ok: false,
      error: error?.message || fallback
    },
    { status }
  );
}

import { NextResponse } from "next/server";
import { firebaseAdminAuth } from "../../../../src/lib/firebase/admin.js";
import {
  buildClearAuthSessionResult,
  buildCreateAuthSessionResult
} from "../../../../src/features/auth/session-route.js";

function jsonWithCookies(result) {
  const response = NextResponse.json(result.body, { status: result.status });
  for (const cookie of result.cookies) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }
  return response;
}

export async function POST(request) {
  try {
    const result = await buildCreateAuthSessionResult({
      request,
      auth: firebaseAdminAuth,
      nodeEnv: process.env.NODE_ENV
    });
    return jsonWithCookies(result);
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
  }
}

export async function DELETE() {
  return jsonWithCookies(buildClearAuthSessionResult({ nodeEnv: process.env.NODE_ENV }));
}

import { NextResponse } from "next/server";
import { firebaseAdminAuth } from "../../../../src/lib/firebase/admin.js";
import { USER_EMAIL_COOKIE } from "../../../../src/lib/auth/session.js";

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const idToken = String(body?.idToken ?? "").trim();
    if (!idToken) {
      return NextResponse.json({ ok: false, error: "Missing id token." }, { status: 400 });
    }

    const decoded = await firebaseAdminAuth.verifyIdToken(idToken);
    const email = String(decoded.email ?? "").trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ ok: false, error: "Email is required." }, { status: 400 });
    }

    const response = NextResponse.json({ ok: true, email });
    response.cookies.set(USER_EMAIL_COOKIE, email, cookieOptions());
    return response;
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(USER_EMAIL_COOKIE, "", {
    ...cookieOptions(),
    maxAge: 0
  });
  return response;
}

import { NextResponse } from "next/server";
import { firebaseAdminAuth } from "../../../../src/lib/firebase/admin.js";
import { AUTH_SESSION_COOKIE, USER_EMAIL_COOKIE } from "../../../../src/features/auth/session.js";

function cookieOptions() {
  return {
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  };
}

function sessionCookieOptions() {
  return {
    ...cookieOptions(),
    httpOnly: true
  };
}

function userEmailCookieOptions() {
  return {
    ...cookieOptions(),
    httpOnly: false
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const idToken = String(body?.idToken ?? "").trim();
    if (!idToken) {
      return NextResponse.json({ ok: false, error: "Missing id token." }, { status: 400 });
    }

    const decoded = await firebaseAdminAuth.verifyIdToken(idToken, true);
    const email = String(decoded.email ?? "").trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ ok: false, error: "Email is required." }, { status: 400 });
    }

    const expiresInMs = 60 * 60 * 24 * 7 * 1000;
    const sessionCookie = await firebaseAdminAuth.createSessionCookie(idToken, {
      expiresIn: expiresInMs
    });

    const response = NextResponse.json({ ok: true, email });
    response.cookies.set(AUTH_SESSION_COOKIE, sessionCookie, sessionCookieOptions());
    response.cookies.set(USER_EMAIL_COOKIE, email, userEmailCookieOptions());
    return response;
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_SESSION_COOKIE, "", {
    ...sessionCookieOptions(),
    maxAge: 0
  });
  response.cookies.set(USER_EMAIL_COOKIE, "", {
    ...userEmailCookieOptions(),
    maxAge: 0
  });
  return response;
}

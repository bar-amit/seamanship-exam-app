import { NextResponse } from "next/server";
import { firebaseAdminDb } from "../../../../../src/lib/firebase/admin.js";
import { authorizeAdminRequest } from "../../../../../src/lib/auth/server-session.js";
import {
  executeGetAdminQuestion,
  executeUpdateAdminQuestion
} from "../../../../../src/lib/admin/service.js";

export async function GET(request, { params }) {
  try {
    const result = await executeGetAdminQuestion({
      request,
      params,
      authFn: authorizeAdminRequest,
      db: firebaseAdminDb
    });
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const result = await executeUpdateAdminQuestion({
      request,
      params,
      authFn: authorizeAdminRequest,
      db: firebaseAdminDb,
      nowIso: new Date().toISOString()
    });
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
}

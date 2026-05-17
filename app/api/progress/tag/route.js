import { NextResponse } from "next/server";
import { firebaseAdminDb } from "../../../../src/lib/firebase/admin.js";
import { authenticateRequest } from "../../../../src/features/auth/server-session.js";
import {
  executeGetTagProgress,
  executePutTagProgress
} from "../../../../src/features/tag-practice/progress.js";

export async function GET(request) {
  try {
    const result = await executeGetTagProgress({
      request,
      authFn: authenticateRequest,
      db: firebaseAdminDb
    });
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const result = await executePutTagProgress({
      request,
      authFn: authenticateRequest,
      db: firebaseAdminDb,
      nowIso: new Date().toISOString()
    });
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
}

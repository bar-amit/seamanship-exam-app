import { NextResponse } from "next/server";
import { firebaseAdminDb } from "../../../src/lib/firebase/admin.js";
import { authenticateRequest } from "../../../src/features/auth/server-session.js";
import {
  executeCreateCollection,
  executeListCollections
} from "../../../src/lib/collections/service.js";

export async function GET(request) {
  try {
    const result = await executeListCollections({
      request,
      authFn: authenticateRequest,
      db: firebaseAdminDb
    });
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const result = await executeCreateCollection({
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

import { NextResponse } from "next/server";
import { firebaseAdminDb } from "../../../../src/lib/firebase/admin.js";
import { authorizeAdminRequest } from "../../../../src/features/auth/server-session.js";
import { executeListAdminQuestions } from "../../../../src/features/admin/service.js";

export async function GET(request) {
  try {
    const result = await executeListAdminQuestions({
      request,
      authFn: authorizeAdminRequest,
      db: firebaseAdminDb
    });
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

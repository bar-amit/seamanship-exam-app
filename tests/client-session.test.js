import test from "node:test";
import assert from "node:assert/strict";
import {
  AUTH_UI_CHANGED_EVENT,
  clearServerSession,
  createServerSessionFromFirebaseUser,
  emitAuthUiChanged,
  syncServerSessionForFirebaseUser
} from "../src/features/auth/client-session.js";

function makeJsonResponse({ ok = true, payload = { ok: true } } = {}) {
  return {
    ok,
    async json() {
      return payload;
    }
  };
}

test("createServerSessionFromFirebaseUser posts the Firebase id token", async () => {
  const calls = [];
  const user = {
    email: "user@example.com",
    async getIdToken() {
      return "id-token";
    }
  };

  await createServerSessionFromFirebaseUser(user, {
    fetchImpl: async (...args) => {
      calls.push(args);
      return makeJsonResponse();
    }
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], "/api/auth/session");
  assert.equal(calls[0][1].method, "POST");
  assert.deepEqual(JSON.parse(calls[0][1].body), { idToken: "id-token" });
});

test("createServerSessionFromFirebaseUser surfaces server errors", async () => {
  const user = {
    async getIdToken() {
      return "bad-token";
    }
  };

  await assert.rejects(
    () =>
      createServerSessionFromFirebaseUser(user, {
        fetchImpl: async () => makeJsonResponse({ ok: false, payload: { error: "Invalid token" } })
      }),
    /Invalid token/
  );
});

test("clearServerSession deletes the server session", async () => {
  const calls = [];
  await clearServerSession({
    fetchImpl: async (...args) => {
      calls.push(args);
      return makeJsonResponse();
    }
  });

  assert.deepEqual(calls, [["/api/auth/session", { method: "DELETE" }]]);
});

test("syncServerSessionForFirebaseUser creates or clears based on Firebase user", async () => {
  const methods = [];
  const user = {
    email: "user@example.com",
    async getIdToken() {
      return "id-token";
    }
  };
  const fetchImpl = async (_url, options) => {
    methods.push(options.method);
    return makeJsonResponse();
  };

  const signedIn = await syncServerSessionForFirebaseUser(user, { fetchImpl });
  const signedOut = await syncServerSessionForFirebaseUser(null, { fetchImpl });

  assert.deepEqual(methods, ["POST", "DELETE"]);
  assert.deepEqual(signedIn, { email: "user@example.com" });
  assert.deepEqual(signedOut, { email: "" });
});

test("emitAuthUiChanged dispatches the shared auth UI event", () => {
  const events = [];
  emitAuthUiChanged({
    target: {
      dispatchEvent(event) {
        events.push(event.type);
      }
    }
  });

  assert.deepEqual(events, [AUTH_UI_CHANGED_EVENT]);
});

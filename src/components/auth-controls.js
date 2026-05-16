"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { firebaseAuth } from "../lib/firebase/client.js";
import {
  emitAuthUiChanged,
  syncServerSessionForFirebaseUser
} from "../lib/auth/client-session.js";
import { uiText } from "../content/strings.js";

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export default function AuthControls() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!active) {
        return;
      }

      setBusy(true);
      setError("");

      try {
        const nextState = await syncServerSessionForFirebaseUser(user);
        setEmail(nextState.email);
        emitAuthUiChanged();
        router.refresh();
      } catch (err) {
        setError(err.message || uiText.auth.errors.sessionSyncFailed);
      } finally {
        if (active) {
          setBusy(false);
        }
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [router]);

  async function handleLogin() {
    setBusy(true);
    setError("");
    try {
      await signInWithPopup(firebaseAuth, provider);
    } catch (err) {
      setError(err.message || uiText.auth.errors.loginFailed);
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    setBusy(true);
    setError("");
    try {
      await signOut(firebaseAuth);
    } catch (err) {
      setError(err.message || uiText.auth.errors.logoutFailed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-bar">
      <div className="auth-main">
        {email ? (
          <>
            <span className="muted">
              {uiText.auth.signedInPrefix} {email}
            </span>
            <button type="button" onClick={handleLogout} disabled={busy}>
              {busy ? uiText.auth.logoutBusy : uiText.auth.logout}
            </button>
          </>
        ) : (
          <button type="button" onClick={handleLogin} disabled={busy}>
            {busy ? uiText.auth.loginBusy : uiText.auth.login}
          </button>
        )}
      </div>
      {error && <p className="error">{error}</p>}
    </section>
  );
}

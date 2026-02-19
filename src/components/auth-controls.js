"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { firebaseAuth } from "../lib/firebase/client.js";

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

async function setSessionFromUser(user) {
  const idToken = await user.getIdToken();
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to create session");
  }
}

async function clearSession() {
  await fetch("/api/auth/session", { method: "DELETE" });
}

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
        if (user) {
          setEmail(user.email ?? "");
          await setSessionFromUser(user);
        } else {
          setEmail("");
          await clearSession();
        }
        router.refresh();
      } catch (err) {
        setError(err.message || "Auth session sync failed.");
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
      const result = await signInWithPopup(firebaseAuth, provider);
      await setSessionFromUser(result.user);
      setEmail(result.user.email ?? "");
      router.refresh();
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    setBusy(true);
    setError("");
    try {
      await signOut(firebaseAuth);
      await clearSession();
      setEmail("");
      router.refresh();
    } catch (err) {
      setError(err.message || "Logout failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-bar">
      <div className="auth-main">
        {email ? (
          <>
            <span className="muted">מחובר: {email}</span>
            <button type="button" onClick={handleLogout} disabled={busy}>
              {busy ? "מתנתק..." : "התנתק"}
            </button>
          </>
        ) : (
          <button type="button" onClick={handleLogin} disabled={busy}>
            {busy ? "מתחבר..." : "התחברות עם Google"}
          </button>
        )}
      </div>
      {error && <p className="error">{error}</p>}
    </section>
  );
}

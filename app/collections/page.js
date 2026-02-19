"use client";

import { useEffect, useState } from "react";

function idsToDraft(ids) {
  return Array.isArray(ids) ? ids.join(", ") : "";
}

function parseIds(draft) {
  return Array.from(
    new Set(
      String(draft ?? "")
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean)
    )
  );
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [saveBusyId, setSaveBusyId] = useState("");
  const [editById, setEditById] = useState({});
  const [error, setError] = useState("");

  async function fetchCollections() {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/collections");
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to fetch collections");
      }
      const rows = data.collections ?? [];
      setCollections(rows);
      setEditById((prev) => {
        const next = { ...prev };
        for (const col of rows) {
          if (!next[col.id]) {
            next[col.id] = {
              name: col.name ?? "",
              description: col.description ?? "",
              questionIds: idsToDraft(col.question_ids)
            };
          }
        }
        return next;
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchCollections();
  }, []);

  async function createCollection(event) {
    event.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, questionIds: [] })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to create collection");
      }
      setName("");
      setDescription("");
      await fetchCollections();
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeCollection(id) {
    setError("");
    try {
      const res = await fetch(`/api/collections/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to delete collection");
      }
      await fetchCollections();
    } catch (err) {
      setError(err.message);
    }
  }

  function updateDraft(id, field, value) {
    setEditById((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? { name: "", description: "", questionIds: "" }),
        [field]: value
      }
    }));
  }

  async function saveCollection(id) {
    const draft = editById[id];
    if (!draft) {
      return;
    }

    setSaveBusyId(id);
    setError("");
    try {
      const res = await fetch(`/api/collections/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name,
          description: draft.description,
          questionIds: parseIds(draft.questionIds)
        })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to update collection");
      }
      await fetchCollections();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaveBusyId("");
    }
  }

  return (
    <main>
      <section className="card">
        <h1>האוספים שלי</h1>
        <p className="muted">ניהול אוספים פרטיים למשתמש המחובר.</p>
      </section>

      <section className="card practice-block">
        <h2>יצירת אוסף חדש</h2>
        <form className="practice-block" onSubmit={createCollection}>
          <label>
            שם האוסף
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            תיאור (אופציונלי)
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <button type="submit">צור אוסף</button>
        </form>
      </section>

      <section className="card practice-block">
        <h2>רשימת אוספים</h2>
        {isLoading && <p className="muted">טוען...</p>}
        {error && <p className="error">{error}</p>}
        {!isLoading && collections.length === 0 && <p className="muted">אין אוספים עדיין.</p>}
        <div className="review-list">
          {collections.map((col) => (
            <article key={col.id} className="review-item">
              <h3>{col.name}</h3>
              <p className="muted">{col.description || "ללא תיאור"}</p>
              <p>מספר שאלות: {(col.question_ids ?? []).length}</p>
              <label>
                שם אוסף
                <input
                  value={editById[col.id]?.name ?? ""}
                  onChange={(e) => updateDraft(col.id, "name", e.target.value)}
                />
              </label>
              <label>
                תיאור
                <textarea
                  rows={2}
                  value={editById[col.id]?.description ?? ""}
                  onChange={(e) => updateDraft(col.id, "description", e.target.value)}
                />
              </label>
              <label>
                מזהי שאלות (פסיקים)
                <textarea
                  rows={2}
                  value={editById[col.id]?.questionIds ?? ""}
                  onChange={(e) => updateDraft(col.id, "questionIds", e.target.value)}
                  placeholder="לדוגמה: sq1-q001, sq3-q084"
                />
              </label>
              <div className="practice-actions">
                <button type="button" onClick={() => saveCollection(col.id)} disabled={saveBusyId === col.id}>
                  {saveBusyId === col.id ? "שומר..." : "שמור"}
                </button>
                <button type="button" onClick={() => removeCollection(col.id)}>
                  מחק אוסף
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

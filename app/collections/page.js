"use client";

import { useEffect, useState } from "react";

export default function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
      setCollections(data.collections);
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
              <button type="button" onClick={() => removeCollection(col.id)}>
                מחק אוסף
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

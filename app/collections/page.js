"use client";

import { useEffect, useState } from "react";
import { uiText } from "../../src/content/strings.js";
import PageHeader from "../../src/components/page-header.js";

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
        throw new Error(data.error || uiText.collections.errors.fetchFailed);
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
        throw new Error(data.error || uiText.collections.errors.createFailed);
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
        throw new Error(data.error || uiText.collections.errors.deleteFailed);
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
        throw new Error(data.error || uiText.collections.errors.updateFailed);
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
      <PageHeader title={uiText.collections.title} subtitle={uiText.collections.subtitle} />

      <section className="card practice-block">
        <h2>{uiText.collections.createTitle}</h2>
        <form className="practice-block" onSubmit={createCollection}>
          <label>
            {uiText.collections.fields.name}
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            {uiText.collections.fields.descriptionOptional}
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <button type="submit">{uiText.collections.buttons.create}</button>
        </form>
      </section>

      <section className="card practice-block">
        <h2>{uiText.collections.listTitle}</h2>
        {isLoading && <p className="muted">{uiText.common.loading}</p>}
        {error && <p className="error">{error}</p>}
        {!isLoading && collections.length === 0 && <p className="muted">{uiText.collections.emptyState}</p>}
        <div className="review-list">
          {collections.map((col) => (
            <article key={col.id} className="review-item">
              <h3>{col.name}</h3>
              <p className="muted">{col.description || uiText.collections.noDescription}</p>
              <p>
                {uiText.collections.questionCountPrefix} {(col.question_ids ?? []).length}
              </p>
              <label>
                {uiText.collections.fields.name}
                <input
                  value={editById[col.id]?.name ?? ""}
                  onChange={(e) => updateDraft(col.id, "name", e.target.value)}
                />
              </label>
              <label>
                {uiText.collections.fields.description}
                <textarea
                  rows={2}
                  value={editById[col.id]?.description ?? ""}
                  onChange={(e) => updateDraft(col.id, "description", e.target.value)}
                />
              </label>
              <label>
                {uiText.collections.fields.questionIdsCsv}
                <textarea
                  rows={2}
                  value={editById[col.id]?.questionIds ?? ""}
                  onChange={(e) => updateDraft(col.id, "questionIds", e.target.value)}
                  placeholder={uiText.collections.questionIdsPlaceholder}
                />
              </label>
              <div className="practice-actions">
                <button type="button" onClick={() => saveCollection(col.id)} disabled={saveBusyId === col.id}>
                  {saveBusyId === col.id ? uiText.collections.buttons.saveBusy : uiText.collections.buttons.save}
                </button>
                <button type="button" onClick={() => removeCollection(col.id)}>
                  {uiText.collections.buttons.delete}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

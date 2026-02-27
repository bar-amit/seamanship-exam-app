"use client";

import { useEffect, useMemo, useState } from "react";
import { uiText } from "../content/strings.js";
import {
  buildCollectionCreatePayload,
  buildCollectionUpdatePayload,
  collectionHasQuestion
} from "../lib/collections/add-question.js";

export default function AddToCollectionModal({ isOpen, questionId, onClose }) {
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [busyCollectionId, setBusyCollectionId] = useState("");
  const [createBusy, setCreateBusy] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const hasQuestion = useMemo(() => Boolean(String(questionId ?? "").trim()), [questionId]);

  async function loadCollections() {
    if (!hasQuestion) {
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/collections");
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || uiText.collections.addModal.errors.fetchFailed);
      }
      setCollections(data.collections ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setError("");
    setName("");
    setDescription("");
    loadCollections();
  }, [isOpen, questionId]);

  async function addToCollection(collection) {
    const targetQuestionId = String(questionId ?? "").trim();
    if (!targetQuestionId) {
      return;
    }
    setBusyCollectionId(collection.id);
    setError("");
    try {
      const res = await fetch(`/api/collections/${collection.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildCollectionUpdatePayload(collection, targetQuestionId))
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || uiText.collections.addModal.errors.addFailed);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyCollectionId("");
    }
  }

  async function createCollectionAndAdd(event) {
    event.preventDefault();
    const targetQuestionId = String(questionId ?? "").trim();
    if (!targetQuestionId) {
      return;
    }
    setCreateBusy(true);
    setError("");
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          buildCollectionCreatePayload({
            name,
            description,
            questionId: targetQuestionId
          })
        )
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || uiText.collections.addModal.errors.createFailed);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreateBusy(false);
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="app-modal-backdrop" onClick={onClose}>
      <div className="app-modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="app-modal-head">
          <h3>{uiText.collections.addModal.title}</h3>
          <button type="button" onClick={onClose}>
            {uiText.collections.addModal.close}
          </button>
        </div>

        {isLoading && <p className="muted">{uiText.collections.addModal.loading}</p>}
        {error && <p className="error">{error}</p>}

        {!isLoading && (
          <div className="collection-pick-list">
            {collections.map((collection) => {
              const containsQuestion = collectionHasQuestion(collection, questionId);
              return (
                <article key={collection.id} className="collection-pick-item">
                  <strong>{collection.name}</strong>
                  <button
                    type="button"
                    disabled={containsQuestion || busyCollectionId === collection.id}
                    onClick={() => addToCollection(collection)}
                  >
                    {containsQuestion
                      ? uiText.collections.addModal.alreadyInCollection
                      : busyCollectionId === collection.id
                        ? uiText.collections.addModal.addActionBusy
                        : uiText.collections.addModal.addToCollection}
                  </button>
                </article>
              );
            })}
            {collections.length === 0 && <p className="muted">{uiText.collections.addModal.empty}</p>}
          </div>
        )}

        <form className="practice-block" onSubmit={createCollectionAndAdd}>
          <h4>{uiText.collections.addModal.createTitle}</h4>
          <label>
            {uiText.collections.addModal.createNameLabel}
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label>
            {uiText.collections.addModal.createDescriptionLabel}
            <textarea rows={2} value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
          <button type="submit" disabled={createBusy}>
            {createBusy ? uiText.collections.addModal.createActionBusy : uiText.collections.addModal.createAction}
          </button>
        </form>
      </div>
    </div>
  );
}

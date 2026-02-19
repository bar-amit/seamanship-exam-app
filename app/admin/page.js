"use client";

import { useEffect, useMemo, useState } from "react";

function subQuestionsToDraft(subQuestions) {
  const rows = Array.isArray(subQuestions) ? subQuestions : [];
  return rows.map((row, index) => ({
    id: row.id ?? String.fromCharCode("a".charCodeAt(0) + index),
    label: row.label ?? "",
    text: row.text ?? "",
    order: row.order ?? index + 1
  }));
}

function parseTags(tags) {
  if (Array.isArray(tags)) {
    return tags.join(", ");
  }
  return "";
}

export default function AdminPage() {
  const [query, setQuery] = useState("");
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [questionType, setQuestionType] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [modelAnswer, setModelAnswer] = useState("");
  const [tagsDraft, setTagsDraft] = useState("");
  const [subQuestionsDraft, setSubQuestionsDraft] = useState([]);

  async function fetchList(nextQuery = "") {
    setIsLoadingList(true);
    setError("");
    setNotice("");
    try {
      const params = new URLSearchParams();
      if (nextQuery.trim()) {
        params.set("query", nextQuery.trim());
      }
      params.set("limit", "300");
      const res = await fetch(`/api/admin/questions?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to load questions");
      }
      setQuestions(data.questions);
      if (!selectedId && data.questions.length > 0) {
        setSelectedId(data.questions[0].id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoadingList(false);
    }
  }

  async function loadQuestion(id) {
    if (!id) {
      return;
    }
    setIsLoadingQuestion(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch(`/api/admin/questions/${id}`);
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to load question");
      }
      const q = data.question;
      setQuestionType(q.type ?? "");
      setQuestionText(q.text ?? "");
      setModelAnswer(q.model_answer ?? "");
      setTagsDraft(parseTags(q.tags));
      setSubQuestionsDraft(subQuestionsToDraft(q.sub_questions));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoadingQuestion(false);
    }
  }

  useEffect(() => {
    fetchList("");
  }, []);

  useEffect(() => {
    loadQuestion(selectedId);
  }, [selectedId]);

  const selectedSummary = useMemo(
    () => questions.find((q) => q.id === selectedId) ?? null,
    [questions, selectedId]
  );

  function addSubQuestionRow() {
    setSubQuestionsDraft((prev) => [
      ...prev,
      {
        id: "",
        label: "",
        text: "",
        order: prev.length + 1
      }
    ]);
  }

  function removeSubQuestionRow(index) {
    setSubQuestionsDraft((prev) => prev.filter((_, i) => i !== index));
  }

  function updateSubQuestionField(index, field, value) {
    setSubQuestionsDraft((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  async function saveChanges() {
    if (!selectedId) {
      return;
    }
    setSaveBusy(true);
    setError("");
    setNotice("");
    try {
      const body = {
        text: questionText,
        model_answer: modelAnswer,
        tags: tagsDraft,
        sub_questions: subQuestionsDraft
      };
      const res = await fetch(`/api/admin/questions/${selectedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to save question");
      }
      setNotice("השאלה נשמרה בהצלחה.");
      await fetchList(query);
      await loadQuestion(selectedId);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaveBusy(false);
    }
  }

  return (
    <main>
      <section className="card">
        <h1>ניהול תוכן</h1>
        <p className="muted">עריכת טקסט שאלה, הסבר, תגיות וסעיפים לשאלות פתוחות.</p>
      </section>

      <section className="card practice-block">
        <h2>איתור שאלות</h2>
        <div className="practice-actions">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="חיפוש לפי מזהה או טקסט"
          />
          <button type="button" onClick={() => fetchList(query)} disabled={isLoadingList}>
            {isLoadingList ? "טוען..." : "חפש"}
          </button>
        </div>
        <p className="muted">נמצאו {questions.length} שאלות.</p>
        <div className="review-list">
          {questions.map((q) => (
            <button
              key={q.id}
              type="button"
              className={`navigator-dot ${selectedId === q.id ? "status-current" : "status-unanswered"}`}
              onClick={() => setSelectedId(q.id)}
            >
              {q.id}
            </button>
          ))}
        </div>
      </section>

      <section className="card practice-block">
        <h2>עורך שאלה</h2>
        {!selectedId && <p className="muted">לא נבחרה שאלה.</p>}
        {isLoadingQuestion && <p className="muted">טוען שאלה...</p>}
        {error && <p className="error">{error}</p>}
        {notice && <p className="muted">{notice}</p>}

        {selectedId && !isLoadingQuestion && (
          <>
            <p>
              <strong>מזהה:</strong> {selectedId}
            </p>
            <p>
              <strong>סוג:</strong> {questionType || "-"}
            </p>
            <p>
              <strong>פרק:</strong> {selectedSummary?.chapter ?? "-"}
            </p>

            <label>
              טקסט שאלה
              <textarea rows={5} value={questionText} onChange={(e) => setQuestionText(e.target.value)} />
            </label>

            <label>
              הסבר/תשובת מודל
              <textarea rows={5} value={modelAnswer} onChange={(e) => setModelAnswer(e.target.value)} />
            </label>

            <label>
              תגיות (מופרדות בפסיק)
              <input value={tagsDraft} onChange={(e) => setTagsDraft(e.target.value)} />
            </label>

            {questionType === "open_text" && (
              <div className="practice-block">
                <h3>סעיפים</h3>
                {subQuestionsDraft.map((sub, index) => (
                  <article key={`${sub.id}-${index}`} className="review-item">
                    <div className="practice-actions">
                      <label>
                        מזהה
                        <input
                          value={sub.id}
                          onChange={(e) => updateSubQuestionField(index, "id", e.target.value)}
                        />
                      </label>
                      <label>
                        תווית
                        <input
                          value={sub.label}
                          onChange={(e) => updateSubQuestionField(index, "label", e.target.value)}
                        />
                      </label>
                      <label>
                        סדר
                        <input
                          type="number"
                          min={1}
                          value={sub.order}
                          onChange={(e) => updateSubQuestionField(index, "order", e.target.value)}
                        />
                      </label>
                    </div>
                    <label>
                      טקסט סעיף
                      <textarea
                        rows={3}
                        value={sub.text}
                        onChange={(e) => updateSubQuestionField(index, "text", e.target.value)}
                      />
                    </label>
                    <button type="button" onClick={() => removeSubQuestionRow(index)}>
                      מחק סעיף
                    </button>
                  </article>
                ))}
                <button type="button" onClick={addSubQuestionRow}>
                  הוסף סעיף
                </button>
              </div>
            )}

            <div className="practice-actions">
              <button type="button" onClick={saveChanges} disabled={saveBusy}>
                {saveBusy ? "שומר..." : "שמור שינויים"}
              </button>
              <button type="button" onClick={() => loadQuestion(selectedId)} disabled={isLoadingQuestion}>
                טען מחדש
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

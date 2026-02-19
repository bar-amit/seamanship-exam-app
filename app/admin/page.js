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

function choicesToDraft(choices) {
  const rows = Array.isArray(choices) ? choices : [];
  return rows.map((row, index) => ({
    id: row.id ?? String.fromCharCode("a".charCodeAt(0) + index),
    label: row.label ?? "",
    text: row.text ?? "",
    image_ref: row.image_ref ?? ""
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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showQuestionJson, setShowQuestionJson] = useState(false);
  const [showPayloadJson, setShowPayloadJson] = useState(false);

  const [loadedQuestion, setLoadedQuestion] = useState(null);
  const [questionType, setQuestionType] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [modelAnswer, setModelAnswer] = useState("");
  const [tagsDraft, setTagsDraft] = useState("");
  const [correctChoiceId, setCorrectChoiceId] = useState("");
  const [choicesDraft, setChoicesDraft] = useState([]);
  const [subQuestionsDraft, setSubQuestionsDraft] = useState([]);

  async function fetchList(nextQuery = "", nextPage = 1, nextPageSize = pageSize) {
    setIsLoadingList(true);
    setError("");
    setNotice("");
    try {
      const params = new URLSearchParams();
      if (nextQuery.trim()) {
        params.set("query", nextQuery.trim());
      }
      params.set("page", String(nextPage));
      params.set("pageSize", String(nextPageSize));
      const res = await fetch(`/api/admin/questions?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to load questions");
      }

      setQuestions(data.questions ?? []);
      setPage(data.page ?? 1);
      setPageSize(data.pageSize ?? nextPageSize);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);

      if (data.questions?.length > 0) {
        const hasSelected = data.questions.some((q) => q.id === selectedId);
        if (!selectedId || !hasSelected) {
          setSelectedId(data.questions[0].id);
        }
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
      setLoadedQuestion(q);
      setQuestionType(q.type ?? "");
      setQuestionText(q.text ?? "");
      setModelAnswer(q.model_answer ?? "");
      setTagsDraft(parseTags(q.tags));
      setCorrectChoiceId(q.correct_choice_id ?? "");
      setChoicesDraft(choicesToDraft(q.choices));
      setSubQuestionsDraft(subQuestionsToDraft(q.sub_questions));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoadingQuestion(false);
    }
  }

  useEffect(() => {
    fetchList("", 1, pageSize);
  }, []);

  useEffect(() => {
    loadQuestion(selectedId);
  }, [selectedId]);

  const selectedSummary = useMemo(
    () => questions.find((q) => q.id === selectedId) ?? null,
    [questions, selectedId]
  );

  const savePayload = useMemo(
    () => ({
      text: questionText,
      model_answer: modelAnswer,
      tags: tagsDraft,
      correct_choice_id: correctChoiceId,
      choices: choicesDraft,
      sub_questions: subQuestionsDraft
    }),
    [questionText, modelAnswer, tagsDraft, correctChoiceId, choicesDraft, subQuestionsDraft]
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

  function addChoiceRow() {
    setChoicesDraft((prev) => [
      ...prev,
      {
        id: "",
        label: "",
        text: "",
        image_ref: ""
      }
    ]);
  }

  function removeChoiceRow(index) {
    setChoicesDraft((prev) => prev.filter((_, i) => i !== index));
  }

  function updateChoiceField(index, field, value) {
    setChoicesDraft((prev) =>
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
      const res = await fetch(`/api/admin/questions/${selectedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(savePayload)
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to save question");
      }
      setNotice("השאלה נשמרה בהצלחה.");
      await fetchList(query, page, pageSize);
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
        <p className="muted">
          עורך אדמין עם חיפוש מדורג, תצוגה מקדימה, עריכת אפשרויות/תשובות וחשיפת JSON.
        </p>
      </section>

      <section className="card practice-block">
        <h2>איתור שאלות</h2>
        <div className="practice-actions">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="חיפוש לפי מזהה או טקסט"
          />
          <button type="button" onClick={() => fetchList(query, 1, pageSize)} disabled={isLoadingList}>
            {isLoadingList ? "טוען..." : "חפש"}
          </button>
        </div>
        <div className="practice-actions">
          <label>
            תוצאות בעמוד
            <select
              value={pageSize}
              onChange={(e) => {
                const nextSize = Number(e.target.value);
                setPageSize(nextSize);
                fetchList(query, 1, nextSize);
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>
          <span className="muted">
            עמוד {page} מתוך {totalPages} | סה״כ {total}
          </span>
          <button
            type="button"
            onClick={() => fetchList(query, page - 1, pageSize)}
            disabled={isLoadingList || page <= 1}
          >
            הקודם
          </button>
          <button
            type="button"
            onClick={() => fetchList(query, page + 1, pageSize)}
            disabled={isLoadingList || page >= totalPages}
          >
            הבא
          </button>
        </div>

        <div className="review-list">
          {questions.map((q) => (
            <article key={q.id} className="review-item">
              <button
                type="button"
                className={`navigator-dot ${selectedId === q.id ? "status-current" : "status-unanswered"}`}
                onClick={() => setSelectedId(q.id)}
              >
                {q.id}
              </button>
              <p className="muted">{q.text_preview || "-"}</p>
            </article>
          ))}
          {!isLoadingList && questions.length === 0 && <p className="muted">לא נמצאו תוצאות.</p>}
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

            {questionType === "mcq" && (
              <div className="practice-block">
                <h3>אפשרויות ותשובה נכונה</h3>
                <label>
                  מזהה תשובה נכונה
                  <input
                    value={correctChoiceId}
                    onChange={(e) => setCorrectChoiceId(e.target.value)}
                    placeholder="לדוגמה: a"
                  />
                </label>
                {choicesDraft.map((choice, index) => (
                  <article key={`${choice.id}-${index}`} className="review-item">
                    <div className="practice-actions">
                      <label>
                        מזהה
                        <input
                          value={choice.id}
                          onChange={(e) => updateChoiceField(index, "id", e.target.value)}
                        />
                      </label>
                      <label>
                        תווית
                        <input
                          value={choice.label}
                          onChange={(e) => updateChoiceField(index, "label", e.target.value)}
                        />
                      </label>
                      <label>
                        קובץ תמונה (image_ref)
                        <input
                          value={choice.image_ref}
                          onChange={(e) => updateChoiceField(index, "image_ref", e.target.value)}
                        />
                      </label>
                    </div>
                    <label>
                      טקסט אפשרות
                      <textarea
                        rows={3}
                        value={choice.text}
                        onChange={(e) => updateChoiceField(index, "text", e.target.value)}
                      />
                    </label>
                    <button type="button" onClick={() => removeChoiceRow(index)}>
                      מחק אפשרות
                    </button>
                  </article>
                ))}
                <button type="button" onClick={addChoiceRow}>
                  הוסף אפשרות
                </button>
              </div>
            )}

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
              <button type="button" onClick={() => setShowQuestionJson((prev) => !prev)}>
                {showQuestionJson ? "הסתר JSON שאלה" : "הצג JSON שאלה"}
              </button>
              <button type="button" onClick={() => setShowPayloadJson((prev) => !prev)}>
                {showPayloadJson ? "הסתר JSON שמירה" : "הצג JSON שמירה"}
              </button>
            </div>

            {showQuestionJson && (
              <pre className="review-item">{JSON.stringify(loadedQuestion, null, 2)}</pre>
            )}
            {showPayloadJson && (
              <pre className="review-item">{JSON.stringify(savePayload, null, 2)}</pre>
            )}
          </>
        )}
      </section>
    </main>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { uiText } from "../../src/content/strings.js";
import PageHeader from "../../src/components/page-header.js";

function subQuestionsToDraft(subQuestions) {
  const rows = Array.isArray(subQuestions) ? subQuestions : [];
  return rows.map((row, index) => ({
    id: row.id ?? String.fromCharCode("a".charCodeAt(0) + index),
    label: row.label ?? "",
    text: row.text ?? "",
    order: row.order ?? index + 1
  }));
}

function subAnswersToDraft(subAnswers, subQuestions = []) {
  const rows = Array.isArray(subAnswers) ? subAnswers : [];
  const questionRows = Array.isArray(subQuestions) ? subQuestions : [];

  if (questionRows.length > 0) {
    return questionRows.map((subQuestion, index) => {
      const row = rows[index] ?? {};
      return {
        id: subQuestion.id ?? row.id ?? String.fromCharCode("a".charCodeAt(0) + index),
        label: subQuestion.label ?? row.label ?? "",
        text: row.text ?? "",
        order: subQuestion.order ?? row.order ?? index + 1
      };
    });
  }

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

function imageRefsToDraft(question) {
  const refs = Array.isArray(question?.image_refs) && question.image_refs.length > 0
    ? question.image_refs
    : [question?.image_ref].filter(Boolean);
  return refs.join("\n");
}

export default function AdminPage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
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
  const [subAnswersDraft, setSubAnswersDraft] = useState([]);
  const [imageRefsDraft, setImageRefsDraft] = useState("");
  const [referencesDiagramDraft, setReferencesDiagramDraft] = useState(false);

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
        throw new Error(data.error || uiText.admin.errors.loadQuestionsFailed);
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
        throw new Error(data.error || uiText.admin.errors.loadQuestionFailed);
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
      setSubAnswersDraft(subAnswersToDraft(q.sub_answers, q.sub_questions));
      setImageRefsDraft(imageRefsToDraft(q));
      setReferencesDiagramDraft(Boolean(q.references_sq11_positioning_diagram));
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
      sub_questions: subQuestionsDraft,
      sub_answers: subAnswersDraft,
      image_refs: imageRefsDraft,
      references_sq11_positioning_diagram: referencesDiagramDraft
    }),
    [
      questionText,
      modelAnswer,
      tagsDraft,
      correctChoiceId,
      choicesDraft,
      subQuestionsDraft,
      subAnswersDraft,
      imageRefsDraft,
      referencesDiagramDraft
    ]
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
    setSubAnswersDraft((prev) => [
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
    setSubAnswersDraft((prev) => prev.filter((_, i) => i !== index));
  }

  function updateSubQuestionField(index, field, value) {
    setSubQuestionsDraft((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  function updateSubAnswerField(index, value) {
    setSubAnswersDraft((prev) => {
      const next = [...prev];
      while (next.length <= index) {
        next.push({
          id: "",
          label: "",
          text: "",
          order: next.length + 1
        });
      }
      next[index] = { ...next[index], text: value };
      return next;
    });
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
        throw new Error(data.error || uiText.admin.errors.saveQuestionFailed);
      }
      setNotice(uiText.admin.saveSuccess);
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
      <PageHeader title={uiText.admin.title} subtitle={uiText.admin.subtitle} />

      <section className="card practice-block">
        <h2>{uiText.admin.searchTitle}</h2>
        <div className="practice-actions">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={uiText.admin.searchPlaceholder}
          />
          <button type="button" onClick={() => fetchList(query, 1, pageSize)} disabled={isLoadingList}>
            {isLoadingList ? uiText.common.loading : uiText.admin.search}
          </button>
        </div>
        <div className="practice-actions">
          <label>
            {uiText.admin.pageSizeLabel}
            <select
              value={pageSize}
              onChange={(e) => {
                const nextSize = Number(e.target.value);
                setPageSize(nextSize);
                fetchList(query, 1, nextSize);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </label>
          <span className="muted">
            {uiText.admin.pageCounter(page, totalPages, total)}
          </span>
          <button
            type="button"
            onClick={() => fetchList(query, page - 1, pageSize)}
            disabled={isLoadingList || page <= 1}
          >
            {uiText.admin.previous}
          </button>
          <button
            type="button"
            onClick={() => fetchList(query, page + 1, pageSize)}
            disabled={isLoadingList || page >= totalPages}
          >
            {uiText.admin.next}
          </button>
        </div>

        <div className="review-list">
          {questions.map((q) => (
            <article key={q.id} className="review-item admin-search-item">
              <button
                type="button"
                className={`navigator-dot admin-result-id ${
                  selectedId === q.id ? "status-current" : "status-unanswered"
                }`}
                onClick={() => setSelectedId(q.id)}
              >
                {q.id}
              </button>
              <p className="muted admin-result-preview">{q.text_preview || uiText.common.notAvailable}</p>
            </article>
          ))}
          {!isLoadingList && questions.length === 0 && <p className="muted">{uiText.admin.emptyResults}</p>}
        </div>
      </section>

      <section className="card practice-block">
        <h2>{uiText.admin.editorTitle}</h2>
        {!selectedId && <p className="muted">{uiText.admin.noQuestionSelected}</p>}
        {isLoadingQuestion && <p className="muted">{uiText.admin.loadingQuestion}</p>}
        {error && <p className="error">{error}</p>}
        {notice && <p className="muted">{notice}</p>}

        {selectedId && !isLoadingQuestion && (
          <>
            <p>
              <strong>{uiText.admin.idLabel}</strong> {selectedId}
            </p>
            <p>
              <strong>{uiText.admin.typeLabel}</strong> {questionType || uiText.common.notAvailable}
            </p>
            <p>
              <strong>{uiText.admin.chapterLabel}</strong> {selectedSummary?.chapter ?? uiText.common.notAvailable}
            </p>

            <label>
              {uiText.admin.questionTextLabel}
              <textarea rows={5} value={questionText} onChange={(e) => setQuestionText(e.target.value)} />
            </label>

            <label>
              {uiText.admin.modelAnswerLabel}
              <textarea rows={5} value={modelAnswer} onChange={(e) => setModelAnswer(e.target.value)} />
            </label>

            <label>
              {uiText.admin.tagsLabel}
              <input value={tagsDraft} onChange={(e) => setTagsDraft(e.target.value)} />
            </label>

            <div className="practice-block">
              <h3>{uiText.admin.assetMetadataTitle}</h3>
              <label>
                {uiText.admin.imageRefsLabel}
                <textarea
                  rows={4}
                  value={imageRefsDraft}
                  onChange={(e) => setImageRefsDraft(e.target.value)}
                  placeholder={uiText.admin.imageRefsPlaceholder}
                />
              </label>
              <label className="practice-inline">
                <input
                  type="checkbox"
                  checked={referencesDiagramDraft}
                  onChange={(e) => setReferencesDiagramDraft(e.target.checked)}
                />
                <span>{uiText.admin.referencesDiagramLabel}</span>
              </label>
            </div>

            {questionType === "mcq" && (
              <div className="practice-block">
                <h3>{uiText.admin.mcqTitle}</h3>
                <label>
                  {uiText.admin.correctChoiceIdLabel}
                  <input
                    value={correctChoiceId}
                    onChange={(e) => setCorrectChoiceId(e.target.value)}
                    placeholder={uiText.admin.correctChoiceIdPlaceholder}
                  />
                </label>
                {choicesDraft.map((choice, index) => (
                  <article key={`${choice.id}-${index}`} className="review-item">
                    <div className="practice-actions">
                      <label>
                        {uiText.admin.choiceIdLabel}
                        <input
                          value={choice.id}
                          onChange={(e) => updateChoiceField(index, "id", e.target.value)}
                        />
                      </label>
                      <label>
                        {uiText.admin.choiceLabelLabel}
                        <input
                          value={choice.label}
                          onChange={(e) => updateChoiceField(index, "label", e.target.value)}
                        />
                      </label>
                      <label>
                        {uiText.admin.choiceImageRefLabel}
                        <input
                          value={choice.image_ref}
                          onChange={(e) => updateChoiceField(index, "image_ref", e.target.value)}
                        />
                      </label>
                    </div>
                    <label>
                      {uiText.admin.choiceTextLabel}
                      <textarea
                        rows={3}
                        value={choice.text}
                        onChange={(e) => updateChoiceField(index, "text", e.target.value)}
                      />
                    </label>
                    <button type="button" onClick={() => removeChoiceRow(index)}>
                      {uiText.admin.removeChoice}
                    </button>
                  </article>
                ))}
                <button type="button" onClick={addChoiceRow}>
                  {uiText.admin.addChoice}
                </button>
              </div>
            )}

            {questionType === "open_text" && (
              <div className="practice-block">
                <h3>{uiText.admin.subQuestionsTitle}</h3>
                {subQuestionsDraft.map((sub, index) => (
                  <article key={`${sub.id}-${index}`} className="review-item">
                    <div className="practice-actions">
                      <label>
                        {uiText.admin.subQuestionIdLabel}
                        <input
                          value={sub.id}
                          onChange={(e) => updateSubQuestionField(index, "id", e.target.value)}
                        />
                      </label>
                      <label>
                        {uiText.admin.subQuestionLabelLabel}
                        <input
                          value={sub.label}
                          onChange={(e) => updateSubQuestionField(index, "label", e.target.value)}
                        />
                      </label>
                      <label>
                        {uiText.admin.subQuestionOrderLabel}
                        <input
                          type="number"
                          min={1}
                          value={sub.order}
                          onChange={(e) => updateSubQuestionField(index, "order", e.target.value)}
                        />
                      </label>
                    </div>
                    <label>
                      {uiText.admin.subQuestionTextLabel}
                      <textarea
                        rows={3}
                        value={sub.text}
                        onChange={(e) => updateSubQuestionField(index, "text", e.target.value)}
                      />
                    </label>
                    <label>
                      {uiText.admin.subAnswerTextLabel}
                      <textarea
                        rows={3}
                        value={subAnswersDraft[index]?.text ?? ""}
                        onChange={(e) => updateSubAnswerField(index, e.target.value)}
                      />
                    </label>
                    <button type="button" onClick={() => removeSubQuestionRow(index)}>
                      {uiText.admin.removeSubQuestion}
                    </button>
                  </article>
                ))}
                <button type="button" onClick={addSubQuestionRow}>
                  {uiText.admin.addSubQuestion}
                </button>
              </div>
            )}

            <div className="practice-actions">
              <button type="button" onClick={saveChanges} disabled={saveBusy}>
                {saveBusy ? uiText.admin.saveChangesBusy : uiText.admin.saveChanges}
              </button>
              <button type="button" onClick={() => loadQuestion(selectedId)} disabled={isLoadingQuestion}>
                {uiText.admin.reload}
              </button>
              <button type="button" onClick={() => setShowQuestionJson((prev) => !prev)}>
                {showQuestionJson ? uiText.admin.hideQuestionJson : uiText.admin.showQuestionJson}
              </button>
              <button type="button" onClick={() => setShowPayloadJson((prev) => !prev)}>
                {showPayloadJson ? uiText.admin.hidePayloadJson : uiText.admin.showPayloadJson}
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

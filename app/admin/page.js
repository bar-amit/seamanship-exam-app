"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../src/components/page-header.js";
import { uiText } from "../../src/content/strings.js";
import {
  appendChoiceRow,
  appendSubAnswerRow,
  appendSubQuestionRow,
  choicesToDraft,
  imageRefsToDraft,
  parseTags,
  removeDraftRow,
  subAnswersToDraft,
  subQuestionsToDraft,
  updateDraftRowField,
  updateSubAnswerTextAtIndex
} from "../../src/features/admin/question-draft.js";
import AdminEditorPanel from "./_components/admin-editor-panel.js";
import AdminSearchPanel from "./_components/admin-search-panel.js";

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
        const hasSelected = data.questions.some((question) => question.id === selectedId);
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
      applyLoadedQuestion(data.question);
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
    () => questions.find((question) => question.id === selectedId) ?? null,
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

  function applyLoadedQuestion(question) {
    setLoadedQuestion(question);
    setQuestionType(question.type ?? "");
    setQuestionText(question.text ?? "");
    setModelAnswer(question.model_answer ?? "");
    setTagsDraft(parseTags(question.tags));
    setCorrectChoiceId(question.correct_choice_id ?? "");
    setChoicesDraft(choicesToDraft(question.choices));
    setSubQuestionsDraft(subQuestionsToDraft(question.sub_questions));
    setSubAnswersDraft(subAnswersToDraft(question.sub_answers, question.sub_questions));
    setImageRefsDraft(imageRefsToDraft(question));
    setReferencesDiagramDraft(Boolean(question.references_sq11_positioning_diagram));
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
      <AdminSearchPanel
        query={query}
        setQuery={setQuery}
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        isLoadingList={isLoadingList}
        questions={questions}
        selectedId={selectedId}
        onSearch={fetchList}
        onPageSizeChange={setPageSize}
        onPageChange={(nextPage) => fetchList(query, nextPage, pageSize)}
        onSelectQuestion={setSelectedId}
      />
      <AdminEditorPanel
        selectedId={selectedId}
        isLoadingQuestion={isLoadingQuestion}
        error={error}
        notice={notice}
        questionType={questionType}
        selectedSummary={selectedSummary}
        questionText={questionText}
        setQuestionText={setQuestionText}
        modelAnswer={modelAnswer}
        setModelAnswer={setModelAnswer}
        tagsDraft={tagsDraft}
        setTagsDraft={setTagsDraft}
        imageRefsDraft={imageRefsDraft}
        setImageRefsDraft={setImageRefsDraft}
        referencesDiagramDraft={referencesDiagramDraft}
        setReferencesDiagramDraft={setReferencesDiagramDraft}
        correctChoiceId={correctChoiceId}
        setCorrectChoiceId={setCorrectChoiceId}
        choicesDraft={choicesDraft}
        subQuestionsDraft={subQuestionsDraft}
        subAnswersDraft={subAnswersDraft}
        saveBusy={saveBusy}
        showQuestionJson={showQuestionJson}
        showPayloadJson={showPayloadJson}
        loadedQuestion={loadedQuestion}
        savePayload={savePayload}
        onSave={saveChanges}
        onReload={() => loadQuestion(selectedId)}
        onToggleQuestionJson={() => setShowQuestionJson((prev) => !prev)}
        onTogglePayloadJson={() => setShowPayloadJson((prev) => !prev)}
        onAddChoice={() => setChoicesDraft(appendChoiceRow)}
        onRemoveChoice={(index) => setChoicesDraft((prev) => removeDraftRow(prev, index))}
        onUpdateChoice={(index, field, value) =>
          setChoicesDraft((prev) => updateDraftRowField(prev, index, field, value))
        }
        onAddSubQuestion={() => {
          setSubQuestionsDraft(appendSubQuestionRow);
          setSubAnswersDraft(appendSubAnswerRow);
        }}
        onRemoveSubQuestion={(index) => {
          setSubQuestionsDraft((prev) => removeDraftRow(prev, index));
          setSubAnswersDraft((prev) => removeDraftRow(prev, index));
        }}
        onUpdateSubQuestion={(index, field, value) =>
          setSubQuestionsDraft((prev) => updateDraftRowField(prev, index, field, value))
        }
        onUpdateSubAnswer={(index, value) =>
          setSubAnswersDraft((prev) => updateSubAnswerTextAtIndex(prev, index, value))
        }
      />
    </main>
  );
}

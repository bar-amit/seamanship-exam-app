import { selectRandomItems } from "../../lib/questions/selection.js";
import { filterQuestionsByTags, normalizeSelectedTags } from "./tags.js";

export function normalizeTagQuestionRequest({ countParam, tagsParam } = {}) {
  const parsed = Number(countParam || 30);
  const count = Number.isFinite(parsed) ? Math.max(1, Math.min(200, parsed)) : 30;
  const trimmedTags = String(tagsParam || "").trim();
  const selectedTags = trimmedTags ? trimmedTags.split(",") : [];

  return {
    count,
    selectedTags: normalizeSelectedTags(selectedTags)
  };
}

export function selectTagPracticeQuestions(questions, { count, selectedTags, random } = {}) {
  const filtered = filterQuestionsByTags(questions, selectedTags);

  return {
    requestedTags: selectedTags,
    totalPool: filtered.length,
    questions: selectRandomItems(filtered, { count, random })
  };
}

function mapQuestionDocs(snapshot) {
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function executeListTagPracticeQuestions({ request, db, random }) {
  const url = new URL(request.url);
  const { count, selectedTags } = normalizeTagQuestionRequest({
    countParam: url.searchParams.get("count"),
    tagsParam: url.searchParams.get("tags")
  });

  const snapshot = await db.collection("questions").get();
  const all = mapQuestionDocs(snapshot);
  const selection = selectTagPracticeQuestions(all, { count, selectedTags, random });

  return {
    status: 200,
    body: {
      ok: true,
      requested_tags: selection.requestedTags,
      total_pool: selection.totalPool,
      questions: selection.questions
    }
  };
}

export async function fetchTagPracticeQuestions({
  count,
  selectedTags,
  fetchImpl = globalThis.fetch,
  fallbackError = "Failed to fetch tag questions"
} = {}) {
  const normalizedTags = normalizeSelectedTags(selectedTags);
  const query = new URLSearchParams();
  query.set("count", String(count));
  query.set("tags", normalizedTags.length > 0 ? normalizedTags.join(",") : "all");

  const response = await fetchImpl(`/api/practice/tag-questions?${query.toString()}`);
  const data = await response.json();
  if (!response.ok || !data.ok) {
    throw new Error(data.error || fallbackError);
  }

  return {
    questions: data.questions,
    selectedTags: normalizedTags
  };
}

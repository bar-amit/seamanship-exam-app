import { selectRandomItems } from "../../lib/questions/selection.js";

export function normalizePracticeQuestionLimit(value) {
  const parsed = Number(value || 10);
  return Number.isFinite(parsed) ? Math.max(1, Math.min(50, parsed)) : 10;
}

export function selectPracticeQuestions(questions, { count, random } = {}) {
  return selectRandomItems(questions, { count, random });
}

function mapQuestionDocs(snapshot) {
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function executeListPracticeQuestions({ request, db, random }) {
  const url = new URL(request.url);
  const count = normalizePracticeQuestionLimit(url.searchParams.get("count"));

  const snapshot = await db.collection("questions").get();
  const all = mapQuestionDocs(snapshot);
  const selected = selectPracticeQuestions(all, { count, random });

  return {
    status: 200,
    body: {
      ok: true,
      questions: selected
    }
  };
}

export async function fetchPracticeQuestions({
  count,
  fetchImpl = globalThis.fetch,
  fallbackError = "Failed to fetch questions"
} = {}) {
  const response = await fetchImpl(`/api/practice/questions?count=${count}`);
  const data = await response.json();
  if (!response.ok || !data.ok) {
    throw new Error(data.error || fallbackError);
  }
  return data.questions;
}

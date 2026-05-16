export const PRACTICE_TEST_STORAGE_KEY = "practice_test_session_v1";
const SCHEMA_VERSION = 1;
const DEFAULT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function hasStorage(storage) {
  return storage && typeof storage.getItem === "function" && typeof storage.setItem === "function";
}

export function clearPersistedPracticeTest(storage) {
  if (!hasStorage(storage)) {
    return;
  }
  storage.removeItem(PRACTICE_TEST_STORAGE_KEY);
}

export function savePracticeTestSession(storage, state, nowMs = Date.now()) {
  if (!hasStorage(storage)) {
    return;
  }

  const payload = {
    version: SCHEMA_VERSION,
    savedAt: nowMs,
    phase: state.phase,
    questionCount: state.questionCount,
    timed: state.timed,
    minutesPerQuestion: state.minutesPerQuestion,
    questions: state.questions,
    responses: state.responses,
    currentIndex: state.currentIndex,
    timeLeft: state.timeLeft,
    sessionStartedAt: state.sessionStartedAt ?? null
  };

  if (state.timed && state.phase === "active") {
    payload.endsAt = nowMs + Math.max(0, Number(state.timeLeft || 0)) * 1000;
  }

  storage.setItem(PRACTICE_TEST_STORAGE_KEY, JSON.stringify(payload));
}

export function loadPracticeTestSession(storage, nowMs = Date.now(), maxAgeMs = DEFAULT_MAX_AGE_MS) {
  if (!hasStorage(storage)) {
    return null;
  }

  const raw = storage.getItem(PRACTICE_TEST_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  const parsed = safeParse(raw);
  if (!parsed || parsed.version !== SCHEMA_VERSION) {
    clearPersistedPracticeTest(storage);
    return null;
  }

  if (typeof parsed.savedAt === "number" && nowMs - parsed.savedAt > maxAgeMs) {
    clearPersistedPracticeTest(storage);
    return null;
  }

  const restored = {
    phase: parsed.phase ?? "setup",
    questionCount: Number(parsed.questionCount ?? 10),
    timed: Boolean(parsed.timed),
    minutesPerQuestion: Number(parsed.minutesPerQuestion ?? 6),
    questions: Array.isArray(parsed.questions) ? parsed.questions : [],
    responses: Array.isArray(parsed.responses) ? parsed.responses : [],
    currentIndex: Number(parsed.currentIndex ?? 0),
    timeLeft: Number(parsed.timeLeft ?? 0),
    sessionStartedAt: parsed.sessionStartedAt ?? null
  };

  if (restored.timed && restored.phase === "active" && typeof parsed.endsAt === "number") {
    const computed = Math.max(0, Math.floor((parsed.endsAt - nowMs) / 1000));
    restored.timeLeft = computed;
    if (computed <= 0) {
      restored.phase = "review";
    }
  }

  return restored;
}

export const PRACTICE_TAG_STORAGE_KEY = "practice_tag_session_v1";
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

export function clearPersistedTagPractice(storage) {
  if (!hasStorage(storage)) {
    return;
  }
  storage.removeItem(PRACTICE_TAG_STORAGE_KEY);
}

export function saveTagPracticeSession(storage, state, nowMs = Date.now()) {
  if (!hasStorage(storage)) {
    return;
  }
  const payload = {
    version: SCHEMA_VERSION,
    savedAt: nowMs,
    selectedTags: state.selectedTags,
    count: state.count,
    showStudyAids: state.showStudyAids,
    questions: state.questions,
    responses: state.responses,
    currentIndex: state.currentIndex
  };
  storage.setItem(PRACTICE_TAG_STORAGE_KEY, JSON.stringify(payload));
}

export function loadTagPracticeSession(storage, nowMs = Date.now(), maxAgeMs = DEFAULT_MAX_AGE_MS) {
  if (!hasStorage(storage)) {
    return null;
  }
  const raw = storage.getItem(PRACTICE_TAG_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  const parsed = safeParse(raw);
  if (!parsed || parsed.version !== SCHEMA_VERSION) {
    clearPersistedTagPractice(storage);
    return null;
  }
  if (typeof parsed.savedAt === "number" && nowMs - parsed.savedAt > maxAgeMs) {
    clearPersistedTagPractice(storage);
    return null;
  }

  return {
    selectedTags: Array.isArray(parsed.selectedTags) ? parsed.selectedTags : [],
    count: Number(parsed.count ?? 30),
    showStudyAids: Boolean(parsed.showStudyAids),
    questions: Array.isArray(parsed.questions) ? parsed.questions : [],
    responses: Array.isArray(parsed.responses) ? parsed.responses : [],
    currentIndex: Number(parsed.currentIndex ?? 0)
  };
}

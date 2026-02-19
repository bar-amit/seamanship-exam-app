import test from "node:test";
import assert from "node:assert/strict";
import {
  PRACTICE_TEST_STORAGE_KEY,
  PRACTICE_TAG_STORAGE_KEY,
  clearPersistedPracticeTest,
  clearPersistedTagPractice,
  loadPracticeTestSession,
  loadTagPracticeSession,
  savePracticeTestSession,
  saveTagPracticeSession
} from "../src/lib/practice/persistence.js";

function createMemoryStorage() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    }
  };
}

test("practice test session persists and restores timed active state", () => {
  const storage = createMemoryStorage();
  const startMs = 1_000_000;
  savePracticeTestSession(
    storage,
    {
      phase: "active",
      questionCount: 10,
      timed: true,
      minutesPerQuestion: 6,
      questions: [{ id: "q1" }],
      responses: [{ choiceId: "a" }],
      currentIndex: 0,
      timeLeft: 120
    },
    startMs
  );

  const restored = loadPracticeTestSession(storage, startMs + 30_000);
  assert.equal(restored.phase, "active");
  assert.equal(restored.timeLeft, 90);
  assert.equal(restored.questions.length, 1);
});

test("practice test timed session expires to review when timer elapsed", () => {
  const storage = createMemoryStorage();
  const startMs = 1_000_000;
  savePracticeTestSession(
    storage,
    {
      phase: "active",
      questionCount: 5,
      timed: true,
      minutesPerQuestion: 1,
      questions: [{ id: "q1" }],
      responses: [{}],
      currentIndex: 0,
      timeLeft: 5
    },
    startMs
  );

  const restored = loadPracticeTestSession(storage, startMs + 10_000);
  assert.equal(restored.phase, "review");
  assert.equal(restored.timeLeft, 0);
});

test("practice test clear removes storage key", () => {
  const storage = createMemoryStorage();
  storage.setItem(PRACTICE_TEST_STORAGE_KEY, "{\"x\":1}");
  clearPersistedPracticeTest(storage);
  assert.equal(storage.getItem(PRACTICE_TEST_STORAGE_KEY), null);
});

test("tag practice session persists and restores", () => {
  const storage = createMemoryStorage();
  saveTagPracticeSession(storage, {
    selectedTags: ["navigation a"],
    count: 30,
    showStudyAids: false,
    questions: [{ id: "q1" }],
    responses: [{ revealed: true }],
    currentIndex: 0
  });

  const restored = loadTagPracticeSession(storage);
  assert.deepEqual(restored.selectedTags, ["navigation a"]);
  assert.equal(restored.count, 30);
  assert.equal(restored.questions.length, 1);
});

test("tag practice clear removes storage key", () => {
  const storage = createMemoryStorage();
  storage.setItem(PRACTICE_TAG_STORAGE_KEY, "{\"x\":1}");
  clearPersistedTagPractice(storage);
  assert.equal(storage.getItem(PRACTICE_TAG_STORAGE_KEY), null);
});

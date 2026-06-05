"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getNextQuestionIndex,
  hasAttempt,
  scoreSession,
  setSubAnswerTextAtIndex,
  setSubGradeAtIndex,
  updateResponseAtIndex
} from "../../src/features/practice-test/session.js";
import {
  buildReviewSummary,
  getFilteredReviewIndexes
} from "../../src/features/practice-test/review.js";
import {
  clearPersistedPracticeTest,
  loadPracticeTestSession,
  savePracticeTestSession
} from "../../src/features/practice-test/persistence.js";
import {
  buildPracticeTestSummary,
  pushTestSummary
} from "../../src/features/practice-test/analytics.js";
import {
  buildPracticeResetState,
  buildPracticeStartState,
  clampCurrentIndex,
  clampPracticeMinutes,
  normalizePracticeQuestionCount
} from "../../src/features/practice-test/setup.js";
import { fetchPracticeQuestions } from "../../src/features/practice-test/questions.js";
import PageHeader from "../../src/components/page-header.js";
import { uiText } from "../../src/content/strings.js";
import ActivePracticePanel from "./_components/active-practice-panel.js";
import PracticeReviewPanel from "./_components/practice-review-panel.js";
import PracticeSetupPanel from "./_components/practice-setup-panel.js";
import QuestionNavigator from "./_components/question-navigator.js";

export default function PracticePage() {
  const [phase, setPhase] = useState("setup");
  const [questionCount, setQuestionCount] = useState(10);
  const [timed, setTimed] = useState(true);
  const [minutesPerQuestion, setMinutesPerQuestion] = useState(6);
  const [minutesHint, setMinutesHint] = useState("");
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [reviewFilter, setReviewFilter] = useState("all");
  const [showExplanations, setShowExplanations] = useState(true);
  const [sessionStartedAt, setSessionStartedAt] = useState(null);
  const [summarySaved, setSummarySaved] = useState(false);
  const [collectionTargetQuestionId, setCollectionTargetQuestionId] = useState("");

  const currentQuestion = questions[currentIndex];
  const currentResponse = responses[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const canSubmitCurrent = Boolean(currentQuestion) && hasAttempt(currentQuestion, currentResponse);

  useEffect(() => {
    if (phase !== "active" || !timed) {
      return;
    }
    if (timeLeft <= 0) {
      setPhase("review");
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, timed, timeLeft]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const restored = loadPracticeTestSession(window.localStorage);
    if (restored) {
      setPhase(restored.phase);
      setQuestionCount(normalizePracticeQuestionCount(restored.questionCount));
      setTimed(restored.timed);
      setMinutesPerQuestion(clampPracticeMinutes(restored.minutesPerQuestion));
      setQuestions(restored.questions);
      setResponses(restored.responses);
      setCurrentIndex(clampCurrentIndex(restored.currentIndex, restored.questions.length));
      setTimeLeft(Math.max(0, restored.timeLeft));
      setSessionStartedAt(restored.sessionStartedAt ?? Date.now());
      if (restored.phase === "review") {
        setSummarySaved(true);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") {
      return;
    }
    const timer = setTimeout(() => {
      savePracticeTestSession(window.localStorage, {
        phase,
        questionCount,
        timed,
        minutesPerQuestion,
        questions,
        responses,
        currentIndex,
        timeLeft,
        sessionStartedAt
      });
    }, 150);
    return () => clearTimeout(timer);
  }, [
    hydrated,
    phase,
    questionCount,
    timed,
    minutesPerQuestion,
    questions,
    responses,
    currentIndex,
    timeLeft,
    sessionStartedAt
  ]);

  useEffect(() => {
    if (!hydrated || phase !== "review" || summarySaved || typeof window === "undefined") {
      return;
    }
    const startedAt = sessionStartedAt ?? Date.now();
    const endedAt = Date.now();
    const summary = buildPracticeTestSummary({
      questions,
      responses,
      startedAt,
      endedAt
    });
    pushTestSummary(window.localStorage, summary);
    setSummarySaved(true);
  }, [hydrated, phase, summarySaved, questions, responses, sessionStartedAt]);

  const overallScore = useMemo(
    () => (phase === "review" ? scoreSession(questions, responses) : 0),
    [phase, questions, responses]
  );

  const reviewSummary = useMemo(
    () => (phase === "review" ? buildReviewSummary(questions, responses) : null),
    [phase, questions, responses]
  );

  const reviewIndexes = useMemo(
    () => (phase === "review" ? getFilteredReviewIndexes(questions, responses, reviewFilter) : []),
    [phase, questions, responses, reviewFilter]
  );

  async function startPractice() {
    setIsLoading(true);
    setError("");
    setMinutesHint("");
    try {
      const safeMinutes = clampPracticeMinutes(minutesPerQuestion);
      if (safeMinutes !== minutesPerQuestion) {
        setMinutesPerQuestion(safeMinutes);
        setMinutesHint(uiText.practice.minutesRangeHint);
      }
      const loadedQuestions = await fetchPracticeQuestions({
        count: questionCount,
        fallbackError: uiText.practice.errors.loadQuestionsFailed
      });
      const startState = buildPracticeStartState({
        questionCount,
        minutesPerQuestion,
        questions: loadedQuestions
      });
      setQuestions(startState.questions);
      setResponses(startState.responses);
      setCurrentIndex(startState.currentIndex);
      setTimeLeft(startState.timeLeft);
      setSessionStartedAt(startState.sessionStartedAt);
      setSummarySaved(startState.summarySaved);
      setPhase(startState.phase);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function updateCurrentResponse(next) {
    setResponses((prev) => updateResponseAtIndex(prev, currentIndex, next));
  }

  function skipCurrent() {
    updateCurrentResponse({ skipped: true });
    setCurrentIndex((prev) => getNextQuestionIndex(prev, questions.length));
  }

  function finalizeCurrent() {
    updateCurrentResponse({ skipped: false });
    setCurrentIndex((prev) => getNextQuestionIndex(prev, questions.length));
  }

  function resetToSetup() {
    const resetState = buildPracticeResetState();
    setPhase(resetState.phase);
    setQuestions(resetState.questions);
    setResponses(resetState.responses);
    setCurrentIndex(resetState.currentIndex);
    setTimeLeft(resetState.timeLeft);
    setError(resetState.error);
    setMinutesHint(resetState.minutesHint);
    setSessionStartedAt(resetState.sessionStartedAt);
    setSummarySaved(resetState.summarySaved);
    if (typeof window !== "undefined") {
      clearPersistedPracticeTest(window.localStorage);
    }
  }

  return (
    <main>
      <PageHeader title={uiText.practice.title}>
        <p>
          <a href="/practice/tags">{uiText.practice.switchToTagPractice}</a>
        </p>
      </PageHeader>

      {phase === "setup" && (
        <PracticeSetupPanel
          questionCount={questionCount}
          setQuestionCount={setQuestionCount}
          timed={timed}
          setTimed={setTimed}
          minutesPerQuestion={minutesPerQuestion}
          setMinutesPerQuestion={setMinutesPerQuestion}
          minutesHint={minutesHint}
          setMinutesHint={setMinutesHint}
          isLoading={isLoading}
          error={error}
          onStart={startPractice}
        />
      )}

      {phase === "active" && currentQuestion && (
        <>
          <ActivePracticePanel
            question={currentQuestion}
            response={currentResponse}
            currentIndex={currentIndex}
            questionTotal={questions.length}
            timed={timed}
            timeLeft={timeLeft}
            isLastQuestion={isLastQuestion}
            canSubmitCurrent={canSubmitCurrent}
            onResponseChange={updateCurrentResponse}
            onSubAnswerTextChange={(subId, text) =>
              setResponses((prev) => setSubAnswerTextAtIndex(prev, currentIndex, subId, text))
            }
            onSubGradeChange={(subId, checked) =>
              setResponses((prev) => setSubGradeAtIndex(prev, currentIndex, subId, checked))
            }
            onSkip={skipCurrent}
            onFinalize={finalizeCurrent}
            onSkipAndReview={() => {
              updateCurrentResponse({ skipped: true });
              setPhase("review");
            }}
            onFinalizeAndReview={() => {
              updateCurrentResponse({ skipped: false });
              setPhase("review");
            }}
          />
          <QuestionNavigator
            questions={questions}
            responses={responses}
            currentIndex={currentIndex}
            onSelectQuestion={setCurrentIndex}
          />
        </>
      )}

      {phase === "review" && (
        <PracticeReviewPanel
          questions={questions}
          responses={responses}
          reviewIndexes={reviewIndexes}
          reviewSummary={reviewSummary}
          overallScore={overallScore}
          reviewFilter={reviewFilter}
          setReviewFilter={setReviewFilter}
          showExplanations={showExplanations}
          setShowExplanations={setShowExplanations}
          collectionTargetQuestionId={collectionTargetQuestionId}
          setCollectionTargetQuestionId={setCollectionTargetQuestionId}
          setResponses={setResponses}
          onReset={resetToSetup}
        />
      )}
    </main>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getQuestionStatus,
  hasAttempt,
  scoreQuestion,
  scoreSession
} from "../../src/lib/practice/session.js";
import StorageImage from "../../src/components/storage-image.js";

function formatSeconds(totalSeconds) {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function setupResponse(question) {
  if (question.type === "open_text") {
    return { text: "", subGrades: {}, skipped: false };
  }
  return { choiceId: "", skipped: false };
}

export default function PracticePage() {
  const [phase, setPhase] = useState("setup");
  const [questionCount, setQuestionCount] = useState(10);
  const [timed, setTimed] = useState(true);
  const [minutesPerQuestion, setMinutesPerQuestion] = useState(6);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);

  const currentQuestion = questions[currentIndex];
  const currentResponse = responses[currentIndex];

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

  const overallScore = useMemo(() => {
    if (phase !== "review") {
      return 0;
    }
    return scoreSession(questions, responses);
  }, [phase, questions, responses]);

  async function startPractice() {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/practice/questions?count=${questionCount}`);
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to load practice questions");
      }
      setQuestions(data.questions);
      setResponses(data.questions.map((q) => setupResponse(q)));
      setCurrentIndex(0);
      setTimeLeft(questionCount * minutesPerQuestion * 60);
      setPhase("active");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function updateCurrentResponse(next) {
    setResponses((prev) => prev.map((item, idx) => (idx === currentIndex ? { ...item, ...next } : item)));
  }

  function toggleSubGrade(subId, checked) {
    setResponses((prev) =>
      prev.map((item, idx) => {
        if (idx !== currentIndex) {
          return item;
        }
        return {
          ...item,
          subGrades: {
            ...(item.subGrades ?? {}),
            [subId]: checked
          }
        };
      })
    );
  }

  function skipCurrent() {
    updateCurrentResponse({ skipped: true });
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }

  function finalizeCurrent() {
    updateCurrentResponse({ skipped: false });
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }

  function resetToSetup() {
    setPhase("setup");
    setQuestions([]);
    setResponses([]);
    setCurrentIndex(0);
    setTimeLeft(0);
    setError("");
  }

  return (
    <main>
      <section className="card">
        <h1>תרגול מבחן</h1>

        <p>
          <a href="/practice/tags">מעבר לתרגול לפי תגית</a>
        </p>
      </section>

      {phase === "setup" && (
        <section className="card practice-block">
          <h2>הגדרות מבחן</h2>
          <label>
            מספר שאלות
            <select value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </label>
          <label className="practice-inline">
            <input type="checkbox" checked={timed} onChange={(e) => setTimed(e.target.checked)} />
            מבחן עם טיימר
          </label>
          <label>
            זמן מענה לשאלה (דקות)
            <input
              type="number"
              min={1}
              max={30}
              value={minutesPerQuestion}
              onChange={(e) => setMinutesPerQuestion(Number(e.target.value))}
              disabled={!timed}
            />
          </label>
          <button disabled={isLoading} onClick={startPractice}>
            {isLoading ? "טוען שאלות..." : "התחל"}
          </button>
          {error && <p className="error">{error}</p>}
        </section>
      )}

      {phase === "active" && currentQuestion && (
        <>
          <section className="card practice-block">
            <div className="practice-topbar">
              <strong>
                שאלה {currentIndex + 1} מתוך {questions.length}
              </strong>
              {timed && <strong>זמן נותר: {formatSeconds(timeLeft)}</strong>}
            </div>
            <p>{currentQuestion.text}</p>
            <StorageImage
              imageStoragePath={currentQuestion.image_storage_path}
              imageRef={currentQuestion.image_ref}
              alt={`תמונה לשאלה ${currentQuestion.id}`}
              className="question-image"
            />

            {currentQuestion.type === "mcq" && (
              <div className="choices-list">
                {currentQuestion.choices.map((choice) => (
                  <label key={choice.id} className="choice-item">
                    <input
                      type="radio"
                      name={`q-${currentQuestion.id}`}
                      checked={currentResponse?.choiceId === choice.id}
                      onChange={() => updateCurrentResponse({ choiceId: choice.id, skipped: false })}
                    />
                    <span>
                      {choice.label}. {choice.text}
                    </span>
                    <StorageImage
                      imageStoragePath={choice.image_storage_path}
                      imageRef={choice.image_ref}
                      alt={`תמונה לאפשרות ${choice.label}`}
                      className="choice-image"
                    />
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.type === "open_text" && (
              <div className="open-text-block">
                <textarea
                  rows={5}
                  value={currentResponse?.text ?? ""}
                  onChange={(e) => updateCurrentResponse({ text: e.target.value, skipped: false })}
                  placeholder="הקלד תשובה..."
                />
              </div>
            )}

            <div className="practice-actions">
              <button type="button" onClick={skipCurrent}>
                דלג
              </button>
              <button type="button" onClick={finalizeCurrent}>
                שמור והמשך
              </button>
              <button type="button" onClick={() => setPhase("review")}>
                סיים ועבור לבדיקה
              </button>
            </div>
          </section>

          <section className="card practice-block">
            <h3>ניווט שאלות</h3>
            <div className="navigator-grid">
              {questions.map((q, idx) => {
                const status = getQuestionStatus(q, responses[idx], idx === currentIndex);
                return (
                  <button
                    key={q.id}
                    className={`navigator-dot status-${status}`}
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`שאלה ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </section>
        </>
      )}

      {phase === "review" && (
        <section className="card practice-block">
          <h2>בדיקה וסיכום</h2>
          <p>
            ציון סופי: <strong>{overallScore.toFixed(1)}%</strong>
          </p>
          <div className="review-list">
            {questions.map((q, idx) => {
              const response = responses[idx];
              const attempted = hasAttempt(q, response);
              const perQuestionScore = scoreQuestion(q, response);
              return (
                <article key={q.id} className="review-item">
                  <h3>
                    {idx + 1}. {q.text}
                  </h3>
                  <StorageImage
                    imageStoragePath={q.image_storage_path}
                    imageRef={q.image_ref}
                    alt={`תמונה לשאלה ${q.id}`}
                    className="question-image"
                  />
                  <p>תגיות: {(q.tags ?? []).join(", ") || "-"}</p>
                  <p>ציון לשאלה: {perQuestionScore.toFixed(1)}%</p>

                  {q.type === "mcq" && (
                    <>
                      <p>התשובת שלך: {response?.choiceId || "לא נענה"}</p>
                      {attempted && <p>התשובה הנכונה: {q.correct_choice_id}</p>}
                    </>
                  )}

                  {q.type === "open_text" && (
                    <>
                      <p>התשובה שלך: {response?.text?.trim() || "לא נענה"}</p>
                      <div className="subgrade-list">
                        <strong>סימון סעיפים נכונים:</strong>
                        {(q.sub_questions ?? []).map((sub) => (
                          <label key={sub.id} className="practice-inline">
                            <input
                              type="checkbox"
                              checked={Boolean(response?.subGrades?.[sub.id])}
                              onChange={(e) => {
                                setCurrentIndex(idx);
                                toggleSubGrade(sub.id, e.target.checked);
                              }}
                            />
                            {sub.label}. {sub.text}
                          </label>
                        ))}
                      </div>
                    </>
                  )}

                  {attempted && q.model_answer && (
                    <div>
                      <strong>הסבר/פתרון:</strong>
                      <p>{q.model_answer}</p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
          <button type="button" onClick={resetToSetup}>
            מבחן חדש
          </button>
        </section>
      )}
    </main>
  );
}

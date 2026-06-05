import { clampPracticeMinutes } from "../../../src/features/practice-test/setup.js";
import { uiText } from "../../../src/content/strings.js";

export default function PracticeSetupPanel({
  questionCount,
  setQuestionCount,
  timed,
  setTimed,
  minutesPerQuestion,
  setMinutesPerQuestion,
  minutesHint,
  setMinutesHint,
  isLoading,
  error,
  onStart
}) {
  return (
    <section className="card practice-block">
      <h2>{uiText.practice.setupTitle}</h2>
      <div className="setup-controls">
        <label>
          {uiText.practice.questionCountLabel}
          <select value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </label>

        <div className="timer-setting-container">
          <label className="timer-toggle">
            <input type="checkbox" checked={timed} onChange={(e) => setTimed(e.target.checked)} />
            {uiText.practice.minutesPerQuestionLabel}
          </label>
          <label className="timer-label">
            <p className="minutes-toast">{uiText.practice.minutesText(minutesPerQuestion)}</p>
            <input
              type="range"
              min={1}
              max={20}
              value={minutesPerQuestion}
              onChange={(e) => {
                const raw = Number(e.target.value);
                const safe = clampPracticeMinutes(raw);
                setMinutesPerQuestion(safe);
                setMinutesHint(!Number.isFinite(raw) || safe !== raw ? uiText.practice.minutesInputHint : "");
              }}
              disabled={!timed}
            />
          </label>
        </div>
        {minutesHint && <p className="muted">{minutesHint}</p>}
      </div>
      <button disabled={isLoading} onClick={onStart}>
        {isLoading ? uiText.practice.startLoading : uiText.practice.start}
      </button>
      {error && <p className="error">{error}</p>}
    </section>
  );
}

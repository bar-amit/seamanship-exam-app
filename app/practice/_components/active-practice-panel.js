import QuestionImageList from "../../../src/components/question-image-list.js";
import ClickableStorageImage from "../../../src/components/clickable-storage-image.js";
import OpenTextResponse from "../../../src/components/practice/open-text-response.js";
import { formatPracticeSeconds } from "../../../src/features/practice-test/setup.js";
import { uiText } from "../../../src/content/strings.js";

export default function ActivePracticePanel({
  question,
  response,
  currentIndex,
  questionTotal,
  timed,
  timeLeft,
  isLastQuestion,
  canSubmitCurrent,
  onResponseChange,
  onSubAnswerTextChange,
  onSubGradeChange,
  onSkip,
  onFinalize,
  onSkipAndReview,
  onFinalizeAndReview
}) {
  return (
    <section className="card practice-block">
      <div className="practice-topbar">
        <strong>
          {uiText.practice.questionProgressPrefix} {currentIndex + 1} {uiText.practice.questionProgressOutOf}{" "}
          {questionTotal}
        </strong>
        {timed && (
          <strong>
            {uiText.practice.timeLeftLabel} {formatPracticeSeconds(timeLeft)}
          </strong>
        )}
      </div>
      <div className="prompt-row">
        <p>{question.text}</p>
        <QuestionImageList
          question={question}
          altForImage={(imageRef, index) => `${uiText.practice.altQuestionImage(question.id)} ${index + 1}`}
        />
      </div>

      {question.type === "mcq" && (
        <div className="choices-list">
          {question.choices.map((choice) => (
            <label key={choice.id} className="choice-item">
              <input
                type="radio"
                name={`q-${question.id}`}
                checked={response?.choiceId === choice.id}
                onChange={() => onResponseChange({ choiceId: choice.id, skipped: false })}
              />
              <span className="choice-text">
                {choice.label}. {choice.text}
              </span>
              <ClickableStorageImage
                imageStoragePath={choice.image_storage_path}
                imageRef={choice.image_ref}
                alt={uiText.practice.altChoiceImage(choice.label)}
                className="choice-image inline-thumb"
              />
            </label>
          ))}
        </div>
      )}

      {question.type === "open_text" && (
        <OpenTextResponse
          question={question}
          response={response}
          labels={uiText.practice.openText}
          onTextChange={(text) => onResponseChange({ text, skipped: false })}
          onSubAnswerTextChange={onSubAnswerTextChange}
          onSubGradeChange={onSubGradeChange}
        />
      )}

      <div className="practice-actions">
        {isLastQuestion ? (
          <>
            <button type="button" onClick={onSkipAndReview}>
              {uiText.practice.buttons.skipAndFinish}
            </button>
            <button type="button" onClick={onFinalizeAndReview} disabled={!canSubmitCurrent}>
              {uiText.practice.buttons.finishAndReview}
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={onSkip}>
              {uiText.practice.buttons.skip}
            </button>
            <button type="button" onClick={onFinalize} disabled={!canSubmitCurrent}>
              {uiText.practice.buttons.saveAndNext}
            </button>
          </>
        )}
      </div>
    </section>
  );
}

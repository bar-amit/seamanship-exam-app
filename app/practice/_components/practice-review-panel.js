import AddToCollectionModal from "../../../src/components/add-to-collection-modal.js";
import ClickableStorageImage from "../../../src/components/clickable-storage-image.js";
import QuestionImageList from "../../../src/components/question-image-list.js";
import OpenTextResponse from "../../../src/components/practice/open-text-response.js";
import ReviewControls from "../../../src/components/practice/review-controls.js";
import ReviewStatusBadge from "../../../src/components/practice/review-status-badge.js";
import ReviewSummary from "../../../src/components/practice/review-summary.js";
import { getReviewStatus } from "../../../src/features/practice-test/review.js";
import {
  hasAttempt,
  scoreQuestion,
  setSubGradeAtIndex
} from "../../../src/features/practice-test/session.js";
import { uiText } from "../../../src/content/strings.js";

export default function PracticeReviewPanel({
  questions,
  responses,
  reviewIndexes,
  reviewSummary,
  overallScore,
  reviewFilter,
  setReviewFilter,
  showExplanations,
  setShowExplanations,
  collectionTargetQuestionId,
  setCollectionTargetQuestionId,
  setResponses,
  onReset
}) {
  return (
    <>
      <section className="card practice-block">
        <h2>{uiText.practice.reviewTitle}</h2>
        <p>
          {uiText.practice.finalScoreLabel} <strong>{overallScore.toFixed(1)}%</strong>
        </p>
        <ReviewSummary summary={reviewSummary} />
        <ReviewControls
          reviewFilter={reviewFilter}
          setReviewFilter={setReviewFilter}
          showExplanations={showExplanations}
          setShowExplanations={setShowExplanations}
        />
        <div className="review-list">
          {reviewIndexes.map((index) => (
            <ReviewQuestion
              key={questions[index].id}
              index={index}
              question={questions[index]}
              response={responses[index]}
              showExplanations={showExplanations}
              setCollectionTargetQuestionId={setCollectionTargetQuestionId}
              setResponses={setResponses}
            />
          ))}
        </div>
        <button type="button" onClick={onReset}>
          {uiText.practice.buttons.newTest}
        </button>
      </section>
      <AddToCollectionModal
        isOpen={Boolean(collectionTargetQuestionId)}
        questionId={collectionTargetQuestionId}
        onClose={() => setCollectionTargetQuestionId("")}
      />
    </>
  );
}

function ReviewQuestion({
  index,
  question,
  response,
  showExplanations,
  setCollectionTargetQuestionId,
  setResponses
}) {
  const attempted = hasAttempt(question, response);
  const perQuestionScore = scoreQuestion(question, response);
  const reviewStatus = getReviewStatus(question, response);

  return (
    <article className="review-item">
      <ReviewStatusBadge status={reviewStatus} />
      <div className="prompt-row">
        <h3>
          {index + 1}. {question.text}
        </h3>
        <QuestionImageList
          question={question}
          altForImage={(imageRef, imageIndex) =>
            `${uiText.practice.altQuestionImage(question.id)} ${imageIndex + 1}`
          }
        />
      </div>
      <p>{uiText.practice.tagsLabel} {(question.tags ?? []).join(", ") || uiText.common.notAvailable}</p>
      <p>{uiText.practice.questionScoreLabel} {perQuestionScore.toFixed(1)}%</p>
      <button type="button" onClick={() => setCollectionTargetQuestionId(question.id)}>
        {uiText.collections.addModal.trigger}
      </button>

      {question.type === "mcq" && <McqReview question={question} response={response} attempted={attempted} />}

      {question.type === "open_text" && (
        <OpenTextResponse
          question={question}
          response={response}
          labels={uiText.practice.openText}
          showSectionAnswers={showExplanations}
          readOnly
          onSubGradeChange={(subId, checked) => {
            setResponses((prev) => setSubGradeAtIndex(prev, index, subId, checked));
          }}
        />
      )}

      {showExplanations && attempted && question.model_answer && (
        <div>
          <strong>{uiText.practice.explanationLabel}</strong>
          <p>{question.model_answer}</p>
        </div>
      )}
    </article>
  );
}

function McqReview({ question, response, attempted }) {
  return (
    <>
      <p>{uiText.practice.yourAnswerMcqLabel} {response?.choiceId || uiText.practice.unanswered}</p>
      {attempted && <p>{uiText.practice.correctAnswerLabel} {question.correct_choice_id}</p>}
      <div className="review-choice-list">
        {question.choices?.map((choice) => {
          const isCorrect = choice.id === question.correct_choice_id;
          const isSelected = choice.id === response?.choiceId;
          return (
            <div
              key={`${question.id}-review-choice-${choice.id}`}
              className={`review-choice-bar${isCorrect ? " is-correct" : ""}${isSelected ? " is-selected" : ""}`}
            >
              <span className="choice-text">
                {choice.label}. {choice.text}
              </span>
              <ClickableStorageImage
                imageStoragePath={choice.image_storage_path}
                imageRef={choice.image_ref}
                alt={uiText.practice.altChoiceImage(choice.label)}
                className="choice-image inline-thumb"
              />
            </div>
          );
        })}
      </div>
    </>
  );
}

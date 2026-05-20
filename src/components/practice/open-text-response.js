"use client";

import { getSubAnswerForQuestion } from "../../features/practice-test/open-text.js";

export default function OpenTextResponse({
  question,
  response,
  labels,
  showSectionAnswers = false,
  onTextChange,
  onSubAnswerTextChange,
  onSubGradeChange,
  readOnly = false
}) {
  const subQuestions = Array.isArray(question?.sub_questions) ? question.sub_questions : [];

  if (subQuestions.length === 0) {
    if (readOnly) {
      return <p>{labels.yourAnswerLabel} {response?.text?.trim() || labels.unanswered}</p>;
    }

    return (
      <div className="open-text-block">
        <textarea
          rows={5}
          value={response?.text ?? ""}
          onChange={(e) => onTextChange?.(e.target.value)}
          placeholder={labels.openTextPlaceholder}
        />
      </div>
    );
  }

  return (
    <div className="open-section-list">
      {labels.sectionInstruction && <strong>{labels.sectionInstruction}</strong>}
      {subQuestions.map((sub, subIndex) => {
        const subAnswer = getSubAnswerForQuestion(question, sub, subIndex);
        const answerText = response?.subAnswerTexts?.[sub.id] ?? "";
        const sectionAnswerVisible = showSectionAnswers && subAnswer?.text;

        return (
          <section key={`${sub.id}-${subIndex}`} className="open-section-card">
            <div className="open-section-prompt">
              <strong>{sub.label}.</strong>
              <span>{sub.text}</span>
            </div>
            {readOnly ? (
              <p className="open-section-user-answer">
                <strong>{labels.yourAnswerLabel}</strong> {answerText.trim() || labels.unanswered}
              </p>
            ) : (
              <textarea
                rows={4}
                value={answerText}
                onChange={(e) => onSubAnswerTextChange?.(sub.id, e.target.value)}
                placeholder={labels.subAnswerPlaceholder ?? labels.openTextPlaceholder}
              />
            )}
            <label className="practice-inline open-section-grade">
              <input
                type="checkbox"
                checked={Boolean(response?.subGrades?.[sub.id])}
                onChange={(e) => onSubGradeChange?.(sub.id, e.target.checked)}
              />
              <span>{labels.subGradeInstruction}</span>
            </label>
            {sectionAnswerVisible && <small className="sub-answer-text">{subAnswer.text}</small>}
          </section>
        );
      })}
    </div>
  );
}

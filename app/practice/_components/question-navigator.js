import { getQuestionStatus } from "../../../src/features/practice-test/session.js";
import { uiText } from "../../../src/content/strings.js";

export default function QuestionNavigator({ questions, responses, currentIndex, onSelectQuestion }) {
  return (
    <section className="card practice-block">
      <h3>{uiText.practice.navigationTitle}</h3>
      <div className="navigator-grid">
        {questions.map((question, index) => {
          const status = getQuestionStatus(question, responses[index], index === currentIndex);
          return (
            <button
              key={question.id}
              className={`navigator-dot status-${status}`}
              onClick={() => onSelectQuestion(index)}
              aria-label={uiText.practice.ariaQuestion(index + 1)}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </section>
  );
}

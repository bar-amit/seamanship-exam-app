export function getSubAnswerForQuestion(question, subQuestion, index) {
  const subAnswers = Array.isArray(question?.sub_answers) ? question.sub_answers : [];
  if (subAnswers[index]?.text) {
    return subAnswers[index];
  }
  return subAnswers.find((answer) => answer?.id === subQuestion?.id) ?? null;
}

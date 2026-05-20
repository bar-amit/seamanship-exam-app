function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function makeFinding(severity, code, message, questionId, path = null) {
  return { severity, code, message, question_id: questionId ?? null, path };
}

function addRequiredStringError(errors, question, field) {
  if (!isNonEmptyString(question?.[field])) {
    errors.push(
      makeFinding("error", "required_field_missing", `Question is missing required field: ${field}.`, question?.id, field)
    );
  }
}

export function validateImportQuestion(question) {
  const errors = [];
  const warnings = [];
  const questionId = question?.id ?? null;

  addRequiredStringError(errors, question, "id");
  addRequiredStringError(errors, question, "text");

  if (question?.type !== "mcq" && question?.type !== "open_text") {
    errors.push(
      makeFinding(
        "error",
        "unsupported_question_type",
        `Unsupported question type: ${question?.type ?? "<missing>"}.`,
        questionId,
        "type"
      )
    );
  }

  if (!Array.isArray(question?.tags) || question.tags.length === 0 || question.tags.some((tag) => !isNonEmptyString(tag))) {
    errors.push(makeFinding("error", "invalid_tags", "Question must have at least one non-empty tag.", questionId, "tags"));
  }

  if (!isNonEmptyString(question?.chapter)) {
    warnings.push(makeFinding("warning", "missing_chapter", "Question has no chapter metadata.", questionId, "chapter"));
  }

  if (question?.image_ref && !isNonEmptyString(question?.image_storage_path)) {
    errors.push(
      makeFinding(
        "error",
        "missing_image_storage_path",
        "Question image_ref requires image_storage_path.",
        questionId,
        "image_storage_path"
      )
    );
  }

  if (Array.isArray(question?.image_refs)) {
    question.image_refs.forEach((imageRef, index) => {
      if (!isNonEmptyString(imageRef)) {
        errors.push(
          makeFinding("error", "invalid_image_ref", "image_refs entries must be non-empty strings.", questionId, `image_refs.${index}`)
        );
      }
      if (!isNonEmptyString(question?.image_storage_paths?.[index])) {
        errors.push(
          makeFinding(
            "error",
            "missing_image_storage_path",
            "Each image_refs entry requires a matching image_storage_paths entry.",
            questionId,
            `image_storage_paths.${index}`
          )
        );
      }
    });
  }

  if (Array.isArray(question?.choices)) {
    for (const [index, choice] of question.choices.entries()) {
      if (!isNonEmptyString(choice?.id)) {
        errors.push(
          makeFinding("error", "invalid_choice_id", "Choice must have a non-empty id.", questionId, `choices.${index}.id`)
        );
      }
      if (choice?.image_ref && !isNonEmptyString(choice?.image_storage_path)) {
        errors.push(
          makeFinding(
            "error",
            "missing_choice_image_storage_path",
            "Choice image_ref requires image_storage_path.",
            questionId,
            `choices.${index}.image_storage_path`
          )
        );
      }
    }
  }

  if (question?.type === "mcq") {
    const choices = Array.isArray(question.choices) ? question.choices : [];
    if (choices.length === 0) {
      errors.push(makeFinding("error", "missing_choices", "MCQ question must include choices.", questionId, "choices"));
    }

    const choiceIds = choices.map((choice) => choice?.id).filter(isNonEmptyString);
    if (new Set(choiceIds).size !== choiceIds.length) {
      errors.push(makeFinding("error", "duplicate_choice_ids", "MCQ choices must have unique ids.", questionId, "choices"));
    }

    if (!isNonEmptyString(question.correct_choice_id)) {
      errors.push(
        makeFinding("error", "missing_correct_choice", "MCQ question must include correct_choice_id.", questionId, "correct_choice_id")
      );
    } else if (!choiceIds.includes(question.correct_choice_id)) {
      errors.push(
        makeFinding(
          "error",
          "correct_choice_not_found",
          "MCQ correct_choice_id must match one of the choice ids.",
          questionId,
          "correct_choice_id"
        )
      );
    }
  }

  if (question?.type === "open_text") {
    if (!Array.isArray(question.sub_questions) || question.sub_questions.length === 0) {
      warnings.push(
        makeFinding(
          "warning",
          "missing_sub_questions",
          "Open text question has no sub_questions and will be answered as a single prompt.",
          questionId,
          "sub_questions"
        )
      );
    }
    if (!isNonEmptyString(question.model_answer)) {
      errors.push(
        makeFinding("error", "missing_model_answer", "Open text question must include model_answer.", questionId, "model_answer")
      );
    }
    if (
      Array.isArray(question.sub_answers) &&
      question.sub_answers.length > 0 &&
      Array.isArray(question.sub_questions) &&
      question.sub_questions.length > 0 &&
      question.sub_answers.length !== question.sub_questions.length
    ) {
      errors.push(
        makeFinding(
          "error",
          "sub_answer_alignment_mismatch",
          "Open text sub_answers must align one-to-one with sub_questions when provided.",
          questionId,
          "sub_answers"
        )
      );
    }
    const subQuestionIds = (question.sub_questions ?? []).map((subQuestion) => subQuestion?.id).filter(isNonEmptyString);
    if (new Set(subQuestionIds).size !== subQuestionIds.length) {
      errors.push(
        makeFinding(
          "error",
          "duplicate_sub_question_ids",
          "Open text sub_questions must have unique ids for self-grading.",
          questionId,
          "sub_questions"
        )
      );
    }
  }

  return {
    question_id: questionId,
    ok: errors.length === 0,
    errors,
    warnings
  };
}

export function validateImportQuestions(questions) {
  const questionResults = questions.map(validateImportQuestion);
  const duplicateIdErrors = [];
  const seen = new Set();
  const duplicates = new Set();

  for (const question of questions) {
    if (!isNonEmptyString(question?.id)) {
      continue;
    }
    if (seen.has(question.id)) {
      duplicates.add(question.id);
    }
    seen.add(question.id);
  }

  for (const id of Array.from(duplicates).sort()) {
    duplicateIdErrors.push(
      makeFinding("error", "duplicate_question_id", "Question ids must be unique within an import batch.", id, "id")
    );
  }

  const errors = [...questionResults.flatMap((result) => result.errors), ...duplicateIdErrors];
  const warnings = questionResults.flatMap((result) => result.warnings);

  return {
    ok: errors.length === 0,
    total: questions.length,
    error_count: errors.length,
    warning_count: warnings.length,
    errors,
    warnings,
    question_results: questionResults
  };
}

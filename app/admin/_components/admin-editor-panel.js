import { uiText } from "../../../src/content/strings.js";

export default function AdminEditorPanel({
  selectedId,
  isLoadingQuestion,
  error,
  notice,
  questionType,
  selectedSummary,
  questionText,
  setQuestionText,
  modelAnswer,
  setModelAnswer,
  tagsDraft,
  setTagsDraft,
  imageRefsDraft,
  setImageRefsDraft,
  referencesDiagramDraft,
  setReferencesDiagramDraft,
  correctChoiceId,
  setCorrectChoiceId,
  choicesDraft,
  subQuestionsDraft,
  subAnswersDraft,
  saveBusy,
  showQuestionJson,
  showPayloadJson,
  loadedQuestion,
  savePayload,
  onSave,
  onReload,
  onToggleQuestionJson,
  onTogglePayloadJson,
  onAddChoice,
  onRemoveChoice,
  onUpdateChoice,
  onAddSubQuestion,
  onRemoveSubQuestion,
  onUpdateSubQuestion,
  onUpdateSubAnswer
}) {
  return (
    <section className="card practice-block">
      <h2>{uiText.admin.editorTitle}</h2>
      {!selectedId && <p className="muted">{uiText.admin.noQuestionSelected}</p>}
      {isLoadingQuestion && <p className="muted">{uiText.admin.loadingQuestion}</p>}
      {error && <p className="error">{error}</p>}
      {notice && <p className="muted">{notice}</p>}

      {selectedId && !isLoadingQuestion && (
        <>
          <QuestionMetadata selectedId={selectedId} questionType={questionType} selectedSummary={selectedSummary} />

          <label>
            {uiText.admin.questionTextLabel}
            <textarea rows={5} value={questionText} onChange={(e) => setQuestionText(e.target.value)} />
          </label>

          <label>
            {uiText.admin.modelAnswerLabel}
            <textarea rows={5} value={modelAnswer} onChange={(e) => setModelAnswer(e.target.value)} />
          </label>

          <label>
            {uiText.admin.tagsLabel}
            <input value={tagsDraft} onChange={(e) => setTagsDraft(e.target.value)} />
          </label>

          <AssetMetadataEditor
            imageRefsDraft={imageRefsDraft}
            setImageRefsDraft={setImageRefsDraft}
            referencesDiagramDraft={referencesDiagramDraft}
            setReferencesDiagramDraft={setReferencesDiagramDraft}
          />

          {questionType === "mcq" && (
            <McqEditor
              correctChoiceId={correctChoiceId}
              setCorrectChoiceId={setCorrectChoiceId}
              choicesDraft={choicesDraft}
              onAddChoice={onAddChoice}
              onRemoveChoice={onRemoveChoice}
              onUpdateChoice={onUpdateChoice}
            />
          )}

          {questionType === "open_text" && (
            <OpenTextEditor
              subQuestionsDraft={subQuestionsDraft}
              subAnswersDraft={subAnswersDraft}
              onAddSubQuestion={onAddSubQuestion}
              onRemoveSubQuestion={onRemoveSubQuestion}
              onUpdateSubQuestion={onUpdateSubQuestion}
              onUpdateSubAnswer={onUpdateSubAnswer}
            />
          )}

          <EditorActions
            saveBusy={saveBusy}
            isLoadingQuestion={isLoadingQuestion}
            showQuestionJson={showQuestionJson}
            showPayloadJson={showPayloadJson}
            onSave={onSave}
            onReload={onReload}
            onToggleQuestionJson={onToggleQuestionJson}
            onTogglePayloadJson={onTogglePayloadJson}
          />

          {showQuestionJson && <pre className="review-item">{JSON.stringify(loadedQuestion, null, 2)}</pre>}
          {showPayloadJson && <pre className="review-item">{JSON.stringify(savePayload, null, 2)}</pre>}
        </>
      )}
    </section>
  );
}

function QuestionMetadata({ selectedId, questionType, selectedSummary }) {
  return (
    <>
      <p>
        <strong>{uiText.admin.idLabel}</strong> {selectedId}
      </p>
      <p>
        <strong>{uiText.admin.typeLabel}</strong> {questionType || uiText.common.notAvailable}
      </p>
      <p>
        <strong>{uiText.admin.chapterLabel}</strong> {selectedSummary?.chapter ?? uiText.common.notAvailable}
      </p>
    </>
  );
}

function AssetMetadataEditor({
  imageRefsDraft,
  setImageRefsDraft,
  referencesDiagramDraft,
  setReferencesDiagramDraft
}) {
  return (
    <div className="practice-block">
      <h3>{uiText.admin.assetMetadataTitle}</h3>
      <label>
        {uiText.admin.imageRefsLabel}
        <textarea
          rows={4}
          value={imageRefsDraft}
          onChange={(e) => setImageRefsDraft(e.target.value)}
          placeholder={uiText.admin.imageRefsPlaceholder}
        />
      </label>
      <label className="practice-inline">
        <input
          type="checkbox"
          checked={referencesDiagramDraft}
          onChange={(e) => setReferencesDiagramDraft(e.target.checked)}
        />
        <span>{uiText.admin.referencesDiagramLabel}</span>
      </label>
    </div>
  );
}

function McqEditor({
  correctChoiceId,
  setCorrectChoiceId,
  choicesDraft,
  onAddChoice,
  onRemoveChoice,
  onUpdateChoice
}) {
  return (
    <div className="practice-block">
      <h3>{uiText.admin.mcqTitle}</h3>
      <label>
        {uiText.admin.correctChoiceIdLabel}
        <input
          value={correctChoiceId}
          onChange={(e) => setCorrectChoiceId(e.target.value)}
          placeholder={uiText.admin.correctChoiceIdPlaceholder}
        />
      </label>
      {choicesDraft.map((choice, index) => (
        <article key={`${choice.id}-${index}`} className="review-item">
          <div className="practice-actions">
            <label>
              {uiText.admin.choiceIdLabel}
              <input value={choice.id} onChange={(e) => onUpdateChoice(index, "id", e.target.value)} />
            </label>
            <label>
              {uiText.admin.choiceLabelLabel}
              <input value={choice.label} onChange={(e) => onUpdateChoice(index, "label", e.target.value)} />
            </label>
            <label>
              {uiText.admin.choiceImageRefLabel}
              <input value={choice.image_ref} onChange={(e) => onUpdateChoice(index, "image_ref", e.target.value)} />
            </label>
          </div>
          <label>
            {uiText.admin.choiceTextLabel}
            <textarea rows={3} value={choice.text} onChange={(e) => onUpdateChoice(index, "text", e.target.value)} />
          </label>
          <button type="button" onClick={() => onRemoveChoice(index)}>
            {uiText.admin.removeChoice}
          </button>
        </article>
      ))}
      <button type="button" onClick={onAddChoice}>
        {uiText.admin.addChoice}
      </button>
    </div>
  );
}

function OpenTextEditor({
  subQuestionsDraft,
  subAnswersDraft,
  onAddSubQuestion,
  onRemoveSubQuestion,
  onUpdateSubQuestion,
  onUpdateSubAnswer
}) {
  return (
    <div className="practice-block">
      <h3>{uiText.admin.subQuestionsTitle}</h3>
      {subQuestionsDraft.map((subQuestion, index) => (
        <article key={`${subQuestion.id}-${index}`} className="review-item">
          <div className="practice-actions">
            <label>
              {uiText.admin.subQuestionIdLabel}
              <input
                value={subQuestion.id}
                onChange={(e) => onUpdateSubQuestion(index, "id", e.target.value)}
              />
            </label>
            <label>
              {uiText.admin.subQuestionLabelLabel}
              <input
                value={subQuestion.label}
                onChange={(e) => onUpdateSubQuestion(index, "label", e.target.value)}
              />
            </label>
            <label>
              {uiText.admin.subQuestionOrderLabel}
              <input
                type="number"
                min={1}
                value={subQuestion.order}
                onChange={(e) => onUpdateSubQuestion(index, "order", e.target.value)}
              />
            </label>
          </div>
          <label>
            {uiText.admin.subQuestionTextLabel}
            <textarea
              rows={3}
              value={subQuestion.text}
              onChange={(e) => onUpdateSubQuestion(index, "text", e.target.value)}
            />
          </label>
          <label>
            {uiText.admin.subAnswerTextLabel}
            <textarea
              rows={3}
              value={subAnswersDraft[index]?.text ?? ""}
              onChange={(e) => onUpdateSubAnswer(index, e.target.value)}
            />
          </label>
          <button type="button" onClick={() => onRemoveSubQuestion(index)}>
            {uiText.admin.removeSubQuestion}
          </button>
        </article>
      ))}
      <button type="button" onClick={onAddSubQuestion}>
        {uiText.admin.addSubQuestion}
      </button>
    </div>
  );
}

function EditorActions({
  saveBusy,
  isLoadingQuestion,
  showQuestionJson,
  showPayloadJson,
  onSave,
  onReload,
  onToggleQuestionJson,
  onTogglePayloadJson
}) {
  return (
    <div className="practice-actions">
      <button type="button" onClick={onSave} disabled={saveBusy}>
        {saveBusy ? uiText.admin.saveChangesBusy : uiText.admin.saveChanges}
      </button>
      <button type="button" onClick={onReload} disabled={isLoadingQuestion}>
        {uiText.admin.reload}
      </button>
      <button type="button" onClick={onToggleQuestionJson}>
        {showQuestionJson ? uiText.admin.hideQuestionJson : uiText.admin.showQuestionJson}
      </button>
      <button type="button" onClick={onTogglePayloadJson}>
        {showPayloadJson ? uiText.admin.hidePayloadJson : uiText.admin.showPayloadJson}
      </button>
    </div>
  );
}

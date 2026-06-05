import { uiText } from "../../../src/content/strings.js";

export default function AdminSearchPanel({
  query,
  setQuery,
  page,
  pageSize,
  total,
  totalPages,
  isLoadingList,
  questions,
  selectedId,
  onSearch,
  onPageSizeChange,
  onPageChange,
  onSelectQuestion
}) {
  return (
    <section className="card practice-block">
      <h2>{uiText.admin.searchTitle}</h2>
      <div className="practice-actions">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={uiText.admin.searchPlaceholder}
        />
        <button type="button" onClick={() => onSearch(query, 1, pageSize)} disabled={isLoadingList}>
          {isLoadingList ? uiText.common.loading : uiText.admin.search}
        </button>
      </div>
      <div className="practice-actions">
        <label>
          {uiText.admin.pageSizeLabel}
          <select
            value={pageSize}
            onChange={(event) => {
              const nextSize = Number(event.target.value);
              onPageSizeChange(nextSize);
              onSearch(query, 1, nextSize);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </label>
        <span className="muted">{uiText.admin.pageCounter(page, totalPages, total)}</span>
        <button type="button" onClick={() => onPageChange(page - 1)} disabled={isLoadingList || page <= 1}>
          {uiText.admin.previous}
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={isLoadingList || page >= totalPages}
        >
          {uiText.admin.next}
        </button>
      </div>

      <div className="review-list">
        {questions.map((question) => (
          <article key={question.id} className="review-item admin-search-item">
            <button
              type="button"
              className={`navigator-dot admin-result-id ${
                selectedId === question.id ? "status-current" : "status-unanswered"
              }`}
              onClick={() => onSelectQuestion(question.id)}
            >
              {question.id}
            </button>
            <p className="muted admin-result-preview">{question.text_preview || uiText.common.notAvailable}</p>
          </article>
        ))}
        {!isLoadingList && questions.length === 0 && <p className="muted">{uiText.admin.emptyResults}</p>}
      </div>
    </section>
  );
}

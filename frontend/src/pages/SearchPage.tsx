import { useNavigate } from "react-router-dom";
import { useSearchData } from "../hooks/useSearchData";

export function SearchPage() {
  const navigate = useNavigate();
  const { query, results, isLoading, error, setQuery } = useSearchData();

  return (
    <div className="workspace-grid">
      <div className="view-stack">
        <section className="panel section-panel">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Search</p>
              <h3>Find plans, notes, years, and themes</h3>
            </div>
            <p className="section-copy">Search across event names, notes, categories, and years to jump directly to the right chapter.</p>
          </div>

          {error && <p className="error panel">{error}</p>}
          {isLoading && <p className="loading panel">Loading search...</p>}

          <label className="search-field">
            <span>Search your life map</span>
            <input value={query} placeholder="land, 2035, career..." onChange={(e) => setQuery(e.target.value)} />
          </label>

          <div className="plan-grid">
            {results.map((event) => (
              <article key={event.id} className="plan-card">
                <div className="timeline-meta-row">
                  <span className="pill subtle">{event.category}</span>
                  <span className="muted-text">{new Date(event.start_date).getFullYear()}</span>
                </div>
                <h4>{event.title}</h4>
                <p>{event.description || event.notes || "No searchable notes yet."}</p>
                <button type="button" className="ghost-link" onClick={() => navigate(`/plans/${event.id}`)}>Open result</button>
              </article>
            ))}
            {!query.trim() && <p>Start typing to search your plans.</p>}
            {query.trim() && results.length === 0 && <p>No matching plans found.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

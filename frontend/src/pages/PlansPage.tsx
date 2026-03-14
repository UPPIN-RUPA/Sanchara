import { useNavigate } from "react-router-dom";
import { usePlansData } from "../hooks/usePlansData";

type Props = {
  onDelete: (eventId: string) => Promise<void> | void;
};

export function PlansPage({ onDelete }: Props) {
  const navigate = useNavigate();
  const { events, query, status, category, categories, isLoading, error, setQuery, setStatus, setCategory } = usePlansData();

  return (
    <div className="workspace-grid">
      <div className="view-stack">
        <section className="panel section-panel">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Plans</p>
              <h3>All life plans and milestones</h3>
            </div>
            <p className="section-copy">A cleaner planning surface for everything you are intentionally shaping across years and life phases.</p>
          </div>

          {error && <p className="error panel">{error}</p>}
          {isLoading && <p className="loading panel">Loading plans...</p>}

          <div className="filters-bar panel quiet-panel">
            <label>
              <span>Search</span>
              <input value={query} placeholder="farm, career, 2035..." onChange={(e) => setQuery(e.target.value)} />
            </label>
            <label>
              <span>Status</span>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">all</option>
                <option value="planned">planned</option>
                <option value="in-progress">in-progress</option>
                <option value="completed">completed</option>
              </select>
            </label>
            <label>
              <span>Category</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">all</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="plan-grid">
            {events.map((event) => (
              <article key={event.id} className="plan-card">
                <div className="timeline-meta-row">
                  <span className="pill subtle">{event.category}</span>
                  <span className="muted-text">{event.status}</span>
                </div>
                <h4>{event.title}</h4>
                <p>{event.description || event.timeline_phase || "No description yet."}</p>
                <div className="manuscript-notes">
                  <small>{event.start_date}</small>
                  <small>{event.priority} priority</small>
                </div>
                <div className="plan-card-actions">
                  <button type="button" className="ghost-link" onClick={() => navigate(`/plans/${event.id}`)}>Open plan</button>
                  <button type="button" className="ghost-danger" onClick={() => void onDelete(event.id)}>Remove plan</button>
                </div>
              </article>
            ))}
            {events.length === 0 && <p>No plans yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

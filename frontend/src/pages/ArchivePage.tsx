import { useNavigate } from "react-router-dom";
import { useArchiveData } from "../hooks/useArchiveData";

export function ArchivePage() {
  const navigate = useNavigate();
  const { events, isLoading, error } = useArchiveData();

  return (
    <div className="workspace-grid">
      <div className="view-stack">
        <section className="panel section-panel">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Archive</p>
              <h3>Completed chapters</h3>
            </div>
            <p className="section-copy">
              A place for milestones that are finished, so the timeline stays clear while the memory of what was built remains accessible.
            </p>
          </div>

          {error && <p className="error panel">{error}</p>}
          {isLoading && <p className="loading panel">Loading archive...</p>}

          <div className="plan-grid">
            {events.map((event) => (
              <article key={event.id} className="plan-card archive-plan">
                <div className="timeline-meta-row">
                  <span className="pill subtle">{event.category}</span>
                  <span className="muted-text">completed</span>
                </div>
                <h4>{event.title}</h4>
                <p>{event.description || event.notes || "Completed milestone."}</p>
                <button type="button" className="ghost-link" onClick={() => navigate(`/plans/${event.id}`)}>
                  Open archive entry
                </button>
              </article>
            ))}
            {events.length === 0 && <p>No archived milestones yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

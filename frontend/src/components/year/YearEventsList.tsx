type YearEvent = {
  id: string;
  title: string;
  category: string;
  start_date: string;
  status: string;
  description?: string | null;
};

type Props = {
  events: YearEvent[];
  onOpenEvent: (eventId: string) => void;
};

export function YearEventsList({ events, onOpenEvent }: Props) {
  return (
    <section className="panel section-panel">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Events in this year</p>
          <h3>Planned chapters and milestones</h3>
        </div>
      </div>
      <div className="plan-grid">
        {events.map((event) => (
          <article key={event.id} className="plan-card">
            <div className="timeline-meta-row">
              <span className="pill subtle">{event.category}</span>
              <span className="muted-text">{event.status}</span>
            </div>
            <h4>{event.title}</h4>
            <p>{event.description || "No description yet."}</p>
            <button type="button" className="ghost-link" onClick={() => onOpenEvent(event.id)}>
              Open full details
            </button>
          </article>
        ))}
        {events.length === 0 && <p>No plans mapped to this year yet.</p>}
      </div>
    </section>
  );
}

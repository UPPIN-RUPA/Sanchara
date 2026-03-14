type MilestoneEvent = {
  id: string;
  title: string;
  category: string;
  start_date: string;
  progress?: number;
};

type Props = {
  events: MilestoneEvent[];
  onOpenEvent: (eventId: string) => void;
};

export function UpcomingMilestones({ events, onOpenEvent }: Props) {
  return (
    <article className="dashboard-card featured-card">
      <p className="section-kicker">Upcoming milestones</p>
      <h3>The next major steps on your life map</h3>
      <div className="milestone-feed">
        {events.map((event) => (
          <button key={event.id} type="button" className="milestone-row" onClick={() => onOpenEvent(event.id)}>
            <div>
              <strong>{event.title}</strong>
              <div className="timeline-meta-row">
                <span className="pill subtle">{event.category}</span>
                <span className="muted-text">{event.start_date}</span>
              </div>
            </div>
            <div className="dashboard-mini-progress">
              <div className="timeline-progress-rail">
                <div className="timeline-progress-fill" style={{ width: `${event.progress ?? 20}%` }} />
              </div>
              <small>{event.progress ?? 20}%</small>
            </div>
          </button>
        ))}
        {events.length === 0 && <p>No upcoming milestones yet.</p>}
      </div>
    </article>
  );
}

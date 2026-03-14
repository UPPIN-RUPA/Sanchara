type FocusEvent = {
  id: string;
  title: string;
  category: string;
  start_date: string;
};

type Props = {
  year: number;
  events: FocusEvent[];
  onOpenYear: () => void;
  onOpenEvent: (eventId: string) => void;
};

export function FocusThisYear({ year, events, onOpenYear, onOpenEvent }: Props) {
  return (
    <article className="dashboard-card">
      <p className="section-kicker">Focus this year</p>
      <h3>{year}</h3>
      <p className="section-copy">The goals and milestones closest to the present chapter of your journey.</p>
      <div className="stacked-links">
        {events.map((event) => (
          <button key={event.id} type="button" className="list-link" onClick={() => onOpenEvent(event.id)}>
            {event.title}
            <span>{event.category}</span>
          </button>
        ))}
        {events.length === 0 && <p>No plans tied to this year yet.</p>}
      </div>
      <button type="button" className="timeline-secondary-button dashboard-inline-action" onClick={onOpenYear}>
        View Year Page
      </button>
    </article>
  );
}

type TimelinePreviewEvent = {
  id: string;
  title: string;
  start_date: string;
};

type Props = {
  events: TimelinePreviewEvent[];
  onOpenEvent: (eventId: string) => void;
  onOpenTimeline: () => void;
};

export function TimelinePreview({ events, onOpenEvent, onOpenTimeline }: Props) {
  return (
    <article className="dashboard-card dashboard-card-wide">
      <p className="section-kicker">Timeline preview</p>
      <h3>The next few years at a glance</h3>
      <div className="timeline-preview-strip">
        {events.map((event) => (
          <button key={event.id} type="button" className="timeline-preview-card" onClick={() => onOpenEvent(event.id)}>
            <strong>{new Date(event.start_date).getFullYear()}</strong>
            <span>{event.title}</span>
          </button>
        ))}
        {events.length === 0 && <p>No upcoming preview yet.</p>}
      </div>
      <button type="button" className="timeline-secondary-button dashboard-inline-action" onClick={onOpenTimeline}>
        Open Full Timeline
      </button>
    </article>
  );
}

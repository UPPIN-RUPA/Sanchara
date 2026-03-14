import type { EventItem } from "../../lib/api";

type Props = {
  event: EventItem;
  progress: number;
  onEdit: () => void;
};

export function EventHeader({ event, progress, onEdit }: Props) {
  return (
    <section className="panel event-detail-hero">
      <div className="event-detail-hero-copy">
        <p className="section-kicker">Plan detail</p>
        <h1>{event.title}</h1>
        <p className="detail-subtitle">{event.category} · {event.status} · {event.start_date}{event.end_date ? ` - ${event.end_date}` : ""}</p>
        <p className="section-copy">{event.description || event.timeline_phase || "A meaningful life milestone held in your future map."}</p>
      </div>
      <div className="event-detail-hero-side">
        <div className="timeline-progress-rail">
          <div className="timeline-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <strong>{progress}% progress</strong>
        <button type="button" className="timeline-secondary-button" onClick={onEdit}>Edit plan</button>
      </div>
    </section>
  );
}

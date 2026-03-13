import type { EventItem } from "../lib/api";

type Props = {
  events: EventItem[];
  selectedEventId: string | null;
  onSelect: (eventId: string) => void;
  onDelete: (eventId: string) => void;
};

function groupByYear(items: EventItem[]): Array<[string, EventItem[]]> {
  const grouped = items.reduce<Record<string, EventItem[]>>((acc, event) => {
    const year = new Date(event.start_date).getFullYear().toString();
    acc[year] = acc[year] ?? [];
    acc[year].push(event);
    return acc;
  }, {});

  return Object.entries(grouped).sort(([a], [b]) => Number(a) - Number(b));
}

export function TimelineBoard({ events, selectedEventId, onSelect, onDelete }: Props) {
  const grouped = groupByYear(events);

  return (
    <section className="panel section-panel">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Timeline</p>
          <h3>Life map</h3>
        </div>
        <p className="section-copy">Select a milestone to open its workspace.</p>
      </div>

      {grouped.length === 0 && <p>No events found for the current filters.</p>}

      <div className="timeline-lane">
        {grouped.map(([year, yearEvents]) => (
          <section key={year} className="timeline-year">
            <div className="timeline-year-header">
              <span className="timeline-year-badge">{year}</span>
              <div className="timeline-year-line" />
            </div>
            <div className="timeline-cards">
              {yearEvents.map((event) => {
                const selected = selectedEventId === event.id;
                return (
                  <article key={event.id} className={selected ? "timeline-card selected" : "timeline-card"}>
                    <button type="button" className="timeline-card-button" onClick={() => onSelect(event.id)}>
                      <div className="timeline-meta-row">
                        <span className="pill">{event.category}</span>
                        <span className="muted-text">{event.status}</span>
                      </div>
                      <h4>{event.title}</h4>
                      <p>{event.description || event.timeline_phase || "No overview yet."}</p>
                      {event.is_financial && (
                        <div className="mini-progress">
                          <div className="progress-wrap compact">
                            <div className="progress-bar" style={{ width: `${event.savings_progress_pct ?? 0}%` }} />
                          </div>
                          <small>{event.savings_progress_pct ?? 0}% funded</small>
                        </div>
                      )}
                    </button>
                    <button type="button" className="ghost-danger" onClick={() => onDelete(event.id)}>
                      Delete
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

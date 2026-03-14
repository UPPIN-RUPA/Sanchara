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
    <section className="panel section-panel timeline-panel">
      <div className="section-heading timeline-heading">
        <div>
          <p className="section-kicker">Timeline</p>
          <h3>The manuscript of your years</h3>
        </div>
        <p className="section-copy">
          Read the future as chapters, not tickets. Each entry marks a life event, its preparation, and the memory it may one day leave behind.
        </p>
      </div>

      {grouped.length === 0 && <p>No events found for the current filters.</p>}

      <div className="manuscript-timeline">
        {grouped.map(([year, yearEvents]) => (
          <section key={year} className="manuscript-year">
            <div className="manuscript-margin">
              <span className="manuscript-year-label">{year}</span>
            </div>
            <div className="manuscript-column">
              {yearEvents.map((event) => {
                const selected = selectedEventId === event.id;
                return (
                  <article key={event.id} className={selected ? "manuscript-entry selected" : "manuscript-entry"}>
                    <button type="button" className="manuscript-entry-button" onClick={() => onSelect(event.id)}>
                      <div className="manuscript-dot" />
                      <div className="manuscript-copy">
                        <div className="timeline-meta-row">
                          <span className="pill subtle">{event.category}</span>
                          <span className="muted-text">{event.status}</span>
                        </div>
                        <h4>{event.title}</h4>
                        <p>{event.description || event.timeline_phase || "No overview yet."}</p>
                        <div className="manuscript-notes">
                          <small>{event.start_date}</small>
                          <small>{event.priority} priority</small>
                          {event.is_financial && <small>{event.savings_progress_pct ?? 0}% funded</small>}
                        </div>
                      </div>
                    </button>
                    <button type="button" className="ghost-danger" onClick={() => onDelete(event.id)}>
                      Remove
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

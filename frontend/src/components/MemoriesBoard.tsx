import type { EventItem, MemoryItem } from "../lib/api";

type Props = {
  events: EventItem[];
  memoriesByEvent: Record<string, MemoryItem[]>;
  onSelect: (eventId: string) => void;
};

export function MemoriesBoard({ events, memoriesByEvent, onSelect }: Props) {
  const rows = events
    .flatMap((event) => (memoriesByEvent[event.id] ?? []).map((memory) => ({ event, memory })))
    .sort((a, b) => (b.memory.captured_on ?? "").localeCompare(a.memory.captured_on ?? ""));

  return (
    <section className="panel section-panel memories-panel">
      <div className="section-heading timeline-heading">
        <div>
          <p className="section-kicker">Archive</p>
          <h3>Annotated diary fragments</h3>
        </div>
        <p className="section-copy">
          Little remnants of the life being planned: reflections, photos, documents, and small notes that make the future feel human.
        </p>
      </div>

      {rows.length === 0 && <p>No memories captured yet. Open an event and add one.</p>}

      <div className="diary-stack">
        {rows.map(({ event, memory }) => (
          <article key={memory.id} className="diary-fragment">
            <div className="diary-margin">
              <span>{memory.captured_on || event.start_date}</span>
            </div>
            <div className="diary-body">
              <div className="timeline-meta-row">
                <span className="pill subtle">{memory.memory_type}</span>
                <span className="muted-text">From {event.title}</span>
              </div>
              <h4>{memory.title}</h4>
              <p>{memory.description || "No description provided."}</p>
              <button type="button" className="ghost-link" onClick={() => onSelect(event.id)}>
                Return to this chapter
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

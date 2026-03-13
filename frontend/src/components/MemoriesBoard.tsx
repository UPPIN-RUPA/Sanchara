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
    <section className="panel section-panel">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Memories</p>
          <h3>Archive</h3>
        </div>
        <p className="section-copy">Reflections, photos, documents, and milestones across events.</p>
      </div>

      {rows.length === 0 && <p>No memories captured yet. Open an event and add one.</p>}

      <div className="board-grid">
        {rows.map(({ event, memory }) => (
          <article key={memory.id} className="board-card memory-card">
            <div className="timeline-meta-row">
              <span className="pill subtle">{memory.memory_type}</span>
              <span className="muted-text">{memory.captured_on || event.start_date}</span>
            </div>
            <h4>{memory.title}</h4>
            <p>{memory.description || "No description provided."}</p>
            <p className="muted-text">From {event.title}</p>
            <button type="button" className="ghost-link" onClick={() => onSelect(event.id)}>
              Open event workspace
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

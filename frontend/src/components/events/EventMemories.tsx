import type { MemoryItem } from "../../lib/api";

type Props = {
  memories: MemoryItem[];
};

export function EventMemories({ memories }: Props) {
  return (
    <section className="panel section-panel">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Memories</p>
          <h3>Moments attached to this plan</h3>
        </div>
      </div>
      <div className="plan-grid">
        {memories.map((memory) => (
          <article key={memory.id} className="plan-card archive-card">
            <div className="timeline-meta-row">
              <span className="pill subtle">{memory.memory_type}</span>
              <span className="muted-text">{memory.captured_on || "-"}</span>
            </div>
            <h4>{memory.title}</h4>
            <p>{memory.description || "No description yet."}</p>
          </article>
        ))}
        {memories.length === 0 && <p>No memories attached to this plan yet.</p>}
      </div>
    </section>
  );
}

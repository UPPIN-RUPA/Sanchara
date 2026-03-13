import type { EventItem, FinancialSummary } from "../lib/api";

type Props = {
  events: EventItem[];
  financial: FinancialSummary | null;
  onSelect: (eventId: string) => void;
};

export function SavingsBoard({ events, financial, onSelect }: Props) {
  const financialEvents = events.filter((event) => event.is_financial);

  return (
    <section className="panel section-panel">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Savings</p>
          <h3>Funding milestones</h3>
        </div>
      </div>

      <div className="stats-strip">
        <article className="stat-chip">
          <span>Target</span>
          <strong>₹{financial?.total_savings_target.toLocaleString() ?? "-"}</strong>
        </article>
        <article className="stat-chip">
          <span>Saved</span>
          <strong>₹{financial?.total_amount_saved.toLocaleString() ?? "-"}</strong>
        </article>
        <article className="stat-chip">
          <span>Fully funded</span>
          <strong>{financial?.fully_funded_events ?? 0}</strong>
        </article>
      </div>

      <div className="board-grid">
        {financialEvents.map((event) => (
          <article key={event.id} className="board-card">
            <div className="timeline-meta-row">
              <span className="pill">{event.category}</span>
              <span className="muted-text">{event.start_date}</span>
            </div>
            <h4>{event.title}</h4>
            <p>
              Target ₹{(event.savings_target ?? 0).toLocaleString()} · Saved ₹
              {(event.amount_saved ?? 0).toLocaleString()}
            </p>
            <div className="progress-wrap full">
              <div className="progress-bar" style={{ width: `${event.savings_progress_pct ?? 0}%` }} />
            </div>
            <div className="timeline-meta-row">
              <small>{event.savings_progress_pct ?? 0}% funded</small>
              <button type="button" className="ghost-link" onClick={() => onSelect(event.id)}>
                Open event
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

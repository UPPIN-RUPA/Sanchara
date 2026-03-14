import type { EventItem, FinancialSummary } from "../lib/api";

type Props = {
  events: EventItem[];
  financial: FinancialSummary | null;
  onSelect: (eventId: string) => void;
};

export function SavingsBoard({ events, financial, onSelect }: Props) {
  const financialEvents = events.filter((event) => event.is_financial);

  return (
    <section className="panel section-panel savings-panel">
      <div className="section-heading timeline-heading">
        <div>
          <p className="section-kicker">Provisions</p>
          <h3>The ledger of what you are setting aside</h3>
        </div>
        <p className="section-copy">Money as preparation, not just a metric. Every amount here is a future chapter being made gentler to arrive in.</p>
      </div>

      <div className="savings-hero-strip">
        <article className="stat-chip ledger-chip">
          <span>Total target</span>
          <strong>₹{financial?.total_savings_target.toLocaleString() ?? "-"}</strong>
        </article>
        <article className="stat-chip ledger-chip">
          <span>Saved so far</span>
          <strong>₹{financial?.total_amount_saved.toLocaleString() ?? "-"}</strong>
        </article>
        <article className="stat-chip ledger-chip">
          <span>Fully funded</span>
          <strong>{financial?.fully_funded_events ?? 0}</strong>
        </article>
      </div>

      <div className="funding-ledger">
        {financialEvents.length === 0 && <p>No financial chapters yet.</p>}
        {financialEvents.map((event) => (
          <article key={event.id} className="ledger-row">
            <div>
              <div className="timeline-meta-row">
                <span className="pill subtle">{event.category}</span>
                <span className="muted-text">{event.start_date}</span>
              </div>
              <h4>{event.title}</h4>
              <p>
                Target ₹{(event.savings_target ?? 0).toLocaleString()} · Saved ₹
                {(event.amount_saved ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="ledger-progress">
              <div className="progress-wrap full">
                <div className="progress-bar" style={{ width: `${event.savings_progress_pct ?? 0}%` }} />
              </div>
              <small>{event.savings_progress_pct ?? 0}% funded</small>
            </div>
            <button type="button" className="ghost-link" onClick={() => onSelect(event.id)}>
              Open event
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

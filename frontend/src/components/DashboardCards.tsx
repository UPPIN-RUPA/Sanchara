import type { FinancialSummary, OverviewSummary } from "../lib/api";

type Props = {
  overview: OverviewSummary | null;
  financial: FinancialSummary | null;
};

const CARD_CONFIG = [
  { label: "Total events", key: "total", tone: "sand" },
  { label: "Planned now", key: "planned", tone: "sea" },
  { label: "Savings target", key: "target", tone: "sky" },
  { label: "Amount saved", key: "saved", tone: "forest" },
] as const;

export function DashboardCards({ overview, financial }: Props) {
  const values = {
    total: overview?.total_events ?? "-",
    planned: overview?.by_status?.planned ?? 0,
    target: financial ? `₹${financial.total_savings_target.toLocaleString()}` : "-",
    saved: financial ? `₹${financial.total_amount_saved.toLocaleString()}` : "-",
  };

  return (
    <section className="cards">
      {CARD_CONFIG.map((card) => (
        <article key={card.key} className={`card stat-card tone-${card.tone}`}>
          <span className="stat-card-label">{card.label}</span>
          <p>{values[card.key]}</p>
        </article>
      ))}
    </section>
  );
}

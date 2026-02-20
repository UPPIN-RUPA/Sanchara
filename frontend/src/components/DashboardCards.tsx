import type { FinancialSummary, OverviewSummary } from "../lib/api";

type Props = {
  overview: OverviewSummary | null;
  financial: FinancialSummary | null;
};

export function DashboardCards({ overview, financial }: Props) {
  return (
    <section className="cards">
      <article className="card">
        <h3>Total events</h3>
        <p>{overview?.total_events ?? "-"}</p>
      </article>
      <article className="card">
        <h3>Planned events</h3>
        <p>{overview?.by_status?.planned ?? 0}</p>
      </article>
      <article className="card">
        <h3>Savings target</h3>
        <p>{financial ? `₹${financial.total_savings_target.toLocaleString()}` : "-"}</p>
      </article>
      <article className="card">
        <h3>Amount saved</h3>
        <p>{financial ? `₹${financial.total_amount_saved.toLocaleString()}` : "-"}</p>
      </article>
    </section>
  );
}

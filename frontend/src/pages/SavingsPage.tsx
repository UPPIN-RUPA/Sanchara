import { useNavigate } from "react-router-dom";
import { SavingsBoard } from "../components/SavingsBoard";
import { useSavingsData } from "../hooks/useSavingsData";

export function SavingsPage() {
  const navigate = useNavigate();
  const { events, financial, totals, isLoading, error } = useSavingsData();

  return (
    <div className="workspace-grid">
      <div className="view-stack">
        {error && <p className="error panel">{error}</p>}
        {isLoading && <p className="loading panel">Loading savings...</p>}

        <SavingsBoard
          events={events}
          financial={financial}
          onSelect={(eventId) => navigate(`/plans/${eventId}`)}
        />

        <section className="panel section-panel">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Funding summary</p>
              <h3>How prepared these plans are becoming</h3>
            </div>
            <p className="section-copy">
              A simple reading of readiness across the financial chapters currently on your map.
            </p>
          </div>
          <div className="settings-grid">
            <article className="detail-card">
              <h4>Remaining to fund</h4>
              <p>Still needed to fully prepare the current financial plans.</p>
              <strong>₹{totals.remainingAmount.toLocaleString()}</strong>
            </article>
            <article className="detail-card">
              <h4>Funded plans</h4>
              <p>Plans that have already reached their current target.</p>
              <strong>{totals.fundedPlans}</strong>
            </article>
            <article className="detail-card">
              <h4>Upcoming financial plans</h4>
              <p>Financial chapters expected in the next few years.</p>
              <strong>{totals.upcomingFinancialPlans}</strong>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}

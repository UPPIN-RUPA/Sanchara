type Props = {
  isFinancial: boolean;
  estimatedCost: string;
  savingsTarget: string;
  amountSaved: string;
  onChange: (patch: { isFinancial?: boolean; estimatedCost?: string; savingsTarget?: string; amountSaved?: string }) => void;
};

export function FinanceSection({ isFinancial, estimatedCost, savingsTarget, amountSaved, onChange }: Props) {
  return (
    <section className="event-section-card panel">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Savings and financial readiness</p>
          <h3>Track the money behind this goal, if relevant</h3>
        </div>
        <p className="section-copy">Optional, but important for plans that need savings and long-term preparation.</p>
      </div>
      <label className="toggle-row">
        <input type="checkbox" checked={isFinancial} onChange={(event) => onChange({ isFinancial: event.target.checked })} />
        <span>
          <strong>This plan needs financial preparation</strong>
          <small>Keep target and saved amount attached to the event instead of tracking it somewhere else.</small>
        </span>
      </label>
      {isFinancial && (
        <div className="form-grid compact-grid-two">
          <label className="form-field">
            <span>Estimated cost</span>
            <input type="number" step="0.01" placeholder="25000000" value={estimatedCost} onChange={(event) => onChange({ estimatedCost: event.target.value })} />
          </label>
          <label className="form-field">
            <span>Savings target</span>
            <input type="number" step="0.01" placeholder="22000000" value={savingsTarget} onChange={(event) => onChange({ savingsTarget: event.target.value })} />
          </label>
          <label className="form-field">
            <span>Amount already saved</span>
            <input type="number" step="0.01" placeholder="4000000" value={amountSaved} onChange={(event) => onChange({ amountSaved: event.target.value })} />
          </label>
        </div>
      )}
    </section>
  );
}

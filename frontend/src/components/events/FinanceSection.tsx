type Props = {
  isFinancial: boolean;
  savingsTarget: string;
  amountSaved: string;
  onChange: (patch: { isFinancial?: boolean; savingsTarget?: string; amountSaved?: string }) => void;
};

export function FinanceSection({ isFinancial, savingsTarget, amountSaved, onChange }: Props) {
  return (
    <section className="event-section-card panel">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Finance</p>
          <h3>Attach the money side of the dream</h3>
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
      <div className="form-grid compact-grid-two">
        <label className="form-field">
          <span>Budget target</span>
          <input type="number" step="0.01" placeholder="25000000" value={savingsTarget} onChange={(event) => onChange({ savingsTarget: event.target.value })} />
        </label>
        <label className="form-field">
          <span>Saved amount</span>
          <input type="number" step="0.01" placeholder="4000000" value={amountSaved} onChange={(event) => onChange({ amountSaved: event.target.value })} />
        </label>
      </div>
    </section>
  );
}

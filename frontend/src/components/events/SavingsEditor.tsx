import { useState, type FormEvent } from "react";

type Props = {
  isFinancial: boolean;
  savingsTarget: number;
  amountSaved: number;
  estimatedCost: number;
  progress: number;
  isSaving: boolean;
  onSave: (payload: { is_financial: boolean; estimated_cost?: number | null; savings_target?: number | null; amount_saved?: number | null }) => Promise<void>;
};

export function SavingsEditor({ isFinancial, savingsTarget, amountSaved, estimatedCost, progress, isSaving, onSave }: Props) {
  const [enabled, setEnabled] = useState(isFinancial);
  const [target, setTarget] = useState(savingsTarget ? String(savingsTarget) : "");
  const [saved, setSaved] = useState(amountSaved ? String(amountSaved) : "");
  const [cost, setCost] = useState(estimatedCost ? String(estimatedCost) : "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSave({
      is_financial: enabled,
      estimated_cost: enabled && cost ? Number(cost) : null,
      savings_target: enabled && target ? Number(target) : null,
      amount_saved: enabled && saved ? Number(saved) : null,
    });
  }

  return (
    <section className="panel section-panel">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Savings</p>
          <h3>Money behind the milestone</h3>
        </div>
      </div>
      <div className="detail-grid">
        <article className="detail-card">
          <h4>Target</h4>
          <p>₹{savingsTarget.toLocaleString()}</p>
        </article>
        <article className="detail-card">
          <h4>Saved</h4>
          <p>₹{amountSaved.toLocaleString()}</p>
        </article>
        <article className="detail-card">
          <h4>Estimated cost</h4>
          <p>₹{estimatedCost.toLocaleString()}</p>
        </article>
        <article className="detail-card detail-card-wide">
          <h4>Funding progress</h4>
          <div className="timeline-progress-rail">
            <div className="timeline-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p>{progress}% funded</p>
        </article>
      </div>
      <form className="detail-inline-form" onSubmit={handleSubmit}>
        <label className="toggle-row detail-toggle-row">
          <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
          <span>
            <strong>This plan includes financial preparation</strong>
            <small>Enable savings tracking if money is part of what makes this plan possible.</small>
          </span>
        </label>
        {enabled && (
          <>
            <label className="form-field">
              <span>Estimated cost</span>
              <input type="number" value={cost} onChange={(event) => setCost(event.target.value)} />
            </label>
            <label className="form-field">
              <span>Savings target</span>
              <input type="number" value={target} onChange={(event) => setTarget(event.target.value)} />
            </label>
            <label className="form-field">
              <span>Amount saved</span>
              <input type="number" value={saved} onChange={(event) => setSaved(event.target.value)} />
            </label>
          </>
        )}
        <button type="submit" disabled={isSaving}>Save Savings</button>
      </form>
    </section>
  );
}

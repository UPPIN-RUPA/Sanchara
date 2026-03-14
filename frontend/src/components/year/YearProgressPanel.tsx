type Props = {
  totalPlans: number;
  completed: number;
  inProgress: number;
  savingsTarget: number;
  memories: number;
};

export function YearProgressPanel({ totalPlans, completed, inProgress, savingsTarget, memories }: Props) {
  return (
    <section className="panel section-panel">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Progress</p>
          <h3>How the year is unfolding</h3>
        </div>
      </div>
      <div className="year-progress-grid">
        <article className="detail-card">
          <h4>Total plans</h4>
          <p>{totalPlans}</p>
        </article>
        <article className="detail-card">
          <h4>Completed</h4>
          <p>{completed}</p>
        </article>
        <article className="detail-card">
          <h4>In progress</h4>
          <p>{inProgress}</p>
        </article>
        <article className="detail-card">
          <h4>Yearly savings target</h4>
          <p>₹{savingsTarget.toLocaleString()}</p>
        </article>
        <article className="detail-card detail-card-wide">
          <h4>Memories captured</h4>
          <p>{memories}</p>
        </article>
      </div>
    </section>
  );
}

type Props = {
  onStart: () => void;
};

export function FooterCTA({ onStart }: Props) {
  return (
    <section className="landing-section">
      <div className="landing-cta panel">
        <p className="section-kicker">Begin</p>
        <h3>Start building your life map today</h3>
        <p className="section-copy">Design the milestones ahead, keep the years visible, and let your future feel intentional.</p>
        <button type="button" onClick={onStart}>Create Your Account</button>
      </div>
    </section>
  );
}

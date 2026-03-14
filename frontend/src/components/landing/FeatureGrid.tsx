const FEATURES = [
  ["Life Timeline", "Map major milestones across years and life phases."],
  ["Milestone Planning", "Shape the big goals that deserve long-term attention."],
  ["Savings Goals", "Track the money behind the dreams you are preparing for."],
  ["Memory Archive", "Preserve the emotional moments that define the journey."],
];

export function FeatureGrid() {
  return (
    <section className="landing-section">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Features</p>
          <h3>Built for long-term life planning</h3>
        </div>
      </div>
      <div className="landing-feature-grid">
        {FEATURES.map(([title, copy]) => (
          <article key={title} className="landing-feature-card panel">
            <div className="landing-feature-icon" />
            <h4>{title}</h4>
            <p>{copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

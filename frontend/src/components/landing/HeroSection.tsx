type Props = {
  onStart: () => void;
  onDemo: () => void;
};

export function HeroSection({ onStart, onDemo }: Props) {
  return (
    <section className="landing-hero">
      <div className="landing-hero-copy">
        <p className="hero-kicker">Life planning timeline</p>
        <h1>Design your future, one milestone at a time</h1>
        <p className="hero-copy">
          Sanchara helps you map your life plans, track your dreams, and preserve meaningful moments across the years.
        </p>
        <div className="landing-actions">
          <button type="button" onClick={onStart}>Start Your Journey</button>
          <button type="button" className="timeline-secondary-button" onClick={onDemo}>View Timeline Demo</button>
        </div>
      </div>
      <div className="landing-hero-visual panel">
        <div className="landing-mock-ruler">
          <span>2028</span>
          <span>2030</span>
          <span>2035</span>
          <span>2040</span>
        </div>
        <div className="landing-mock-cards">
          <article className="landing-float-card primary">
            <strong>Build House</strong>
            <span>Finance · Family</span>
          </article>
          <article className="landing-float-card secondary">
            <strong>First Land Visit</strong>
            <span>Memory</span>
          </article>
          <article className="landing-float-card tertiary">
            <strong>₹40L saved</strong>
            <span>Farm goal</span>
          </article>
        </div>
      </div>
    </section>
  );
}

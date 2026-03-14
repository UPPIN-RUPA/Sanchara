export function ProductPreviewSection() {
  return (
    <section className="landing-section landing-preview panel">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Preview</p>
          <h3>A future map, not a task board</h3>
        </div>
        <p className="section-copy">Timeline, plans, savings, and memories held together in one calm workspace.</p>
      </div>
      <div className="landing-preview-stack">
        <div className="landing-preview-screen">
          <div className="landing-mini-ruler">
            <span>2028</span>
            <span>2032</span>
            <span>2035</span>
            <span>2040</span>
          </div>
          <div className="landing-mini-lane"><span>Marriage Planning</span></div>
          <div className="landing-mini-lane offset"><span>Buy Land</span></div>
          <div className="landing-mini-lane wide"><span>Permaculture Farm</span></div>
        </div>
        <article className="landing-side-window">
          <strong>Event detail</strong>
          <p>Build Permaculture Farm</p>
          <small>2035 - 2040</small>
        </article>
        <article className="landing-side-window rose">
          <strong>Memory snapshot</strong>
          <p>First land visit</p>
          <small>July 2034</small>
        </article>
      </div>
    </section>
  );
}

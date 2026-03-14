type Props = {
  whyThisMatters: string;
  noteToFutureSelf: string;
  onChange: (patch: { whyThisMatters?: string; noteToFutureSelf?: string }) => void;
};

export function ReflectionSection({ whyThisMatters, noteToFutureSelf, onChange }: Props) {
  return (
    <section className="event-section-card panel reflection-card">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Reflection</p>
          <h3>Give the plan emotional context</h3>
        </div>
        <p className="section-copy">This is the part that makes Sanchara feel human instead of transactional.</p>
      </div>
      <div className="form-grid">
        <label className="form-field form-field-wide">
          <span>Why this matters</span>
          <textarea rows={4} value={whyThisMatters} placeholder="Why does this milestone deserve a place in your future map?" onChange={(event) => onChange({ whyThisMatters: event.target.value })} />
        </label>
        <label className="form-field form-field-wide">
          <span>Note to future self</span>
          <textarea rows={4} value={noteToFutureSelf} placeholder="What should your future self remember when this plan becomes difficult?" onChange={(event) => onChange({ noteToFutureSelf: event.target.value })} />
        </label>
      </div>
    </section>
  );
}

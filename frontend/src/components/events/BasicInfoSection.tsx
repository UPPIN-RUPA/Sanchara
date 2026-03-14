type Props = {
  title: string;
  category: string;
  description: string;
  onChange: (patch: { title?: string; category?: string; description?: string }) => void;
};

export function BasicInfoSection({ title, category, description, onChange }: Props) {
  return (
    <section className="event-section-card panel">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Basic identity</p>
          <h3>Name the life plan clearly</h3>
        </div>
        <p className="section-copy">This is the milestone, dream, or chapter you are intentionally placing on the map.</p>
      </div>
      <div className="form-grid">
        <label className="form-field form-field-wide">
          <span>Event title</span>
          <input value={title} placeholder="Build Permaculture Farm" onChange={(event) => onChange({ title: event.target.value })} />
        </label>
        <label className="form-field">
          <span>Category</span>
          <select value={category} onChange={(event) => onChange({ category: event.target.value })}>
            <option value="career">career</option>
            <option value="personal">personal</option>
            <option value="family">family</option>
            <option value="finance">finance</option>
            <option value="health">health</option>
            <option value="travel">travel</option>
            <option value="dreams">dreams</option>
          </select>
        </label>
        <label className="form-field form-field-wide">
          <span>Description</span>
          <textarea rows={4} value={description} placeholder="Describe the plan in a way your future self will still understand." onChange={(event) => onChange({ description: event.target.value })} />
        </label>
      </div>
    </section>
  );
}

type Props = {
  title: string;
  category: string;
  description: string;
  onChange: (patch: { title?: string; category?: string; description?: string }) => void;
};

const CATEGORIES = ["career", "personal", "family", "finance", "health", "travel", "dreams"] as const;

export function BasicInfoSection({ title, category, description, onChange }: Props) {
  return (
    <section className="event-section-card panel">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Basic information</p>
          <h3>Describe what this plan is</h3>
        </div>
        <p className="section-copy">This is the milestone, dream, or chapter you are intentionally placing on the map.</p>
      </div>
      <div className="form-grid">
        <label className="form-field form-field-wide">
          <span>Plan title</span>
          <input value={title} placeholder="e.g. Build Permaculture Farm" onChange={(event) => onChange({ title: event.target.value })} />
        </label>
        <div className="form-field form-field-wide">
          <span>Category</span>
          <div className="category-pill-grid" role="list" aria-label="Plan categories">
            {CATEGORIES.map((item) => (
              <button
                key={item}
                type="button"
                className={item === category ? "category-pill active" : "category-pill"}
                onClick={() => onChange({ category: item })}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <label className="form-field form-field-wide">
          <span>Short description</span>
          <textarea rows={4} value={description} placeholder="Describe this plan in a few lines..." onChange={(event) => onChange({ description: event.target.value })} />
        </label>
      </div>
    </section>
  );
}

type MilestoneDraft = {
  title: string;
  targetDate: string;
  note: string;
};

type Props = {
  milestones: MilestoneDraft[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, patch: Partial<MilestoneDraft>) => void;
};

export function MilestonesSection({ milestones, onAdd, onRemove, onChange }: Props) {
  return (
    <section className="event-section-card panel">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Milestones</p>
          <h3>Break the plan into meaningful steps</h3>
        </div>
        <button type="button" className="timeline-secondary-button" onClick={onAdd}>Add milestone</button>
      </div>
      <div className="event-milestone-stack">
        {milestones.map((milestone, index) => (
          <article key={`${milestone.title}-${index}`} className="event-milestone-draft">
            <div className="form-grid">
              <label className="form-field form-field-wide">
                <span>Milestone title</span>
                <input value={milestone.title} placeholder="Visit shortlisted villages" onChange={(event) => onChange(index, { title: event.target.value })} />
              </label>
              <label className="form-field">
                <span>Target date</span>
                <input type="date" value={milestone.targetDate} onChange={(event) => onChange(index, { targetDate: event.target.value })} />
              </label>
              <label className="form-field form-field-wide">
                <span>Note</span>
                <input value={milestone.note} placeholder="Why this step matters" onChange={(event) => onChange(index, { note: event.target.value })} />
              </label>
            </div>
            <button type="button" className="ghost-danger" onClick={() => onRemove(index)}>Remove</button>
          </article>
        ))}
        {milestones.length === 0 && <p className="helper-text">Milestones help turn a long-term dream into a journey you can actually follow.</p>}
      </div>
    </section>
  );
}

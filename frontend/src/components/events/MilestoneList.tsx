import type { TaskItem } from "../../lib/api";

type Props = {
  milestones: TaskItem[];
};

export function MilestoneList({ milestones }: Props) {
  const completed = milestones.filter((milestone) => milestone.status === "completed").length;

  return (
    <section className="panel section-panel">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Milestones</p>
          <h3>Steps inside the larger plan</h3>
        </div>
        <p className="section-copy">{completed}/{milestones.length} completed</p>
      </div>
      <ul className="task-list milestone-card-list">
        {milestones.map((milestone) => (
          <li key={milestone.id} className={`task-item milestone-card milestone-${milestone.status}`}>
            <div className="milestone-card-main">
              <div className="timeline-meta-row">
                <span className="pill subtle">{milestone.status}</span>
                <span className="muted-text">{milestone.due_date || "No target date"}</span>
              </div>
              <strong>{milestone.title}</strong>
              <small>{milestone.notes || "No note yet."}</small>
            </div>
          </li>
        ))}
        {milestones.length === 0 && <li className="empty-inline">Break this plan into meaningful steps. No milestones have been added yet.</li>}
      </ul>
    </section>
  );
}

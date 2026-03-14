import type { TaskItem } from "../../lib/api";

type Props = {
  milestones: TaskItem[];
};

export function MilestoneList({ milestones }: Props) {
  return (
    <section className="panel section-panel">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Milestones</p>
          <h3>Steps inside the larger plan</h3>
        </div>
      </div>
      <ul className="task-list">
        {milestones.map((milestone) => (
          <li key={milestone.id} className="task-item">
            <div className="task-check">
              <span>
                <strong>{milestone.title}</strong>
                <small>{milestone.status}{milestone.due_date ? ` · ${milestone.due_date}` : ""}</small>
                <small>{milestone.notes || "No note yet."}</small>
              </span>
            </div>
          </li>
        ))}
        {milestones.length === 0 && <li className="empty-inline">No milestones saved yet.</li>}
      </ul>
    </section>
  );
}

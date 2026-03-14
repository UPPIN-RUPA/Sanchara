import { useState, type FormEvent } from "react";
import type { TaskItem } from "../../lib/api";

type Props = {
  milestones: TaskItem[];
  isSaving: boolean;
  onCreate: (payload: { title: string; due_date?: string; notes?: string }) => Promise<void>;
  onUpdate: (taskId: string, payload: { title?: string; due_date?: string | null; notes?: string; status?: "pending" | "completed" }) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
};

type DraftState = Record<string, { title: string; dueDate: string; notes: string }>;

export function InlineMilestoneEditor({ milestones, isSaving, onCreate, onUpdate, onDelete }: Props) {
  const [drafts, setDrafts] = useState<DraftState>({});
  const [newMilestone, setNewMilestone] = useState({ title: "", dueDate: "", notes: "" });

  function getDraft(task: TaskItem) {
    return drafts[task.id] ?? {
      title: task.title,
      dueDate: task.due_date ?? "",
      notes: task.notes ?? "",
    };
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newMilestone.title.trim()) return;
    await onCreate({
      title: newMilestone.title.trim(),
      due_date: newMilestone.dueDate || undefined,
      notes: newMilestone.notes || undefined,
    });
    setNewMilestone({ title: "", dueDate: "", notes: "" });
  }

  return (
    <section className="panel section-panel">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Milestones</p>
          <h3>Steps inside the larger plan</h3>
        </div>
        <p className="section-copy">
          {milestones.filter((milestone) => milestone.status === "completed").length}/{milestones.length} completed
        </p>
      </div>

      <form className="detail-inline-form" onSubmit={handleCreate}>
        <label className="form-field form-field-wide">
          <span>Add milestone</span>
          <input
            value={newMilestone.title}
            placeholder="Add the next meaningful step"
            onChange={(event) => setNewMilestone((current) => ({ ...current, title: event.target.value }))}
          />
        </label>
        <label className="form-field">
          <span>Target date</span>
          <input
            type="date"
            value={newMilestone.dueDate}
            onChange={(event) => setNewMilestone((current) => ({ ...current, dueDate: event.target.value }))}
          />
        </label>
        <label className="form-field form-field-wide">
          <span>Note</span>
          <input
            value={newMilestone.notes}
            placeholder="Why this step matters"
            onChange={(event) => setNewMilestone((current) => ({ ...current, notes: event.target.value }))}
          />
        </label>
        <button type="submit" disabled={isSaving || !newMilestone.title.trim()}>Add Milestone</button>
      </form>

      <ul className="task-list milestone-card-list">
        {milestones.map((milestone) => {
          const draft = getDraft(milestone);
          return (
            <li key={milestone.id} className={`task-item milestone-card milestone-${milestone.status}`}>
              <div className="milestone-card-main">
                <div className="timeline-meta-row">
                  <span className="pill subtle">{milestone.status}</span>
                  <span className="muted-text">{milestone.due_date || "No target date"}</span>
                </div>
                <div className="detail-inline-grid">
                  <label className="form-field form-field-wide">
                    <span>Title</span>
                    <input
                      value={draft.title}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [milestone.id]: { ...draft, title: event.target.value },
                        }))
                      }
                    />
                  </label>
                  <label className="form-field">
                    <span>Target date</span>
                    <input
                      type="date"
                      value={draft.dueDate}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [milestone.id]: { ...draft, dueDate: event.target.value },
                        }))
                      }
                    />
                  </label>
                  <label className="form-field form-field-wide">
                    <span>Note</span>
                    <input
                      value={draft.notes}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [milestone.id]: { ...draft, notes: event.target.value },
                        }))
                      }
                    />
                  </label>
                </div>
                <div className="plan-card-actions">
                  <button
                    type="button"
                    className="timeline-secondary-button"
                    disabled={isSaving}
                    onClick={() =>
                      onUpdate(milestone.id, {
                        title: draft.title.trim(),
                        due_date: draft.dueDate || null,
                        notes: draft.notes || undefined,
                      })
                    }
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="timeline-secondary-button"
                    disabled={isSaving}
                    onClick={() =>
                      onUpdate(milestone.id, {
                        status: milestone.status === "completed" ? "pending" : "completed",
                      })
                    }
                  >
                    {milestone.status === "completed" ? "Mark Pending" : "Mark Complete"}
                  </button>
                  <button type="button" className="ghost-danger" disabled={isSaving} onClick={() => onDelete(milestone.id)}>
                    Delete
                  </button>
                </div>
              </div>
            </li>
          );
        })}
        {milestones.length === 0 && <li className="empty-inline">Break this plan into meaningful steps. No milestones have been added yet.</li>}
      </ul>
    </section>
  );
}

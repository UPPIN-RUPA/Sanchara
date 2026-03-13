import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
  type CreateTaskPayload,
  type EventItem,
  type TaskItem,
} from "../lib/api";

type EventTab = "overview" | "tasks" | "savings" | "notes";

type Props = {
  event: EventItem;
  userId: string;
  onClose: () => void;
};

function money(amount?: number | null): string {
  if (amount === undefined || amount === null) {
    return "-";
  }

  return `₹${amount.toLocaleString()}`;
}

function formatDateRange(startDate: string, endDate?: string | null): string {
  if (!endDate) {
    return startDate;
  }

  return `${startDate} to ${endDate}`;
}

export function EventDetailsPanel({ event, userId, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<EventTab>("overview");
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskNotes, setTaskNotes] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskPriority, setTaskPriority] = useState<"low" | "medium" | "high">("medium");
  const [taskError, setTaskError] = useState("");
  const [isTasksLoading, setIsTasksLoading] = useState(false);
  const [isTaskSubmitting, setIsTaskSubmitting] = useState(false);

  const savingsRemaining = useMemo(() => {
    const target = event.savings_target ?? 0;
    const saved = event.amount_saved ?? 0;
    return Math.max(0, target - saved);
  }, [event.amount_saved, event.savings_target]);

  const progress = event.savings_progress_pct ?? 0;
  const tabs: EventTab[] = ["overview", "tasks", "savings", "notes"];

  useEffect(() => {
    let cancelled = false;

    async function loadTasks() {
      try {
        setIsTasksLoading(true);
        setTaskError("");
        const response = await getTasks(userId, event.id);
        if (!cancelled) {
          setTasks(response.items);
        }
      } catch (err) {
        if (!cancelled) {
          setTaskError(err instanceof Error ? err.message : "Failed to load tasks");
        }
      } finally {
        if (!cancelled) {
          setIsTasksLoading(false);
        }
      }
    }

    void loadTasks();

    return () => {
      cancelled = true;
    };
  }, [event.id, userId]);

  async function handleTaskCreate(eventForm: FormEvent<HTMLFormElement>) {
    eventForm.preventDefault();

    if (!taskTitle.trim()) {
      setTaskError("Task title is required.");
      return;
    }

    const payload: CreateTaskPayload = {
      title: taskTitle.trim(),
      notes: taskNotes.trim() || undefined,
      due_date: taskDueDate || undefined,
      priority: taskPriority,
    };

    try {
      setIsTaskSubmitting(true);
      setTaskError("");
      const created = await createTask(userId, event.id, payload);
      setTasks((current) => [...current, created].sort((a, b) => a.status.localeCompare(b.status)));
      setTaskTitle("");
      setTaskNotes("");
      setTaskDueDate("");
      setTaskPriority("medium");
    } catch (err) {
      setTaskError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setIsTaskSubmitting(false);
    }
  }

  async function handleTaskStatusToggle(task: TaskItem) {
    try {
      setTaskError("");
      const updated = await updateTask(userId, event.id, task.id, {
        status: task.status === "completed" ? "pending" : "completed",
      });
      setTasks((current) =>
        current.map((item) => (item.id === task.id ? updated : item))
      );
    } catch (err) {
      setTaskError(err instanceof Error ? err.message : "Failed to update task");
    }
  }

  async function handleTaskDelete(taskId: string) {
    try {
      setTaskError("");
      await deleteTask(userId, event.id, taskId);
      setTasks((current) => current.filter((task) => task.id !== taskId));
    } catch (err) {
      setTaskError(err instanceof Error ? err.message : "Failed to delete task");
    }
  }

  return (
    <aside className="panel detail-panel">
      <div className="detail-header">
        <div>
          <p className="detail-kicker">Event details</p>
          <h3>{event.title}</h3>
          <p className="detail-subtitle">
            {event.category} · {event.status} · {event.priority}
          </p>
        </div>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="tab-row" role="tablist" aria-label="Event detail tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={tab === activeTab ? "tab-button tab-button-active" : "tab-button"}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="detail-grid">
          <article className="detail-card">
            <h4>Timeline</h4>
            <p>{formatDateRange(event.start_date, event.end_date)}</p>
          </article>
          <article className="detail-card">
            <h4>Phase</h4>
            <p>{event.timeline_phase || "Not set"}</p>
          </article>
          <article className="detail-card detail-card-wide">
            <h4>Description</h4>
            <p>{event.description || "No description yet."}</p>
          </article>
          <article className="detail-card detail-card-wide">
            <h4>Linked events</h4>
            <p>
              {event.linked_event_ids && event.linked_event_ids.length > 0
                ? event.linked_event_ids.join(", ")
                : "No linked events yet."}
            </p>
          </article>
        </div>
      )}

      {activeTab === "tasks" && (
        <div className="detail-stack">
          <form className="task-form" onSubmit={handleTaskCreate}>
            <h4>Add task</h4>
            {taskError && <p className="error">{taskError}</p>}
            <input
              value={taskTitle}
              placeholder="Task title"
              onChange={(eventValue) => setTaskTitle(eventValue.target.value)}
            />
            <input
              value={taskNotes}
              placeholder="Notes (optional)"
              onChange={(eventValue) => setTaskNotes(eventValue.target.value)}
            />
            <div className="row">
              <input
                type="date"
                value={taskDueDate}
                onChange={(eventValue) => setTaskDueDate(eventValue.target.value)}
              />
              <select
                value={taskPriority}
                onChange={(eventValue) =>
                  setTaskPriority(eventValue.target.value as "low" | "medium" | "high")
                }
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
            </div>
            <button type="submit" disabled={isTaskSubmitting}>
              {isTaskSubmitting ? "Adding..." : "Add task"}
            </button>
          </form>

          <section className="detail-card detail-card-wide">
            <h4>Tasks</h4>
            {isTasksLoading && <p className="loading">Loading tasks...</p>}
            {!isTasksLoading && tasks.length === 0 && <p>No tasks yet for this event.</p>}
            <ul className="task-list">
              {tasks.map((task) => (
                <li key={task.id} className="task-item">
                  <label className="task-check">
                    <input
                      type="checkbox"
                      checked={task.status === "completed"}
                      onChange={() => void handleTaskStatusToggle(task)}
                    />
                    <span>
                      <strong>{task.title}</strong>
                      <small>
                        {task.priority} priority{task.due_date ? ` · due ${task.due_date}` : ""}
                      </small>
                      <small>{task.notes || "No notes"}</small>
                    </span>
                  </label>
                  <button type="button" onClick={() => void handleTaskDelete(task.id)}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {activeTab === "savings" && (
        <div className="detail-grid">
          <article className="detail-card">
            <h4>Financial milestone</h4>
            <p>{event.is_financial ? "Yes" : "No"}</p>
          </article>
          <article className="detail-card">
            <h4>Savings target</h4>
            <p>{money(event.savings_target)}</p>
          </article>
          <article className="detail-card">
            <h4>Amount saved</h4>
            <p>{money(event.amount_saved)}</p>
          </article>
          <article className="detail-card">
            <h4>Remaining</h4>
            <p>{event.is_financial ? money(savingsRemaining) : "-"}</p>
          </article>
          <article className="detail-card detail-card-wide">
            <h4>Progress</h4>
            {event.is_financial ? (
              <>
                <div className="progress-wrap detail-progress-wrap">
                  <div className="progress-bar" style={{ width: `${progress}%` }} />
                </div>
                <p>{progress}% funded</p>
              </>
            ) : (
              <p>This event is not marked as financial.</p>
            )}
          </article>
          <article className="detail-card detail-card-wide">
            <h4>Cost tracking</h4>
            <p>
              Estimated: {money(event.estimated_cost)} · Actual: {money(event.actual_cost)}
            </p>
          </article>
        </div>
      )}

      {activeTab === "notes" && (
        <div className="detail-grid">
          <article className="detail-card detail-card-wide">
            <h4>Notes</h4>
            <p>{event.notes || "No notes captured yet."}</p>
          </article>
          <article className="detail-card detail-card-wide">
            <h4>Reflection prompts</h4>
            <p>
              What needs to happen next? What has already been completed? What should be
              remembered about this milestone?
            </p>
          </article>
        </div>
      )}
    </aside>
  );
}

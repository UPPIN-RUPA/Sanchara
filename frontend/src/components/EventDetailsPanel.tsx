import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  createMemory,
  createTask,
  deleteMemory,
  deleteTask,
  getMemories,
  getTasks,
  updateEvent,
  updateTask,
  type CreateMemoryPayload,
  type CreateTaskPayload,
  type EventItem,
  type MemoryItem,
  type TaskItem,
  type UpdateEventPayload,
} from "../lib/api";

type EventTab = "overview" | "tasks" | "savings" | "memories" | "notes";

type Props = {
  event: EventItem;
  userId: string;
  onClose: () => void;
  onEventUpdated: (event: EventItem) => void;
  initialTab?: EventTab;
};

function money(amount?: number | null): string {
  if (amount === undefined || amount === null) return "-";
  return `₹${amount.toLocaleString()}`;
}

function formatDateRange(startDate: string, endDate?: string | null): string {
  return endDate ? `${startDate} to ${endDate}` : startDate;
}

export function EventDetailsPanel({ event, userId, onClose, onEventUpdated, initialTab = "overview" }: Props) {
  const [activeTab, setActiveTab] = useState<EventTab>(initialTab);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [workspaceError, setWorkspaceError] = useState("");
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);
  const [isSavingEvent, setIsSavingEvent] = useState(false);

  const [overviewForm, setOverviewForm] = useState({
    title: event.title,
    category: event.category,
    start_date: event.start_date,
    end_date: event.end_date ?? "",
    timeline_phase: event.timeline_phase ?? "",
    description: event.description ?? "",
    status: event.status,
    priority: event.priority,
    estimated_cost: event.estimated_cost?.toString() ?? "",
    savings_target: event.savings_target?.toString() ?? "",
    amount_saved: event.amount_saved?.toString() ?? "",
    actual_cost: event.actual_cost?.toString() ?? "",
  });
  const [notesValue, setNotesValue] = useState(event.notes ?? "");
  const [taskForm, setTaskForm] = useState({ title: "", notes: "", due_date: "", priority: "medium" as "low" | "medium" | "high" });
  const [memoryForm, setMemoryForm] = useState({ title: "", description: "", captured_on: "", asset_url: "", memory_type: "reflection" as "reflection" | "photo" | "video" | "document" });

  useEffect(() => {
    setOverviewForm({
      title: event.title,
      category: event.category,
      start_date: event.start_date,
      end_date: event.end_date ?? "",
      timeline_phase: event.timeline_phase ?? "",
      description: event.description ?? "",
      status: event.status,
      priority: event.priority,
      estimated_cost: event.estimated_cost?.toString() ?? "",
      savings_target: event.savings_target?.toString() ?? "",
      amount_saved: event.amount_saved?.toString() ?? "",
      actual_cost: event.actual_cost?.toString() ?? "",
    });
    setNotesValue(event.notes ?? "");
  }, [event]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, event.id]);

  useEffect(() => {
    let cancelled = false;
    async function loadChildren() {
      try {
        setIsLoadingChildren(true);
        setWorkspaceError("");
        const [taskResponse, memoryResponse] = await Promise.all([
          getTasks(userId, event.id),
          getMemories(userId, event.id),
        ]);
        if (!cancelled) {
          setTasks(taskResponse.items);
          setMemories(memoryResponse.items);
        }
      } catch (err) {
        if (!cancelled) {
          setWorkspaceError(err instanceof Error ? err.message : "Failed to load event workspace");
        }
      } finally {
        if (!cancelled) setIsLoadingChildren(false);
      }
    }
    void loadChildren();
    return () => {
      cancelled = true;
    };
  }, [event.id, userId]);

  const savingsRemaining = useMemo(() => {
    const target = Number(overviewForm.savings_target || 0);
    const saved = Number(overviewForm.amount_saved || 0);
    return Math.max(0, target - saved);
  }, [overviewForm.amount_saved, overviewForm.savings_target]);

  async function saveEvent(payload: UpdateEventPayload) {
    try {
      setIsSavingEvent(true);
      setWorkspaceError("");
      const updated = await updateEvent(userId, event.id, payload);
      onEventUpdated(updated);
    } catch (err) {
      setWorkspaceError(err instanceof Error ? err.message : "Failed to update event");
    } finally {
      setIsSavingEvent(false);
    }
  }

  async function handleOverviewSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    await saveEvent({
      title: overviewForm.title.trim(),
      category: overviewForm.category.trim(),
      start_date: overviewForm.start_date,
      end_date: overviewForm.end_date || null,
      timeline_phase: overviewForm.timeline_phase || null,
      description: overviewForm.description || null,
      status: overviewForm.status,
      priority: overviewForm.priority,
      estimated_cost: overviewForm.estimated_cost ? Number(overviewForm.estimated_cost) : null,
      savings_target: overviewForm.savings_target ? Number(overviewForm.savings_target) : null,
      amount_saved: overviewForm.amount_saved ? Number(overviewForm.amount_saved) : null,
      actual_cost: overviewForm.actual_cost ? Number(overviewForm.actual_cost) : null,
    });
  }

  async function handleNotesSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    await saveEvent({ notes: notesValue || null });
  }

  async function handleTaskCreate(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (!taskForm.title.trim()) {
      setWorkspaceError("Task title is required.");
      return;
    }
    const payload: CreateTaskPayload = {
      title: taskForm.title.trim(),
      notes: taskForm.notes || undefined,
      due_date: taskForm.due_date || undefined,
      priority: taskForm.priority,
    };
    try {
      setWorkspaceError("");
      const created = await createTask(userId, event.id, payload);
      setTasks((current) => [created, ...current]);
      setTaskForm({ title: "", notes: "", due_date: "", priority: "medium" });
    } catch (err) {
      setWorkspaceError(err instanceof Error ? err.message : "Failed to create task");
    }
  }

  async function toggleTask(task: TaskItem) {
    try {
      const updated = await updateTask(userId, event.id, task.id, {
        status: task.status === "completed" ? "pending" : "completed",
      });
      setTasks((current) => current.map((item) => (item.id === task.id ? updated : item)));
    } catch (err) {
      setWorkspaceError(err instanceof Error ? err.message : "Failed to update task");
    }
  }

  async function removeTask(taskId: string) {
    try {
      await deleteTask(userId, event.id, taskId);
      setTasks((current) => current.filter((task) => task.id !== taskId));
    } catch (err) {
      setWorkspaceError(err instanceof Error ? err.message : "Failed to delete task");
    }
  }

  async function handleMemoryCreate(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (!memoryForm.title.trim()) {
      setWorkspaceError("Memory title is required.");
      return;
    }
    const payload: CreateMemoryPayload = {
      title: memoryForm.title.trim(),
      description: memoryForm.description || undefined,
      captured_on: memoryForm.captured_on || undefined,
      asset_url: memoryForm.asset_url || undefined,
      memory_type: memoryForm.memory_type,
    };
    try {
      const created = await createMemory(userId, event.id, payload);
      setMemories((current) => [created, ...current]);
      setMemoryForm({ title: "", description: "", captured_on: "", asset_url: "", memory_type: "reflection" });
    } catch (err) {
      setWorkspaceError(err instanceof Error ? err.message : "Failed to create memory");
    }
  }

  async function removeMemory(memoryId: string) {
    try {
      await deleteMemory(userId, event.id, memoryId);
      setMemories((current) => current.filter((memory) => memory.id !== memoryId));
    } catch (err) {
      setWorkspaceError(err instanceof Error ? err.message : "Failed to delete memory");
    }
  }

  const progress = event.savings_progress_pct ?? 0;
  const tabs: EventTab[] = ["overview", "tasks", "savings", "memories", "notes"];

  return (
    <aside className="panel detail-panel chapter-desk">
      <div className="detail-header">
        <div>
          <p className="detail-kicker">Chapter desk</p>
          <h3>{event.title}</h3>
          <p className="detail-subtitle">
            {event.category} · {event.status} · {event.priority}
          </p>
        </div>
        <button type="button" onClick={onClose}>Close</button>
      </div>

      <div className="desk-intro">
        <p>
          Keep this chapter together here: its outline, the work it requires, the provisions it needs, and the fragments of memory it may gather.
        </p>
      </div>

      <div className="tab-row" role="tablist" aria-label="Event detail tabs">
        {tabs.map((tab) => (
          <button key={tab} type="button" className={tab === activeTab ? "tab-button tab-button-active" : "tab-button"} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {workspaceError && <p className="error workspace-error">{workspaceError}</p>}
      {isLoadingChildren && <p className="loading">Loading event workspace...</p>}

      {activeTab === "overview" && (
        <form className="detail-stack manuscript-editor" onSubmit={handleOverviewSubmit}>
          <div className="detail-note">
            Describe the event as if you are leaving context for your future self, not filling a database row.
          </div>
          <div className="detail-grid">
            <label className="field-card"><span>Title</span><input value={overviewForm.title} onChange={(e) => setOverviewForm((c) => ({ ...c, title: e.target.value }))} /></label>
            <label className="field-card"><span>Category</span><input value={overviewForm.category} onChange={(e) => setOverviewForm((c) => ({ ...c, category: e.target.value }))} /></label>
            <label className="field-card"><span>Start date</span><input type="date" value={overviewForm.start_date} onChange={(e) => setOverviewForm((c) => ({ ...c, start_date: e.target.value }))} /></label>
            <label className="field-card"><span>End date</span><input type="date" value={overviewForm.end_date} onChange={(e) => setOverviewForm((c) => ({ ...c, end_date: e.target.value }))} /></label>
            <label className="field-card"><span>Status</span><select value={overviewForm.status} onChange={(e) => setOverviewForm((c) => ({ ...c, status: e.target.value as EventItem["status"] }))}><option value="planned">planned</option><option value="in-progress">in-progress</option><option value="completed">completed</option></select></label>
            <label className="field-card"><span>Priority</span><select value={overviewForm.priority} onChange={(e) => setOverviewForm((c) => ({ ...c, priority: e.target.value as EventItem["priority"] }))}><option value="low">low</option><option value="medium">medium</option><option value="high">high</option><option value="critical">critical</option></select></label>
            <label className="field-card detail-card-wide"><span>Timeline phase</span><input value={overviewForm.timeline_phase} onChange={(e) => setOverviewForm((c) => ({ ...c, timeline_phase: e.target.value }))} /></label>
            <label className="field-card detail-card-wide"><span>Description</span><textarea rows={4} value={overviewForm.description} onChange={(e) => setOverviewForm((c) => ({ ...c, description: e.target.value }))} /></label>
          </div>
          <button type="submit" disabled={isSavingEvent}>{isSavingEvent ? "Saving..." : "Preserve overview"}</button>
        </form>
      )}

      {activeTab === "tasks" && (
        <div className="detail-stack">
          <form className="task-form manuscript-editor" onSubmit={handleTaskCreate}>
            <h4>Working notes</h4>
            <p className="helper-text">Small practical steps that make this chapter more likely to happen well.</p>
            <input value={taskForm.title} placeholder="Task title" onChange={(e) => setTaskForm((c) => ({ ...c, title: e.target.value }))} />
            <input value={taskForm.notes} placeholder="Notes" onChange={(e) => setTaskForm((c) => ({ ...c, notes: e.target.value }))} />
            <div className="row">
              <input type="date" value={taskForm.due_date} onChange={(e) => setTaskForm((c) => ({ ...c, due_date: e.target.value }))} />
              <select value={taskForm.priority} onChange={(e) => setTaskForm((c) => ({ ...c, priority: e.target.value as "low" | "medium" | "high" }))}><option value="low">low</option><option value="medium">medium</option><option value="high">high</option></select>
            </div>
            <button type="submit">Add working note</button>
          </form>
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task.id} className="task-item">
                <label className="task-check"><input type="checkbox" checked={task.status === "completed"} onChange={() => void toggleTask(task)} /><span><strong>{task.title}</strong><small>{task.priority} priority{task.due_date ? ` · due ${task.due_date}` : ""}</small><small>{task.notes || "No notes"}</small></span></label>
                <button type="button" onClick={() => void removeTask(task.id)}>Delete</button>
              </li>
            ))}
            {tasks.length === 0 && <li className="empty-inline">No working notes yet.</li>}
          </ul>
        </div>
      )}

      {activeTab === "savings" && (
        <div className="detail-grid">
          <article className="detail-card detail-card-wide ledger-note">
            <h4>Provision ledger</h4>
            <p>Money here is not abstract. It is the quiet preparation that lets this event arrive without strain.</p>
          </article>
          <article className="detail-card"><h4>Timeline</h4><p>{formatDateRange(event.start_date, event.end_date)}</p></article>
          <article className="detail-card"><h4>Savings target</h4><p>{money(event.savings_target)}</p></article>
          <article className="detail-card"><h4>Saved</h4><p>{money(event.amount_saved)}</p></article>
          <article className="detail-card"><h4>Remaining</h4><p>{money(savingsRemaining)}</p></article>
          <article className="detail-card detail-card-wide"><h4>Funding progress</h4><div className="progress-wrap detail-progress-wrap"><div className="progress-bar" style={{ width: `${progress}%` }} /></div><p>{progress}% funded</p></article>
          <article className="detail-card detail-card-wide"><h4>Cost tracking</h4><p>Estimated: {money(event.estimated_cost)} · Actual: {money(event.actual_cost)}</p></article>
        </div>
      )}

      {activeTab === "memories" && (
        <div className="detail-stack">
          <form className="task-form manuscript-editor" onSubmit={handleMemoryCreate}>
            <h4>Archive fragment</h4>
            <p className="helper-text">Capture the note, image, document, or reflection that gives this chapter emotional texture.</p>
            <input value={memoryForm.title} placeholder="Memory title" onChange={(e) => setMemoryForm((c) => ({ ...c, title: e.target.value }))} />
            <input value={memoryForm.description} placeholder="Description" onChange={(e) => setMemoryForm((c) => ({ ...c, description: e.target.value }))} />
            <div className="row">
              <input type="date" value={memoryForm.captured_on} onChange={(e) => setMemoryForm((c) => ({ ...c, captured_on: e.target.value }))} />
              <select value={memoryForm.memory_type} onChange={(e) => setMemoryForm((c) => ({ ...c, memory_type: e.target.value as NonNullable<CreateMemoryPayload["memory_type"]> }))}><option value="reflection">reflection</option><option value="photo">photo</option><option value="video">video</option><option value="document">document</option></select>
            </div>
            <input value={memoryForm.asset_url} placeholder="Asset URL (optional)" onChange={(e) => setMemoryForm((c) => ({ ...c, asset_url: e.target.value }))} />
            <button type="submit">Add fragment</button>
          </form>
          <div className="board-grid compact-grid">
            {memories.map((memory) => (
              <article key={memory.id} className="board-card memory-card archive-card">
                <div className="timeline-meta-row"><span className="pill subtle">{memory.memory_type}</span><span className="muted-text">{memory.captured_on || event.start_date}</span></div>
                <h4>{memory.title}</h4>
                <p>{memory.description || "No description"}</p>
                {memory.asset_url && <a href={memory.asset_url} target="_blank" rel="noreferrer">Open asset</a>}
                <button type="button" className="ghost-danger" onClick={() => void removeMemory(memory.id)}>Delete</button>
              </article>
            ))}
            {memories.length === 0 && <p className="empty-inline">No archive fragments yet.</p>}
          </div>
        </div>
      )}

      {activeTab === "notes" && (
        <form className="detail-stack manuscript-editor" onSubmit={handleNotesSubmit}>
          <div className="detail-note">
            Use this space like a margin in a book: what you felt, what changed, what should not be forgotten.
          </div>
          <label className="field-card detail-card-wide"><span>Reflections and notes</span><textarea rows={10} value={notesValue} onChange={(e) => setNotesValue(e.target.value)} /></label>
          <button type="submit" disabled={isSavingEvent}>{isSavingEvent ? "Saving..." : "Preserve notes"}</button>
        </form>
      )}
    </aside>
  );
}

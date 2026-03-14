import type { EventItem } from "../../lib/api";

type Props = {
  event: EventItem;
  progress: number;
  milestoneCount: number;
  completedMilestoneCount: number;
  memoryCount: number;
  onEdit: () => void;
  onBack: () => void;
  onOpenMilestones: () => void;
  onOpenMemories: () => void;
};

function formatDate(input: string | null | undefined): string {
  if (!input) return "Open-ended";
  return new Date(`${input}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(value: number | null | undefined): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

export function EventHeader({
  event,
  progress,
  milestoneCount,
  completedMilestoneCount,
  memoryCount,
  onEdit,
  onBack,
  onOpenMilestones,
  onOpenMemories,
}: Props) {
  return (
    <section className="panel event-detail-hero">
      <div className="event-detail-hero-copy">
        <div className="event-detail-badges">
          <span className="pill subtle">{event.category}</span>
          <span className="pill subtle">{event.status}</span>
          {event.is_financial && <span className="pill subtle">financial</span>}
        </div>
        <h1>{event.title}</h1>
        <p className="detail-subtitle">
          {formatDate(event.start_date)} to {formatDate(event.end_date)} {event.timeline_phase ? `· ${event.timeline_phase}` : ""}
        </p>
        <p className="section-copy">
          {event.description || event.notes || "A meaningful life milestone held in your future map."}
        </p>
        <div className="event-hero-stat-strip">
          <article className="event-hero-stat">
            <span>Progress</span>
            <strong>{progress}% complete</strong>
          </article>
          <article className="event-hero-stat">
            <span>Milestones</span>
            <strong>
              {completedMilestoneCount}/{milestoneCount}
            </strong>
          </article>
          <article className="event-hero-stat">
            <span>Savings</span>
            <strong>{formatCurrency(event.amount_saved)} saved</strong>
          </article>
          <article className="event-hero-stat">
            <span>Memories</span>
            <strong>{memoryCount} captured</strong>
          </article>
        </div>
      </div>
      <div className="event-detail-hero-side">
        <p className="section-kicker">Plan status</p>
        <div className="timeline-progress-rail">
          <div className="timeline-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <strong>{progress}% progress</strong>
        <small className="helper-text">
          Keep this chapter active by revisiting milestones, reflection notes, and financial readiness together.
        </small>
        <div className="event-hero-actions">
          <button type="button" className="timeline-secondary-button" onClick={onEdit}>Edit plan</button>
          <button type="button" className="timeline-secondary-button" onClick={onOpenMilestones}>Milestones</button>
          <button type="button" className="timeline-secondary-button" onClick={onOpenMemories}>Memories</button>
          <button type="button" className="timeline-secondary-button" onClick={onBack}>Back to timeline</button>
        </div>
      </div>
    </section>
  );
}

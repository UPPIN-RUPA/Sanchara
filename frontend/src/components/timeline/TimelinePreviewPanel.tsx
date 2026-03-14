import type { EventItem, MemoryItem } from "../../lib/api";
import { labelCase } from "./types";

type Props = {
  selectedEvent: EventItem | null;
  selectedCategoryColor: string;
  nextMilestoneTitle?: string;
  memoryCount: number;
  progress: number;
  onOpenFullDetails: (tab?: "overview" | "milestones" | "savings" | "memories" | "updates") => void;
};

export function TimelinePreviewPanel({
  selectedEvent,
  selectedCategoryColor,
  nextMilestoneTitle,
  memoryCount,
  progress,
  onOpenFullDetails,
}: Props) {
  return (
    <aside className="timeline-preview panel">
      {!selectedEvent ? (
        <div className="timeline-preview-empty">
          <div className="preview-orbit" aria-hidden="true" />
          <blockquote>
            "A life becomes clearer when its future is placed where the eyes can return to it."
          </blockquote>
          <p>Select a plan to view details.</p>
        </div>
      ) : (
        <div className="timeline-preview-stack">
          <span className="preview-category" style={{ backgroundColor: `${selectedCategoryColor}20`, color: selectedCategoryColor }}>
            {labelCase(selectedEvent.category)}
          </span>
          <h3>{selectedEvent.title}</h3>
          <p className="detail-subtitle">{labelCase(selectedEvent.status)} · {selectedEvent.start_date}{selectedEvent.end_date ? ` - ${selectedEvent.end_date}` : ""}</p>
          <p className="section-copy">{selectedEvent.description || selectedEvent.timeline_phase || "No description yet."}</p>
          <div className="timeline-preview-progress">
            <div className="timeline-progress-rail">
              <div className="timeline-progress-fill" style={{ width: `${progress}%`, backgroundColor: selectedCategoryColor }} />
            </div>
            <small>{progress}% overall progress</small>
          </div>
          <div className="preview-info-grid">
            <article>
              <span>Next milestone</span>
              <strong>{nextMilestoneTitle ?? "Define the next step"}</strong>
            </article>
            <article>
              <span>Memory fragments</span>
              <strong>{memoryCount}</strong>
            </article>
          </div>
          <div className="preview-actions">
            <button type="button" onClick={() => onOpenFullDetails("overview")}>View Full Details</button>
            <button type="button" className="timeline-secondary-button" onClick={() => onOpenFullDetails("overview")}>Edit</button>
            <button type="button" className="timeline-secondary-button" onClick={() => onOpenFullDetails("updates")}>Add Update</button>
            <button type="button" className="timeline-secondary-button" onClick={() => onOpenFullDetails("memories")}>Add Memory</button>
          </div>
        </div>
      )}
    </aside>
  );
}

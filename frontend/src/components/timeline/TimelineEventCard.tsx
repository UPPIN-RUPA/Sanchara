import type { CSSProperties } from "react";
import type { EventItem } from "../../lib/api";
import { labelCase } from "./types";

type Props = {
  event: EventItem;
  left: number;
  top: number;
  width: number;
  color: string;
  selected: boolean;
  progress: number;
  onSelect: () => void;
};

export function TimelineEventCard({ event, left, top, width, color, selected, progress, onSelect }: Props) {
  const style = { left, top, width, ["--event-color" as string]: color } as CSSProperties;

  return (
    <button type="button" className={selected ? "timeline-event-card selected" : "timeline-event-card"} style={style} onClick={onSelect}>
      <div className="timeline-event-top">
        <span className="timeline-event-icon">{event.is_financial ? "₹" : event.category.toLowerCase() === "travel" ? "✦" : "◌"}</span>
        <span className="timeline-event-title">{event.title}</span>
      </div>
      <div className="timeline-event-meta">
        <span className="pill subtle">{labelCase(event.category)}</span>
        <span>{event.start_date}{event.end_date ? ` - ${event.end_date}` : ""}</span>
      </div>
      <div className="timeline-event-progress">
        <div className="timeline-progress-rail">
          <div className="timeline-progress-fill" style={{ width: `${progress}%`, backgroundColor: color }} />
        </div>
        <small>Progress {progress}%</small>
      </div>
    </button>
  );
}

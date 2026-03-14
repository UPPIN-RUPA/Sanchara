import type { EventItem } from "../../lib/api";
import { TimelineEventCard } from "./TimelineEventCard";
import { TimelineMilestoneNode } from "./TimelineMilestoneNode";
import type { TimelineItem } from "./types";

type Props = {
  item: TimelineItem;
  yearStart: number;
  yearWidth: number;
  laneHeight: number;
  selectedEvent: EventItem | null;
  color: string;
  progress: number;
  onSelect: (eventId: string) => void;
};

export function TimelineLane({ item, yearStart, yearWidth, laneHeight, selectedEvent, color, progress, onSelect }: Props) {
  const left = (item.startYearFraction - yearStart) * yearWidth;
  const top = item.lane * laneHeight + 90;
  const selected = selectedEvent?.id === item.event.id;

  if (item.type === "milestone") {
    return (
      <TimelineMilestoneNode
        title={item.event.title}
        left={left}
        top={top}
        color={color}
        selected={selected}
        onSelect={() => onSelect(item.event.id)}
      />
    );
  }

  const width = Math.max(180, (item.endYearFraction - item.startYearFraction) * yearWidth);

  return (
    <TimelineEventCard
      event={item.event}
      left={left}
      top={top}
      width={width}
      color={color}
      selected={selected}
      progress={progress}
      onSelect={() => onSelect(item.event.id)}
    />
  );
}

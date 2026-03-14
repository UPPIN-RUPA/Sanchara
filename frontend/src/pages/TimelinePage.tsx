import type { EventItem, MemoryItem } from "../lib/api";
import { TimelineWorkspace } from "../components/TimelineWorkspace";

type DetailTab = "overview" | "tasks" | "savings" | "memories" | "notes";

type Props = {
  events: EventItem[];
  memoriesByEvent: Record<string, MemoryItem[]>;
  selectedEvent: EventItem | null;
  onSelect: (eventId: string) => void;
  onAddPlan: () => void;
  onOpenFullDetails: (tab?: DetailTab) => void;
  onOpenYear?: (year: number) => void;
};

export function TimelinePage({
  events,
  memoriesByEvent,
  selectedEvent,
  onSelect,
  onAddPlan,
  onOpenFullDetails,
  onOpenYear,
}: Props) {
  return (
    <TimelineWorkspace
      events={events}
      memoriesByEvent={memoriesByEvent}
      selectedEvent={selectedEvent}
      onSelect={onSelect}
      onAddPlan={onAddPlan}
      onOpenFullDetails={onOpenFullDetails}
      onOpenYear={onOpenYear}
    />
  );
}

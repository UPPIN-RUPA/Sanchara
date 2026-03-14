import { useEffect, useMemo, useRef, useState } from "react";
import type { MemoryItem, EventItem } from "../lib/api";
import { TimelineCanvas } from "./timeline/TimelineCanvas";
import { TimelineFilters } from "./timeline/TimelineFilters";
import { TimelinePreviewPanel } from "./timeline/TimelinePreviewPanel";
import { TimelineZoomBar } from "./timeline/TimelineZoomBar";
import {
  CATEGORY_COLORS,
  labelCase,
  type TimeFocus,
  type TimelineItem,
  type TimelineMemoryMarker,
  type TimelineViewMode,
} from "./timeline/types";

type Props = {
  events: EventItem[];
  memoriesByEvent: Record<string, MemoryItem[]>;
  selectedEvent: EventItem | null;
  onSelect: (eventId: string) => void;
  onAddPlan: () => void;
  onOpenFullDetails: (tab?: "overview" | "tasks" | "savings" | "memories" | "notes") => void;
  onOpenYear?: (year: number) => void;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function dateToYearFraction(input: Date): number {
  const year = input.getFullYear();
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);
  const progress = (input.getTime() - start.getTime()) / (end.getTime() - start.getTime());
  return year + progress;
}

function toRange(event: EventItem): { start: Date; end: Date } {
  const start = new Date(event.start_date);
  const fallbackEnd = new Date(start);
  fallbackEnd.setMonth(fallbackEnd.getMonth() + (event.is_financial ? 10 : 4));
  const rawEnd = event.end_date ? new Date(event.end_date) : fallbackEnd;
  const end = rawEnd >= start ? rawEnd : start;
  return { start, end };
}

function assignLanes(items: EventItem[]): TimelineItem[] {
  const laneEnds: number[] = [];

  return [...items]
    .sort((a, b) => a.start_date.localeCompare(b.start_date))
    .map((event) => {
      const { start, end } = toRange(event);
      const startFraction = dateToYearFraction(start);
      const endFraction = dateToYearFraction(end);
      const isMilestone = Math.abs(endFraction - startFraction) < 0.08;

      let lane = laneEnds.findIndex((lastEnd) => startFraction > lastEnd + 0.08);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(endFraction);
      } else {
        laneEnds[lane] = endFraction;
      }

      return {
        event,
        lane,
        startYearFraction: startFraction,
        endYearFraction: isMilestone ? startFraction + 0.06 : endFraction,
        type: isMilestone ? "milestone" : "duration",
      };
    });
}

function progressForEvent(event: EventItem): number {
  if (event.is_financial) return clamp(event.savings_progress_pct ?? 0, 0, 100);
  if (event.status === "completed") return 100;
  if (event.status === "in-progress") return 56;
  return 18;
}

export function TimelineWorkspace({
  events,
  memoriesByEvent,
  selectedEvent,
  onSelect,
  onAddPlan,
  onOpenFullDetails,
  onOpenYear,
}: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const currentYear = new Date().getFullYear();
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<TimelineViewMode>("year");
  const [zoom, setZoom] = useState(2);
  const [timeFocus, setTimeFocus] = useState<TimeFocus>("10");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPhases, setSelectedPhases] = useState<string[]>([]);
  const [jumpYear, setJumpYear] = useState<string>("");

  const availablePhases = useMemo(
    () =>
      Array.from(
        new Set(events.map((event) => event.timeline_phase).filter((value): value is string => Boolean(value && value.trim())))
      ),
    [events]
  );

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesQuery =
        !query.trim() ||
        [event.title, event.category, event.description ?? "", event.timeline_phase ?? "", event.notes ?? "", event.start_date]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase());

      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(event.category.toLowerCase());
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(event.status);
      const matchesPhase = selectedPhases.length === 0 || selectedPhases.includes(event.timeline_phase ?? "");

      if (!matchesQuery || !matchesCategory || !matchesStatus || !matchesPhase) return false;

      if (timeFocus === "lifetime") return true;
      const span = Number(timeFocus);
      const eventYear = new Date(event.start_date).getFullYear();
      return eventYear >= currentYear && eventYear <= currentYear + span;
    });
  }, [currentYear, events, query, selectedCategories, selectedPhases, selectedStatuses, timeFocus]);

  const timelineItems = useMemo(() => assignLanes(filteredEvents), [filteredEvents]);

  const yearBounds = useMemo(() => {
    const years = filteredEvents.map((event) => new Date(event.start_date).getFullYear());
    const minYear = years.length ? Math.min(...years, currentYear - 1) : currentYear;
    const maxYear = years.length ? Math.max(...years, currentYear + 6) : currentYear + 6;
    return { minYear, maxYear };
  }, [currentYear, filteredEvents]);

  const years = useMemo(
    () => Array.from({ length: yearBounds.maxYear - yearBounds.minYear + 1 }, (_, index) => yearBounds.minYear + index),
    [yearBounds.maxYear, yearBounds.minYear]
  );

  const yearWidth = viewMode === "decade" ? 150 + zoom * 10 : viewMode === "phase" ? 190 + zoom * 16 : 200 + zoom * 20;
  const canvasWidth = Math.max(980, years.length * yearWidth);
  const laneHeight = 118;
  const canvasHeight = Math.max(360, timelineItems.reduce((max, item) => Math.max(max, item.lane), 0) * laneHeight + 180);

  const memoryMarkers = useMemo<TimelineMemoryMarker[]>(
    () =>
      filteredEvents.flatMap((event) =>
        (memoriesByEvent[event.id] ?? []).slice(0, 2).map((memory) => {
          const memoryDate = memory.captured_on ? new Date(memory.captured_on) : new Date(event.start_date);
          return {
            id: `${event.id}-${memory.id}`,
            eventId: event.id,
            title: memory.title,
            x: (dateToYearFraction(memoryDate) - yearBounds.minYear) * yearWidth,
          };
        })
      ),
    [filteredEvents, memoriesByEvent, yearBounds.minYear, yearWidth]
  );

  useEffect(() => {
    if (!jumpYear || !canvasRef.current) return;
    const targetX = (Number(jumpYear) - yearBounds.minYear) * yearWidth;
    canvasRef.current.scrollTo({ left: Math.max(0, targetX - 160), behavior: "smooth" });
  }, [jumpYear, yearBounds.minYear, yearWidth]);

  function toggleFilter(value: string, selected: string[], setSelected: (value: string[]) => void) {
    setSelected(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
  }

  function colorForCategory(category: string): string {
    return CATEGORY_COLORS[category.toLowerCase()] ?? "#8d6d58";
  }

  const selectedCategoryColor = selectedEvent ? colorForCategory(selectedEvent.category) : "#8d6d58";
  const nextMilestone = timelineItems.find((item) => item.event.status !== "completed");
  const selectedYear = selectedEvent ? new Date(selectedEvent.start_date).getFullYear() : undefined;

  return (
    <section className="timeline-workspace">
      <header className="timeline-header panel">
        <div className="timeline-header-copy">
          <p className="section-kicker">Timeline</p>
          <h2>See your life plans across time.</h2>
        </div>
        <label className="timeline-search">
          <span>Search plans, milestones, years...</span>
          <input value={query} placeholder="Search plans, milestones, years..." onChange={(event) => setQuery(event.target.value)} />
        </label>
        <div className="timeline-header-actions">
          <button type="button" onClick={onAddPlan}>+ Add Plan</button>
          <div className="view-switcher" role="tablist" aria-label="Timeline view mode">
            {(["decade", "year", "phase"] as TimelineViewMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                className={viewMode === mode ? "timeline-switch active" : "timeline-switch"}
                onClick={() => setViewMode(mode)}
              >
                {labelCase(mode)}
              </button>
            ))}
          </div>
          <div className="profile-chip" aria-label="User profile">
            {selectedEvent?.title?.[0] ?? "R"}
          </div>
        </div>
      </header>

      <div className="timeline-grid">
        <TimelineFilters
          categories={selectedCategories}
          statuses={selectedStatuses}
          phases={selectedPhases}
          availablePhases={availablePhases}
          years={years}
          selectedYear={jumpYear}
          timeFocus={timeFocus}
          onToggleCategory={(value) => toggleFilter(value, selectedCategories, setSelectedCategories)}
          onToggleStatus={(value) => toggleFilter(value, selectedStatuses, setSelectedStatuses)}
          onTogglePhase={(value) => toggleFilter(value, selectedPhases, setSelectedPhases)}
          onTimeFocusChange={setTimeFocus}
          onYearJump={setJumpYear}
        />

        <TimelineCanvas
          timelineItems={timelineItems}
          memoryMarkers={memoryMarkers}
          years={years}
          currentYear={currentYear}
          viewMode={viewMode}
          yearWidth={yearWidth}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          laneHeight={laneHeight}
          yearStart={yearBounds.minYear}
          selectedEvent={selectedEvent}
          onSelectYear={(year) => {
            setJumpYear(String(year));
            onOpenYear?.(year);
          }}
          onSelectEvent={onSelect}
          colorForCategory={colorForCategory}
          progressForEvent={progressForEvent}
          canvasRef={canvasRef}
          onEmptyCreate={onAddPlan}
        />

        <TimelinePreviewPanel
          selectedEvent={selectedEvent}
          selectedCategoryColor={selectedCategoryColor}
          nextMilestoneTitle={nextMilestone?.event.title}
          memoryCount={selectedEvent ? (memoriesByEvent[selectedEvent.id] ?? []).length : 0}
          progress={selectedEvent ? progressForEvent(selectedEvent) : 0}
          onOpenFullDetails={onOpenFullDetails}
        />
      </div>

      <TimelineZoomBar
        zoom={zoom}
        years={years}
        selectedYear={selectedYear}
        currentYear={currentYear}
        onZoomChange={setZoom}
        onJumpToYear={(year) => setJumpYear(String(year))}
        onJumpToPresent={() => setJumpYear(String(currentYear))}
        onJumpToNextMilestone={() => {
          const next = filteredEvents.find((event) => event.status !== "completed");
          if (next) onSelect(next.id);
        }}
      />
    </section>
  );
}

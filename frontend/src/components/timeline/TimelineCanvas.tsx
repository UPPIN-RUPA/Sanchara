import type { RefObject } from "react";
import type { EventItem } from "../../lib/api";
import { TimelineLane } from "./TimelineLane";
import { TimelineYearRuler } from "./TimelineYearRuler";
import type { TimelineItem, TimelineMemoryMarker, TimelineViewMode } from "./types";

type Props = {
  timelineItems: TimelineItem[];
  memoryMarkers: TimelineMemoryMarker[];
  years: number[];
  currentYear: number;
  viewMode: TimelineViewMode;
  yearWidth: number;
  canvasWidth: number;
  canvasHeight: number;
  laneHeight: number;
  yearStart: number;
  selectedEvent: EventItem | null;
  onSelectYear: (year: number) => void;
  onSelectEvent: (eventId: string) => void;
  colorForCategory: (category: string) => string;
  progressForEvent: (event: EventItem) => number;
  canvasRef: RefObject<HTMLDivElement>;
  onEmptyCreate: () => void;
};

export function TimelineCanvas({
  timelineItems,
  memoryMarkers,
  years,
  currentYear,
  viewMode,
  yearWidth,
  canvasWidth,
  canvasHeight,
  laneHeight,
  yearStart,
  selectedEvent,
  onSelectYear,
  onSelectEvent,
  colorForCategory,
  progressForEvent,
  canvasRef,
  onEmptyCreate,
}: Props) {
  return (
    <section className="timeline-canvas panel">
      {timelineItems.length === 0 ? (
        <div className="timeline-empty-state">
          <div className="timeline-empty-art" aria-hidden="true" />
          <h3>Your journey begins here.</h3>
          <p>Add your first life plan to start building your future timeline.</p>
          <button type="button" onClick={onEmptyCreate}>Create First Plan</button>
        </div>
      ) : (
        <>
          <TimelineYearRuler
            years={years}
            currentYear={currentYear}
            yearWidth={yearWidth}
            canvasWidth={canvasWidth}
            viewMode={viewMode}
            onSelectYear={onSelectYear}
          />

          <div className="canvas-scroll" ref={canvasRef}>
            <div className="timeline-life-line" style={{ width: canvasWidth, height: canvasHeight }}>
              <div className="timeline-track" />
              {years.map((year, index) => (
                <div key={year} className="timeline-year-guide" style={{ left: index * yearWidth }} />
              ))}

              {memoryMarkers.map((marker) => (
                <button
                  key={marker.id}
                  type="button"
                  className="timeline-memory-marker"
                  style={{ left: marker.x }}
                  title={marker.title}
                  onClick={() => onSelectEvent(marker.eventId)}
                />
              ))}

              {timelineItems.map((item) => (
                <TimelineLane
                  key={item.event.id}
                  item={item}
                  yearStart={yearStart}
                  yearWidth={yearWidth}
                  laneHeight={laneHeight}
                  selectedEvent={selectedEvent}
                  color={colorForCategory(item.event.category)}
                  progress={progressForEvent(item.event)}
                  onSelect={onSelectEvent}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

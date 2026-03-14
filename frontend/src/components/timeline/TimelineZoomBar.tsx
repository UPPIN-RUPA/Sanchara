type Props = {
  zoom: number;
  years: number[];
  selectedYear?: number;
  currentYear: number;
  onZoomChange: (next: number) => void;
  onJumpToYear: (year: number) => void;
  onJumpToPresent: () => void;
  onJumpToNextMilestone: () => void;
};

export function TimelineZoomBar({
  zoom,
  years,
  selectedYear,
  currentYear,
  onZoomChange,
  onJumpToYear,
  onJumpToPresent,
  onJumpToNextMilestone,
}: Props) {
  return (
    <footer className="timeline-bottom panel">
      <div className="zoom-controls">
        <button type="button" className="timeline-secondary-button" onClick={() => onZoomChange(Math.max(0, zoom - 1))}>
          -
        </button>
        <input type="range" min="0" max="3" step="1" value={zoom} onChange={(event) => onZoomChange(Number(event.target.value))} />
        <button type="button" className="timeline-secondary-button" onClick={() => onZoomChange(Math.min(3, zoom + 1))}>
          +
        </button>
      </div>
      <div className="timeline-scrubber">
        {years.map((year) => (
          <button
            key={year}
            type="button"
            className={selectedYear === year ? "scrubber-segment active" : "scrubber-segment"}
            onClick={() => onJumpToYear(year)}
          >
            {year}
          </button>
        ))}
      </div>
      <div className="timeline-bottom-actions">
        <button type="button" className="timeline-secondary-button" onClick={onJumpToPresent}>
          Go to Present
        </button>
        <button type="button" className="timeline-secondary-button" onClick={onJumpToNextMilestone}>
          {selectedYear === currentYear ? "Next Important Milestone" : "Return to Next Milestone"}
        </button>
      </div>
    </footer>
  );
}

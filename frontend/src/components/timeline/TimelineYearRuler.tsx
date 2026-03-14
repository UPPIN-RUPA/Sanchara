import type { TimelineViewMode } from "./types";

type Props = {
  years: number[];
  currentYear: number;
  yearWidth: number;
  canvasWidth: number;
  viewMode: TimelineViewMode;
  onSelectYear: (year: number) => void;
};

export function TimelineYearRuler({ years, currentYear, yearWidth, canvasWidth, viewMode, onSelectYear }: Props) {
  return (
    <div className="year-ruler" style={{ width: canvasWidth }}>
      {years.map((year) => (
        <button
          key={year}
          type="button"
          className={year === currentYear ? "year-ruler-cell current" : "year-ruler-cell"}
          style={{ width: yearWidth }}
          onClick={() => onSelectYear(year)}
        >
          <strong>{year}</strong>
          {viewMode === "year" && <span>Jan-Dec</span>}
          {viewMode === "decade" && <span>{Math.floor(year / 10) * 10}s</span>}
          {viewMode === "phase" && <span>Life chapter</span>}
        </button>
      ))}
    </div>
  );
}

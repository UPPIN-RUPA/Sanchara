import { CATEGORY_COLORS, CATEGORY_ORDER, STATUS_ORDER, labelCase, type TimeFocus } from "./types";

type Props = {
  categories: string[];
  statuses: string[];
  phases: string[];
  availablePhases: string[];
  years: number[];
  selectedYear: string;
  timeFocus: TimeFocus;
  onToggleCategory: (value: string) => void;
  onToggleStatus: (value: string) => void;
  onTogglePhase: (value: string) => void;
  onTimeFocusChange: (value: TimeFocus) => void;
  onYearJump: (value: string) => void;
};

export function TimelineFilters({
  categories,
  statuses,
  phases,
  availablePhases,
  years,
  selectedYear,
  timeFocus,
  onToggleCategory,
  onToggleStatus,
  onTogglePhase,
  onTimeFocusChange,
  onYearJump,
}: Props) {
  return (
    <aside className="timeline-filters panel">
      <section className="timeline-filter-group">
        <p className="timeline-filter-label">Categories</p>
        <div className="filter-pill-grid">
          {CATEGORY_ORDER.map((category) => (
            <button
              key={category}
              type="button"
              className={categories.includes(category) ? "filter-pill active" : "filter-pill"}
              onClick={() => onToggleCategory(category)}
            >
              <span className="filter-dot" style={{ backgroundColor: CATEGORY_COLORS[category] }} />
              {labelCase(category)}
            </button>
          ))}
        </div>
      </section>

      <section className="timeline-filter-group">
        <p className="timeline-filter-label">Status</p>
        <div className="filter-pill-grid">
          {STATUS_ORDER.map((status) => (
            <button
              key={status}
              type="button"
              className={statuses.includes(status) ? "filter-pill active" : "filter-pill"}
              onClick={() => onToggleStatus(status)}
            >
              {labelCase(status)}
            </button>
          ))}
        </div>
      </section>

      <section className="timeline-filter-group">
        <p className="timeline-filter-label">Time focus</p>
        <div className="focus-button-row">
          {(["1", "5", "10", "lifetime"] as TimeFocus[]).map((focus) => (
            <button
              key={focus}
              type="button"
              className={timeFocus === focus ? "focus-pill active" : "focus-pill"}
              onClick={() => onTimeFocusChange(focus)}
            >
              {focus === "lifetime" ? "Lifetime" : `${focus} Year${focus === "1" ? "" : "s"}`}
            </button>
          ))}
        </div>
      </section>

      <section className="timeline-filter-group">
        <p className="timeline-filter-label">Life phases</p>
        <div className="phase-list">
          {availablePhases.map((phase) => (
            <button
              key={phase}
              type="button"
              className={phases.includes(phase) ? "phase-chip active" : "phase-chip"}
              onClick={() => onTogglePhase(phase)}
            >
              {phase}
            </button>
          ))}
          {availablePhases.length === 0 && <p className="helper-text">No life phases added yet.</p>}
        </div>
      </section>

      <section className="timeline-filter-group">
        <p className="timeline-filter-label">Quick jump</p>
        <select value={selectedYear} onChange={(event) => onYearJump(event.target.value)}>
          <option value="">Jump to year</option>
          {years.map((year) => (
            <option key={year} value={year}>
              Jump to {year}
            </option>
          ))}
        </select>
      </section>
    </aside>
  );
}

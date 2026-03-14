import type { CreateEventPayload } from "../../lib/api";

type Props = {
  startDate: string;
  targetDate: string;
  timelinePhase: string;
  status: CreateEventPayload["status"];
  priority: CreateEventPayload["priority"];
  onChange: (patch: {
    startDate?: string;
    targetDate?: string;
    timelinePhase?: string;
    status?: CreateEventPayload["status"];
    priority?: CreateEventPayload["priority"];
  }) => void;
};

export function TimelineSection({ startDate, targetDate, timelinePhase, status, priority, onChange }: Props) {
  return (
    <section className="event-section-card panel">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Timeline placement</p>
          <h3>Place the plan across time</h3>
        </div>
        <p className="section-copy">Give the plan a clear beginning, a target horizon, and the life phase it belongs to.</p>
      </div>
      <div className="form-grid">
        <label className="form-field">
          <span>Start date</span>
          <input type="date" value={startDate} onChange={(event) => onChange({ startDate: event.target.value })} />
        </label>
        <label className="form-field">
          <span>Target date</span>
          <input type="date" value={targetDate} onChange={(event) => onChange({ targetDate: event.target.value })} />
        </label>
        <label className="form-field form-field-wide">
          <span>Life phase</span>
          <input value={timelinePhase} placeholder="Dream Living" onChange={(event) => onChange({ timelinePhase: event.target.value })} />
        </label>
        <label className="form-field">
          <span>Status</span>
          <select value={status} onChange={(event) => onChange({ status: event.target.value as CreateEventPayload["status"] })}>
            <option value="planned">planned</option>
            <option value="in-progress">in-progress</option>
            <option value="completed">completed</option>
          </select>
        </label>
        <label className="form-field">
          <span>Priority</span>
          <select value={priority} onChange={(event) => onChange({ priority: event.target.value as CreateEventPayload["priority"] })}>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
            <option value="critical">critical</option>
          </select>
        </label>
      </div>
    </section>
  );
}

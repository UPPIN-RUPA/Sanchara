import { useMemo, useState } from "react";
import type { CreateEventPayload } from "../lib/api";

type Props = {
  onSubmit: (payload: CreateEventPayload) => Promise<string | null>;
};

function todayIsoDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function EventForm({ onSubmit }: Props) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("career");
  const [startDate, setStartDate] = useState(todayIsoDate());
  const [status, setStatus] = useState<CreateEventPayload["status"]>("planned");
  const [priority, setPriority] = useState<CreateEventPayload["priority"]>("medium");
  const [timelinePhase, setTimelinePhase] = useState("");
  const [isFinancial, setIsFinancial] = useState(false);
  const [savingsTarget, setSavingsTarget] = useState("");
  const [amountSaved, setAmountSaved] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const savingsTargetNumber = useMemo(() => (savingsTarget ? Number(savingsTarget) : undefined), [savingsTarget]);
  const amountSavedNumber = useMemo(() => (amountSaved ? Number(amountSaved) : undefined), [amountSaved]);

  return (
    <form
      className="event-form chapter-composer"
      onSubmit={async (event) => {
        event.preventDefault();
        setError("");

        if (!title.trim()) {
          setError("Title is required.");
          return;
        }
        if (!startDate) {
          setError("Start date is required.");
          return;
        }
        if (isFinancial && (savingsTargetNumber === undefined || Number.isNaN(savingsTargetNumber))) {
          setError("Savings target is required for financial events.");
          return;
        }
        if ((savingsTargetNumber ?? 0) < 0 || (amountSavedNumber ?? 0) < 0) {
          setError("Amounts cannot be negative.");
          return;
        }

        const payload: CreateEventPayload = {
          title: title.trim(),
          category: category.trim() || "general",
          start_date: startDate,
          status,
          priority,
          timeline_phase: timelinePhase.trim() || undefined,
          is_financial: isFinancial,
          savings_target: savingsTargetNumber,
          amount_saved: amountSavedNumber,
        };

        setIsSubmitting(true);
        const submitError = await onSubmit(payload);
        setIsSubmitting(false);

        if (submitError) {
          setError(submitError);
          return;
        }

        setTitle("");
        setStartDate(todayIsoDate());
        setTimelinePhase("");
        setSavingsTarget("");
        setAmountSaved("");
      }}
    >
      <div className="section-heading compact-heading">
        <div>
          <p className="section-kicker">New chapter</p>
          <h3>Place the next milestone on the map</h3>
        </div>
        <p className="section-copy">Write down the event while it is still only a thought, so the year has somewhere to hold it.</p>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="composer-note">
        A chapter can begin as little as a title and a date. Add the finer details later when the shape of it becomes clearer.
      </div>

      <div className="form-grid">
        <label className="form-field form-field-wide">
          <span>Title</span>
          <input required value={title} placeholder="Buy land in the village" onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="form-field">
          <span>Start date</span>
          <input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label className="form-field">
          <span>Category</span>
          <input value={category} placeholder="Finance" onChange={(e) => setCategory(e.target.value)} />
        </label>
        <label className="form-field form-field-wide">
          <span>Timeline phase</span>
          <input value={timelinePhase} placeholder="Village return phase" onChange={(e) => setTimelinePhase(e.target.value)} />
        </label>
        <label className="form-field">
          <span>Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as CreateEventPayload["status"])}>
            <option value="planned">planned</option>
            <option value="in-progress">in-progress</option>
            <option value="completed">completed</option>
          </select>
        </label>
        <label className="form-field">
          <span>Priority</span>
          <select value={priority} onChange={(e) => setPriority(e.target.value as CreateEventPayload["priority"])}>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
            <option value="critical">critical</option>
          </select>
        </label>
      </div>

      <label className="toggle-row">
        <input type="checkbox" checked={isFinancial} onChange={(e) => setIsFinancial(e.target.checked)} />
        <span>
          <strong>This chapter needs financial preparation</strong>
          <small>Keep the target and the amount already set aside in the same place as the event itself.</small>
        </span>
      </label>

      <div className="form-grid compact-grid-two">
        <label className="form-field">
          <span>Savings target</span>
          <input type="number" step="0.01" placeholder="500000" value={savingsTarget} onChange={(e) => setSavingsTarget(e.target.value)} />
        </label>
        <label className="form-field">
          <span>Amount saved</span>
          <input type="number" step="0.01" placeholder="125000" value={amountSaved} onChange={(e) => setAmountSaved(e.target.value)} />
        </label>
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Placing chapter..." : "Place chapter on timeline"}
      </button>
    </form>
  );
}

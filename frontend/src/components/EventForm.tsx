import { useMemo, useState } from "react";
import type { CreateEventPayload } from "../lib/api";

type Props = {
  onSubmit: (payload: CreateEventPayload) => Promise<string | null>;
};

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
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

  const savingsTargetNumber = useMemo(
    () => (savingsTarget ? Number(savingsTarget) : undefined),
    [savingsTarget]
  );
  const amountSavedNumber = useMemo(
    () => (amountSaved ? Number(amountSaved) : undefined),
    [amountSaved]
  );

  return (
    <form
      className="event-form"
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
        if (
          isFinancial &&
          (savingsTargetNumber === undefined || Number.isNaN(savingsTargetNumber))
        ) {
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
      <h3>Create event</h3>
      {error && <p className="error">{error}</p>}

      <input
        required
        value={title}
        placeholder="Title"
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        required
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
      <input
        value={category}
        placeholder="Category"
        onChange={(e) => setCategory(e.target.value)}
      />
      <input
        value={timelinePhase}
        placeholder="Timeline phase (optional)"
        onChange={(e) => setTimelinePhase(e.target.value)}
      />

      <div className="row">
        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as CreateEventPayload["status"])
          }
        >
          <option value="planned">planned</option>
          <option value="in-progress">in-progress</option>
          <option value="completed">completed</option>
        </select>

        <select
          value={priority}
          onChange={(e) =>
            setPriority(e.target.value as CreateEventPayload["priority"])
          }
        >
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
          <option value="critical">critical</option>
        </select>
      </div>

      <label>
        <input
          type="checkbox"
          checked={isFinancial}
          onChange={(e) => setIsFinancial(e.target.checked)}
        />
        Financial event
      </label>
      {isFinancial && (
        <p className="helper-text">
          Savings target is required to compute savings progress.
        </p>
      )}

      <div className="row">
        <input
          type="number"
          step="0.01"
          placeholder="Savings target"
          value={savingsTarget}
          onChange={(e) => setSavingsTarget(e.target.value)}
        />
        <input
          type="number"
          step="0.01"
          placeholder="Amount saved"
          value={amountSaved}
          onChange={(e) => setAmountSaved(e.target.value)}
        />
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create"}
      </button>
    </form>
  );
}

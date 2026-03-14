import { useMemo, useState, type FormEvent } from "react";
import { BasicInfoSection } from "./BasicInfoSection";
import { FinanceSection } from "./FinanceSection";
import { MilestonesSection } from "./MilestonesSection";
import { ReflectionSection } from "./ReflectionSection";
import { TimelineSection } from "./TimelineSection";
import { createEvent, createTask, updateEvent, type CreateEventPayload } from "../../lib/api";

type MilestoneDraft = {
  title: string;
  targetDate: string;
  note: string;
};

type Props = {
  userId: string;
  onCreated: (eventId: string) => void;
  onCancel: () => void;
};

function todayIsoDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function EventForm({ userId, onCreated, onCancel }: Props) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("dreams");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(todayIsoDate());
  const [targetDate, setTargetDate] = useState("");
  const [timelinePhase, setTimelinePhase] = useState("");
  const [status, setStatus] = useState<CreateEventPayload["status"]>("planned");
  const [priority, setPriority] = useState<CreateEventPayload["priority"]>("medium");
  const [milestones, setMilestones] = useState<MilestoneDraft[]>([]);
  const [isFinancial, setIsFinancial] = useState(false);
  const [savingsTarget, setSavingsTarget] = useState("");
  const [amountSaved, setAmountSaved] = useState("");
  const [whyThisMatters, setWhyThisMatters] = useState("");
  const [noteToFutureSelf, setNoteToFutureSelf] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const savingsTargetNumber = useMemo(() => (savingsTarget ? Number(savingsTarget) : undefined), [savingsTarget]);
  const amountSavedNumber = useMemo(() => (amountSaved ? Number(amountSaved) : undefined), [amountSaved]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Event title is required.");
      return;
    }
    if (!startDate) {
      setError("Start date is required.");
      return;
    }
    if (isFinancial && (savingsTargetNumber === undefined || Number.isNaN(savingsTargetNumber))) {
      setError("Savings target is required for financial plans.");
      return;
    }

    const payload: CreateEventPayload = {
      title: title.trim(),
      category,
      start_date: startDate,
      status,
      priority,
      timeline_phase: timelinePhase || undefined,
      is_financial: isFinancial,
      savings_target: savingsTargetNumber,
      amount_saved: amountSavedNumber,
    };

    try {
      setIsSubmitting(true);
      const created = await createEvent(userId, payload);
      const detailPayload = {
        end_date: targetDate || null,
        description: description || whyThisMatters || null,
        notes: noteToFutureSelf || null,
        timeline_phase: timelinePhase || null,
      };
      await updateEvent(userId, created.id, detailPayload);

      const validMilestones = milestones.filter((milestone) => milestone.title.trim());
      await Promise.all(
        validMilestones.map((milestone) =>
          createTask(userId, created.id, {
            title: milestone.title.trim(),
            due_date: milestone.targetDate || undefined,
            notes: milestone.note || undefined,
          })
        )
      );

      onCreated(created.id);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save plan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="view-stack" onSubmit={handleSubmit}>
      {error && <p className="error panel">{error}</p>}
      <BasicInfoSection
        title={title}
        category={category}
        description={description}
        onChange={(patch) => {
          if (patch.title !== undefined) setTitle(patch.title);
          if (patch.category !== undefined) setCategory(patch.category);
          if (patch.description !== undefined) setDescription(patch.description);
        }}
      />
      <TimelineSection
        startDate={startDate}
        targetDate={targetDate}
        timelinePhase={timelinePhase}
        status={status}
        priority={priority}
        onChange={(patch) => {
          if (patch.startDate !== undefined) setStartDate(patch.startDate);
          if (patch.targetDate !== undefined) setTargetDate(patch.targetDate);
          if (patch.timelinePhase !== undefined) setTimelinePhase(patch.timelinePhase);
          if (patch.status !== undefined) setStatus(patch.status);
          if (patch.priority !== undefined) setPriority(patch.priority);
        }}
      />
      <MilestonesSection
        milestones={milestones}
        onAdd={() => setMilestones((current) => [...current, { title: "", targetDate: "", note: "" }])}
        onRemove={(index) => setMilestones((current) => current.filter((_, currentIndex) => currentIndex !== index))}
        onChange={(index, patch) =>
          setMilestones((current) =>
            current.map((item, currentIndex) => (currentIndex === index ? { ...item, ...patch } : item))
          )
        }
      />
      <FinanceSection
        isFinancial={isFinancial}
        savingsTarget={savingsTarget}
        amountSaved={amountSaved}
        onChange={(patch) => {
          if (patch.isFinancial !== undefined) setIsFinancial(patch.isFinancial);
          if (patch.savingsTarget !== undefined) setSavingsTarget(patch.savingsTarget);
          if (patch.amountSaved !== undefined) setAmountSaved(patch.amountSaved);
        }}
      />
      <ReflectionSection
        whyThisMatters={whyThisMatters}
        noteToFutureSelf={noteToFutureSelf}
        onChange={(patch) => {
          if (patch.whyThisMatters !== undefined) setWhyThisMatters(patch.whyThisMatters);
          if (patch.noteToFutureSelf !== undefined) setNoteToFutureSelf(patch.noteToFutureSelf);
        }}
      />
      <div className="panel event-save-actions">
        <div className="section-copy">
          Save the plan once the title, timeline, and meaning are clear enough. The details can deepen after the chapter is placed on the map.
        </div>
        <div className="event-save-buttons">
          <button type="button" className="timeline-secondary-button" onClick={onCancel}>Cancel</button>
          <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving plan..." : "Save Plan"}</button>
        </div>
      </div>
    </form>
  );
}

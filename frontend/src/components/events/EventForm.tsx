import { useMemo, useState, type FormEvent } from "react";
import { BasicInfoSection } from "./BasicInfoSection";
import { FinanceSection } from "./FinanceSection";
import { MilestonesSection } from "./MilestonesSection";
import { ReflectionSection } from "./ReflectionSection";
import { TimelineSection } from "./TimelineSection";
import {
  createEvent,
  createTask,
  deleteTask,
  updateEvent,
  updateTask,
  type CreateEventPayload,
  type EventItem,
  type TaskItem,
} from "../../lib/api";

type MilestoneDraft = {
  id?: string;
  title: string;
  targetDate: string;
  note: string;
  status?: TaskItem["status"];
};

type Props = {
  mode: "create" | "edit";
  initialEvent?: EventItem | null;
  initialMilestones?: TaskItem[];
  onSubmitted: (eventId: string) => void;
  onCancel: () => void;
};

function todayIsoDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildNotes(whyThisMatters: string, noteToFutureSelf: string): string | null {
  const blocks = [
    whyThisMatters.trim() ? `Why this matters\n${whyThisMatters.trim()}` : "",
    noteToFutureSelf.trim() ? `Note to future self\n${noteToFutureSelf.trim()}` : "",
  ].filter(Boolean);

  return blocks.length > 0 ? blocks.join("\n\n") : null;
}

function parseNotes(notes: string | null | undefined): { whyThisMatters: string; noteToFutureSelf: string } {
  if (!notes) return { whyThisMatters: "", noteToFutureSelf: "" };

  const whyMatch = notes.match(/Why this matters\n([\s\S]*?)(?:\n\nNote to future self\n|$)/);
  const futureMatch = notes.match(/Note to future self\n([\s\S]*)$/);

  return {
    whyThisMatters: whyMatch?.[1]?.trim() ?? "",
    noteToFutureSelf: futureMatch?.[1]?.trim() ?? "",
  };
}

function milestoneDraftFromTask(task: TaskItem): MilestoneDraft {
  return {
    id: task.id,
    title: task.title,
    targetDate: task.due_date ?? "",
    note: task.notes ?? "",
    status: task.status,
  };
}

export function EventForm({
  mode,
  initialEvent,
  initialMilestones = [],
  onSubmitted,
  onCancel,
}: Props) {
  const initialNotes = parseNotes(initialEvent?.notes);
  const [title, setTitle] = useState(initialEvent?.title ?? "");
  const [category, setCategory] = useState(initialEvent?.category ?? "dreams");
  const [description, setDescription] = useState(initialEvent?.description ?? "");
  const [startDate, setStartDate] = useState(initialEvent?.start_date ?? todayIsoDate());
  const [targetDate, setTargetDate] = useState(initialEvent?.end_date ?? "");
  const [timelinePhase, setTimelinePhase] = useState(initialEvent?.timeline_phase ?? "");
  const [status, setStatus] = useState<CreateEventPayload["status"]>(initialEvent?.status ?? "planned");
  const [priority, setPriority] = useState<CreateEventPayload["priority"]>(initialEvent?.priority ?? "medium");
  const [milestones, setMilestones] = useState<MilestoneDraft[]>(initialMilestones.map(milestoneDraftFromTask));
  const [isFinancial, setIsFinancial] = useState(initialEvent?.is_financial ?? false);
  const [estimatedCost, setEstimatedCost] = useState(initialEvent?.estimated_cost?.toString() ?? "");
  const [savingsTarget, setSavingsTarget] = useState(initialEvent?.savings_target?.toString() ?? "");
  const [amountSaved, setAmountSaved] = useState(initialEvent?.amount_saved?.toString() ?? "");
  const [whyThisMatters, setWhyThisMatters] = useState(initialNotes.whyThisMatters);
  const [noteToFutureSelf, setNoteToFutureSelf] = useState(initialNotes.noteToFutureSelf);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const estimatedCostNumber = useMemo(() => (estimatedCost ? Number(estimatedCost) : undefined), [estimatedCost]);
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
      estimated_cost: estimatedCostNumber,
      savings_target: savingsTargetNumber,
      amount_saved: amountSavedNumber,
    };

    try {
      setIsSubmitting(true);
      const detailPayload = {
        end_date: targetDate || null,
        description: description || null,
        notes: buildNotes(whyThisMatters, noteToFutureSelf),
        timeline_phase: timelinePhase || null,
        estimated_cost: estimatedCostNumber ?? null,
        savings_target: savingsTargetNumber ?? null,
        amount_saved: amountSavedNumber ?? null,
      };

      const validMilestones = milestones.filter((milestone) => milestone.title.trim());
      if (mode === "create") {
        const created = await createEvent(payload);
        await updateEvent(created.id, detailPayload);
        await Promise.all(
          validMilestones.map((milestone) =>
            createTask(created.id, {
              title: milestone.title.trim(),
              due_date: milestone.targetDate || undefined,
              notes: milestone.note || undefined,
            })
          )
        );
        onSubmitted(created.id);
      } else {
        if (!initialEvent) {
          throw new Error("No event selected for editing.");
        }

        await updateEvent(initialEvent.id, {
          ...payload,
          ...detailPayload,
        });

        const retainedIds = new Set(validMilestones.flatMap((milestone) => (milestone.id ? [milestone.id] : [])));

        await Promise.all(
          validMilestones.map((milestone) =>
            milestone.id
              ? updateTask(initialEvent.id, milestone.id, {
                  title: milestone.title.trim(),
                  due_date: milestone.targetDate || null,
                  notes: milestone.note || undefined,
                  status: milestone.status,
                })
              : createTask(initialEvent.id, {
                  title: milestone.title.trim(),
                  due_date: milestone.targetDate || undefined,
                  notes: milestone.note || undefined,
                })
          )
        );

        await Promise.all(
          initialMilestones
            .filter((task) => !retainedIds.has(task.id))
            .map((task) => deleteTask(initialEvent.id, task.id))
        );

        onSubmitted(initialEvent.id);
      }
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
        estimatedCost={estimatedCost}
        savingsTarget={savingsTarget}
        amountSaved={amountSaved}
        onChange={(patch) => {
          if (patch.isFinancial !== undefined) setIsFinancial(patch.isFinancial);
          if (patch.estimatedCost !== undefined) setEstimatedCost(patch.estimatedCost);
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
          {mode === "create"
            ? "Save the plan once the title, timeline, and meaning are clear enough. The details can deepen after the chapter is placed on the map."
            : "Save changes once the chapter reflects its current shape. The detail page should stay aligned with what this plan has become."}
        </div>
        <div className="event-save-buttons">
          <button type="button" className="timeline-secondary-button" onClick={onCancel}>Cancel</button>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving plan..." : mode === "create" ? "Create Plan" : "Save Changes"}
          </button>
        </div>
      </div>
    </form>
  );
}

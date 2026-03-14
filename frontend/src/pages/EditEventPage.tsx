import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { EventForm } from "../components/events/EventForm";
import { getEvent, getTasks, type EventItem, type TaskItem } from "../lib/api";

type Props = {
  onSaved: (eventId: string) => void;
  onCancel: () => void;
};

export function EditEventPage({ onSaved, onCancel }: Props) {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [milestones, setMilestones] = useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!eventId) {
      setEvent(null);
      setMilestones([]);
      return;
    }

    let cancelled = false;
    async function loadEditorData() {
      setIsLoading(true);
      try {
        const id = eventId;
        if (!id) return;
        const [eventResponse, taskResponse] = await Promise.all([
          getEvent(id),
          getTasks(id),
        ]);
        if (!cancelled) {
          setEvent(eventResponse);
          setMilestones(taskResponse.items);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadEditorData();

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  if (!event) {
    return (
      <div className="view-stack">
        <PageHeader
          eyebrow="Edit plan"
          title="Select a plan first"
          subtitle="Open a plan before trying to refine it."
          actions={
            <button type="button" className="timeline-secondary-button" onClick={onCancel}>
              Back
            </button>
          }
        />
        {isLoading && <p className="loading panel">Loading plan editor...</p>}
      </div>
    );
  }

  return (
    <div className="view-stack">
      <PageHeader
        eyebrow="Edit plan"
        title="Refine This Chapter"
        subtitle="Adjust the structure, timing, money, and meaning without recreating the plan."
        actions={<button type="button" className="timeline-secondary-button" onClick={onCancel}>Cancel</button>}
      />
      <section className="panel create-plan-intro">
        <div>
          <p className="section-kicker">Update guidance</p>
          <h3>Refine the plan while preserving its story.</h3>
          <p className="section-copy">
            This is the place to adjust the chapter as it becomes clearer, more realistic, or more meaningful over time.
          </p>
        </div>
        <div className="create-plan-examples">
          <span className="hero-tag">Clarify timeline</span>
          <span className="hero-tag">Update savings</span>
          <span className="hero-tag">Refine milestones</span>
        </div>
      </section>
      <EventForm
        mode="edit"
        initialEvent={event}
        initialMilestones={milestones}
        onSubmitted={(savedEventId) => {
          onSaved(savedEventId);
          navigate(`/plans/${savedEventId}`);
        }}
        onCancel={onCancel}
      />
    </div>
  );
}

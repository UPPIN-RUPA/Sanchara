import { useEffect, useState } from "react";
import {
  getMemories,
  getTasks,
  type EventItem,
  type MemoryItem,
  type TaskItem,
} from "../lib/api";
import { EventDocuments } from "../components/events/EventDocuments";
import { EventHeader } from "../components/events/EventHeader";
import { EventMemories } from "../components/events/EventMemories";
import { EventOverview } from "../components/events/EventOverview";
import { EventTabs, type EventDetailTab } from "../components/events/EventTabs";
import { EventUpdates } from "../components/events/EventUpdates";
import { MilestoneList } from "../components/events/MilestoneList";
import { PageHeader } from "../components/layout/PageHeader";
import { getActivityByPlanId, getSavingsByPlanId } from "../utils/planSelectors";
import { mockPlans } from "../data/mockPlans";

type Props = {
  userId: string;
  event: EventItem | null;
  onBack: () => void;
  onEdit: () => void;
};

function progressForEvent(event: EventItem): number {
  if (event.is_financial) return Math.min(100, Math.max(0, event.savings_progress_pct ?? 0));
  if (event.status === "completed") return 100;
  if (event.status === "in-progress") return 56;
  return 18;
}

export function EventDetailPage({ userId, event, onBack, onEdit }: Props) {
  const [activeTab, setActiveTab] = useState<EventDetailTab>("overview");
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!event) return;
    const currentEvent = event;
    let cancelled = false;
    async function loadChildren() {
      try {
        setIsLoading(true);
        const [taskResponse, memoryResponse] = await Promise.all([
          getTasks(userId, currentEvent.id),
          getMemories(userId, currentEvent.id),
        ]);
        if (!cancelled) {
          setTasks(taskResponse.items);
          setMemories(memoryResponse.items);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    void loadChildren();
    return () => {
      cancelled = true;
    };
  }, [event, userId]);

  if (!event) {
    return (
      <div className="view-stack">
        <PageHeader eyebrow="Plan detail" title="Select a plan" subtitle="Open a plan from timeline, dashboard, or year view to see the full story here." />
      </div>
    );
  }

  const planKey = mockPlans.find((plan) => plan.title.toLowerCase() === event.title.toLowerCase())?.id;

  const mockSavings = planKey ? getSavingsByPlanId(planKey) : undefined;
  const updates = planKey ? getActivityByPlanId(planKey) : [];

  return (
    <div className="view-stack">
      <PageHeader
        eyebrow="Plan detail"
        title="The full story of one plan"
        subtitle="Meaning, milestones, savings, updates, and memories held together in one place."
        actions={<button type="button" className="timeline-secondary-button" onClick={onBack}>Back</button>}
      />
      <EventHeader event={event} progress={progressForEvent(event)} onEdit={onEdit} />
      <EventTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "overview" && <EventOverview event={event} />}

      {activeTab === "milestones" && <MilestoneList milestones={tasks} />}

      {activeTab === "savings" && (
        <section className="panel section-panel">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Savings</p>
              <h3>Money behind the milestone</h3>
            </div>
          </div>
          <div className="detail-grid">
            <article className="detail-card">
              <h4>Target</h4>
              <p>₹{(event.savings_target ?? mockSavings?.targetAmount ?? 0).toLocaleString()}</p>
            </article>
            <article className="detail-card">
              <h4>Saved</h4>
              <p>₹{(event.amount_saved ?? mockSavings?.savedAmount ?? 0).toLocaleString()}</p>
            </article>
            <article className="detail-card detail-card-wide">
              <h4>Funding progress</h4>
              <div className="timeline-progress-rail">
                <div className="timeline-progress-fill" style={{ width: `${progressForEvent(event)}%` }} />
              </div>
              <p>{progressForEvent(event)}% funded</p>
            </article>
          </div>
        </section>
      )}

      {activeTab === "updates" && <EventUpdates items={updates} />}

      {activeTab === "memories" && <EventMemories memories={memories} />}

      {activeTab === "documents" && <EventDocuments />}

      {isLoading && <p className="loading panel">Loading plan details...</p>}
    </div>
  );
}

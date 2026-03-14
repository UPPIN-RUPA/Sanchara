import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { EventItem } from "../lib/api";
import { EventHeader } from "../components/events/EventHeader";
import { EventMemories } from "../components/events/EventMemories";
import { EventUpdates } from "../components/events/EventUpdates";
import { InlineMilestoneEditor } from "../components/events/InlineMilestoneEditor";
import { EventOverview } from "../components/events/EventOverview";
import { SavingsEditor } from "../components/events/SavingsEditor";
import { EventTabs, type EventDetailTab } from "../components/events/EventTabs";
import { PageHeader } from "../components/layout/PageHeader";
import { useEventDetail } from "../hooks/useEventDetail";

type Props = {
  onEventUpdated: (event: EventItem) => void;
  onWorkspaceRefresh?: () => Promise<void> | void;
};

export function EventDetailPage({ onEventUpdated, onWorkspaceRefresh }: Props) {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [activeTab, setActiveTab] = useState<EventDetailTab>("overview");
  const {
    event,
    tasks,
    memories,
    updates,
    isLoading,
    isSaving,
    summary,
    saveEvent,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    addMemory,
    updateMemoryItem,
    deleteMemoryItem,
    addUpdate,
    updateUpdateItem,
    deleteUpdateItem,
  } = useEventDetail({ eventId, onEventUpdated, onWorkspaceRefresh });

  if (!event) {
    return (
      <div className="view-stack">
        <PageHeader eyebrow="Plan detail" title="Select a plan" subtitle="Open a plan from timeline, dashboard, or year view to see the full story here." />
      </div>
    );
  }

  return (
    <div className="view-stack">
      <PageHeader
        eyebrow="Plan detail"
        title={event.title}
        subtitle="Meaning, milestones, savings, updates, and memories held together in one place."
        actions={<button type="button" className="timeline-secondary-button" onClick={() => navigate("/timeline")}>Back to Timeline</button>}
      />
      <EventHeader
        event={event}
        progress={summary.progress}
        milestoneCount={tasks.length}
        completedMilestoneCount={summary.completedMilestones}
        memoryCount={memories.length}
        onEdit={() => navigate(`/plans/${event.id}/edit`)}
        onBack={() => navigate("/timeline")}
        onOpenMilestones={() => setActiveTab("milestones")}
        onOpenMemories={() => setActiveTab("memories")}
      />
      <EventTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "overview" && <EventOverview event={event} />}

      {activeTab === "milestones" && (
        <InlineMilestoneEditor
          milestones={tasks}
          isSaving={isSaving}
          onCreate={addMilestone}
          onUpdate={updateMilestone}
          onDelete={deleteMilestone}
        />
      )}

      {activeTab === "savings" && (
        <SavingsEditor
          isFinancial={event.is_financial}
          estimatedCost={event.estimated_cost ?? 0}
          savingsTarget={summary.targetAmount}
          amountSaved={summary.savedAmount}
          progress={summary.progress}
          isSaving={isSaving}
          onSave={saveEvent}
        />
      )}

      {activeTab === "memories" && (
        <EventMemories
          memories={memories}
          isSaving={isSaving}
          onCreate={(payload) =>
            addMemory({
              ...payload,
              captured_on: payload.captured_on ?? undefined,
            })
          }
          onUpdate={updateMemoryItem}
          onDelete={deleteMemoryItem}
        />
      )}

      {activeTab === "updates" && (
        <EventUpdates
          items={updates}
          isSaving={isSaving}
          onCreate={addUpdate}
          onUpdate={updateUpdateItem}
          onDelete={deleteUpdateItem}
        />
      )}

      {isLoading && <p className="loading panel">Loading plan details...</p>}
    </div>
  );
}

import { DashboardStatsRow } from "../components/dashboard/DashboardStatsRow";
import { FocusThisYear } from "../components/dashboard/FocusThisYear";
import { QuickActions } from "../components/dashboard/QuickActions";
import { RecentUpdates } from "../components/dashboard/RecentUpdates";
import { TimelinePreview } from "../components/dashboard/TimelinePreview";
import { UpcomingMilestones } from "../components/dashboard/UpcomingMilestones";
import { useAuth } from "../auth/useAuth";
import { EventForm } from "../components/EventForm";
import type { CreateEventPayload } from "../lib/api";
import { useDashboardData } from "../hooks/useDashboardData";

type DashboardEvent = {
  id: string;
  title: string;
  category: string;
  start_date: string;
  status: string;
};

type Props = {
  onOpenEvent: (eventId: string) => void;
  onGoToPlans: () => void;
  onGoToTimeline: () => void;
  onGoToMemories: () => void;
  onGoToYear: () => void;
  onSubmitEvent: (payload: CreateEventPayload) => Promise<string | null>;
};

export function DashboardPage({
  onOpenEvent,
  onGoToPlans,
  onGoToTimeline,
  onGoToMemories,
  onGoToYear,
  onSubmitEvent,
}: Props) {
  const { currentUser } = useAuth();
  const {
    totalEvents,
    activePlansCount,
    upcomingMilestonesCount,
    completedMilestonesCount,
    lifeProgress,
    focusText,
    upcomingEvents,
    currentYear,
    currentYearEvents,
    activity,
    isLoading,
    error,
  } = useDashboardData();

  return (
    <div className="view-stack">
      {error && <p className="error panel">{error}</p>}
      {isLoading && <p className="loading panel">Loading dashboard...</p>}
      <header className="hero panel">
        <div className="hero-copy-block">
          <p className="hero-kicker">Life planning timeline</p>
          <h1>Sanchara</h1>
          <p className="hero-copy">
            Design your future. Track your journey. Preserve your memories. Sanchara is a life-planning system for the milestones that shape a whole life, not just a week.
          </p>
          <div className="hero-tags">
            <span className="hero-tag">{totalEvents} plans mapped</span>
            <span className="hero-tag">{completedMilestonesCount} milestones completed</span>
            <span className="hero-tag">Life progress {lifeProgress}%</span>
          </div>
        </div>
        <div className="hero-sidecard">
          <div className="hero-illustration" aria-hidden="true">
            <div className="hero-aura" />
            <div className="hero-spark hero-spark-one" />
            <div className="hero-spark hero-spark-two" />
            <div className="hero-spark hero-spark-three" />
            <div className="hero-figure">
              <span className="hero-figure-head" />
              <span className="hero-figure-body" />
              <span className="hero-figure-book" />
            </div>
          </div>
          <p className="section-kicker">Current focus</p>
          <h3>{focusText}</h3>
          <p className="section-copy">Keep the next chapter visible. Choose a plan, adjust it calmly, and let the larger life map stay coherent.</p>
          <div className="hero-controls">
            <div className="detail-card">
              <p className="section-kicker">Signed in as</p>
              <h4>{currentUser?.name}</h4>
              <p>{currentUser?.email}</p>
            </div>
          </div>
        </div>
      </header>

      <DashboardStatsRow
        totalEvents={totalEvents}
        activePlans={activePlansCount}
        upcomingMilestones={upcomingMilestonesCount}
        completedMilestones={completedMilestonesCount}
        lifeProgress={lifeProgress}
      />

      <section className="panel dashboard-layout">
        <TimelinePreview events={upcomingEvents} onOpenEvent={onOpenEvent} onOpenTimeline={onGoToTimeline} />
        <UpcomingMilestones
          events={upcomingEvents.map((event) => ({ ...event, progress: event.status === "completed" ? 100 : event.status === "in-progress" ? 56 : 18 }))}
          onOpenEvent={onOpenEvent}
        />
        <QuickActions onGoToPlans={onGoToPlans} onGoToTimeline={onGoToTimeline} onGoToMemories={onGoToMemories} onGoToYear={onGoToYear} />
        <FocusThisYear year={currentYear} events={currentYearEvents} onOpenYear={onGoToYear} onOpenEvent={onOpenEvent} />
        <RecentUpdates items={activity} />
      </section>

      <EventForm onSubmit={onSubmitEvent} />
    </div>
  );
}

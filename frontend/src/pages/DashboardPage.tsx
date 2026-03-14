import { DashboardStatsRow } from "../components/dashboard/DashboardStatsRow";
import { FocusThisYear } from "../components/dashboard/FocusThisYear";
import { QuickActions } from "../components/dashboard/QuickActions";
import { RecentUpdates } from "../components/dashboard/RecentUpdates";
import { TimelinePreview } from "../components/dashboard/TimelinePreview";
import { UpcomingMilestones } from "../components/dashboard/UpcomingMilestones";
import { EventForm } from "../components/EventForm";
import type { CreateEventPayload } from "../lib/api";
import type { ActivityItem } from "../types/savings";

type DashboardEvent = {
  id: string;
  title: string;
  category: string;
  start_date: string;
  status: string;
};

type Props = {
  totalEvents: number;
  activePlans: number;
  upcomingMilestones: number;
  completedMilestones: number;
  lifeProgress: number;
  focusText: string;
  userId: string;
  quickUsers: string[];
  onUserChange: (value: string) => void;
  upcomingEvents: DashboardEvent[];
  onOpenEvent: (eventId: string) => void;
  onGoToPlans: () => void;
  onGoToTimeline: () => void;
  onGoToMemories: () => void;
  onGoToYear: () => void;
  currentYear: number;
  currentYearEvents: DashboardEvent[];
  activity: ActivityItem[];
  onSubmitEvent: (payload: CreateEventPayload) => Promise<string | null>;
};

export function DashboardPage({
  totalEvents,
  activePlans,
  upcomingMilestones,
  completedMilestones,
  lifeProgress,
  focusText,
  userId,
  quickUsers,
  onUserChange,
  upcomingEvents,
  onOpenEvent,
  onGoToPlans,
  onGoToTimeline,
  onGoToMemories,
  onGoToYear,
  currentYear,
  currentYearEvents,
  activity,
  onSubmitEvent,
}: Props) {
  return (
    <div className="view-stack">
      <header className="hero panel">
        <div className="hero-copy-block">
          <p className="hero-kicker">Life planning timeline</p>
          <h1>Sanchara</h1>
          <p className="hero-copy">
            Design your future. Track your journey. Preserve your memories. Sanchara is a life-planning system for the milestones that shape a whole life, not just a week.
          </p>
          <div className="hero-tags">
            <span className="hero-tag">{totalEvents} plans mapped</span>
            <span className="hero-tag">{completedMilestones} milestones completed</span>
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
            <label>
              Quick user
              <select value={quickUsers.includes(userId) ? userId : "custom"} onChange={(e) => onUserChange(e.target.value === "custom" ? userId : e.target.value)}>
                {quickUsers.map((u) => <option key={u} value={u}>{u}</option>)}
                <option value="custom">custom</option>
              </select>
            </label>
            <label>
              User id
              <input value={userId} onChange={(e) => onUserChange(e.target.value || "demo-user")} />
            </label>
          </div>
        </div>
      </header>

      <DashboardStatsRow
        totalEvents={totalEvents}
        activePlans={activePlans}
        upcomingMilestones={upcomingMilestones}
        completedMilestones={completedMilestones}
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

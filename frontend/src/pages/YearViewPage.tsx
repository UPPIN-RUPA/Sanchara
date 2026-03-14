import { PageHeader } from "../components/layout/PageHeader";
import { YearEventsList } from "../components/year/YearEventsList";
import { YearHeroCard } from "../components/year/YearHeroCard";
import { YearProgressPanel } from "../components/year/YearProgressPanel";
import { YearReflectionCard } from "../components/year/YearReflectionCard";

type YearEvent = {
  id: string;
  title: string;
  category: string;
  start_date: string;
  status: string;
  description?: string | null;
  savings_target?: number | null;
};

type Props = {
  year: number;
  events: YearEvent[];
  memoryCount: number;
  onOpenEvent: (eventId: string) => void;
};

export function YearViewPage({ year, events, memoryCount, onOpenEvent }: Props) {
  const completed = events.filter((event) => event.status === "completed").length;
  const inProgress = events.filter((event) => event.status === "in-progress").length;
  const savingsTarget = events.reduce((total, event) => total + (event.savings_target ?? 0), 0);
  const summary = events[0]?.description
    ? `A year shaped by ${events[0].description.toLowerCase()}.`
    : `A year focused on ${events.length > 0 ? "important life milestones and long-term preparation." : "laying down a new chapter."}`;
  const focus = events[0]?.title ?? "Define the main milestone for this year.";

  return (
    <div className="view-stack">
      <PageHeader
        eyebrow="Year view"
        title={String(year)}
        subtitle="What this year contains in your life plan, and why it matters."
      />
      <YearHeroCard year={year} summary={summary} bigFocus={focus} />
      <div className="workspace-grid">
        <div className="view-stack">
          <YearEventsList events={events} onOpenEvent={onOpenEvent} />
        </div>
        <div className="view-stack">
          <YearProgressPanel
            totalPlans={events.length}
            completed={completed}
            inProgress={inProgress}
            savingsTarget={savingsTarget}
            memories={memoryCount}
          />
        </div>
      </div>
      <YearReflectionCard reflection="Treat this year as a meaningful chapter, not just a sequence of tasks. Let it hold ambition, preparation, and memory together." />
    </div>
  );
}

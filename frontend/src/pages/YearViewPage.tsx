import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { YearEventsList } from "../components/year/YearEventsList";
import { YearHeroCard } from "../components/year/YearHeroCard";
import { YearProgressPanel } from "../components/year/YearProgressPanel";
import { YearReflectionCard } from "../components/year/YearReflectionCard";
import { useYearView } from "../hooks/useYearView";

export function YearViewPage() {
  const navigate = useNavigate();
  const params = useParams();
  const year = Number(params.year ?? new Date().getFullYear());
  const { events, summary, isLoading, error } = useYearView({ year });

  return (
    <div className="view-stack">
      <PageHeader
        eyebrow="Year view"
        title={String(year)}
        subtitle="What this year contains in your life plan, and why it matters."
      />
      {error && <p className="error panel">{error}</p>}
      {isLoading && <p className="loading panel">Loading year view...</p>}
      <YearHeroCard year={year} summary={summary.heroSummary} bigFocus={summary.focus} />
      <div className="workspace-grid">
        <div className="view-stack">
          <YearEventsList events={events} onOpenEvent={(eventId) => navigate(`/plans/${eventId}`)} />
        </div>
        <div className="view-stack">
          <YearProgressPanel
            totalPlans={summary.totalPlans}
            completed={summary.completed}
            inProgress={summary.inProgress}
            savingsTarget={summary.savingsTarget}
            memories={summary.memoryCount}
          />
        </div>
      </div>
      <YearReflectionCard reflection="Treat this year as a meaningful chapter, not just a sequence of tasks. Let it hold ambition, preparation, and memory together." />
    </div>
  );
}

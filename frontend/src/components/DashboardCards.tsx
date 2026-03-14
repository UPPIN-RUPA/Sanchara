type Props = {
  totalEvents: number;
  activePlans: number;
  upcomingMilestones: number;
  completedMilestones: number;
  lifeProgress: number;
};

export function DashboardCards({
  totalEvents,
  activePlans,
  upcomingMilestones,
  completedMilestones,
  lifeProgress,
}: Props) {
  return (
    <section className="cards editorial-cards dashboard-summary-cards">
      <article className="card editorial-card">
        <span className="stat-card-label">Active plans</span>
        <p>{activePlans}</p>
      </article>
      <article className="card editorial-card">
        <span className="stat-card-label">Upcoming milestones</span>
        <p>{upcomingMilestones}</p>
      </article>
      <article className="card editorial-card">
        <span className="stat-card-label">Completed milestones</span>
        <p>{completedMilestones}</p>
      </article>
      <article className="card editorial-card">
        <span className="stat-card-label">Life progress</span>
        <p>{lifeProgress}%</p>
      </article>
      <article className="card editorial-card wide-card">
        <span className="stat-card-label">Total plans mapped</span>
        <p>{totalEvents}</p>
      </article>
    </section>
  );
}

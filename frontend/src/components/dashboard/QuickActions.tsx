type Props = {
  onGoToPlans: () => void;
  onGoToTimeline: () => void;
  onGoToMemories: () => void;
  onGoToYear: () => void;
};

export function QuickActions({ onGoToPlans, onGoToTimeline, onGoToMemories, onGoToYear }: Props) {
  return (
    <article className="dashboard-card">
      <p className="section-kicker">Quick actions</p>
      <h3>Move the life plan forward</h3>
      <div className="quick-actions">
        <button type="button" onClick={onGoToPlans}>Add Plan</button>
        <button type="button" onClick={onGoToTimeline}>View Timeline</button>
        <button type="button" onClick={onGoToMemories}>Add Memory</button>
        <button type="button" className="timeline-secondary-button" onClick={onGoToYear}>Focus This Year</button>
      </div>
    </article>
  );
}

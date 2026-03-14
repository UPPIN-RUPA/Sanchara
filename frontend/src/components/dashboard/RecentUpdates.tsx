import type { ActivityItem } from "../../types/savings";

type Props = {
  items: ActivityItem[];
};

export function RecentUpdates({ items }: Props) {
  return (
    <article className="dashboard-card">
      <p className="section-kicker">Recent updates</p>
      <h3>Changes across your plans</h3>
      <div className="activity-feed">
        {items.map((item) => (
          <article key={item.id} className="activity-item">
            <strong>{item.title}</strong>
            <p>{item.detail}</p>
            <small>{item.date}</small>
          </article>
        ))}
        {items.length === 0 && <p>No recent updates yet.</p>}
      </div>
    </article>
  );
}

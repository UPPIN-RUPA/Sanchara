import type { ActivityItem } from "../../types/savings";

type Props = {
  items: ActivityItem[];
};

export function EventUpdates({ items }: Props) {
  return (
    <section className="panel section-panel">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Updates</p>
          <h3>Progress journal</h3>
        </div>
      </div>
      <div className="activity-feed">
        {items.map((item) => (
          <article key={item.id} className="activity-item">
            <strong>{item.title}</strong>
            <p>{item.detail}</p>
            <small>{item.date}</small>
          </article>
        ))}
        {items.length === 0 && <p>No updates recorded yet.</p>}
      </div>
    </section>
  );
}

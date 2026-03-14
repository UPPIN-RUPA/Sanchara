import type { EventItem } from "../../lib/api";

type Props = {
  event: EventItem;
};

export function EventOverview({ event }: Props) {
  return (
    <section className="panel section-panel">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Overview</p>
          <h3>The meaning and structure of this plan</h3>
        </div>
      </div>
      <div className="detail-grid">
        <article className="detail-card detail-card-wide">
          <h4>Description</h4>
          <p>{event.description || "No description yet."}</p>
        </article>
        <article className="detail-card">
          <h4>Category</h4>
          <p>{event.category}</p>
        </article>
        <article className="detail-card">
          <h4>Status</h4>
          <p>{event.status}</p>
        </article>
        <article className="detail-card">
          <h4>Start date</h4>
          <p>{event.start_date}</p>
        </article>
        <article className="detail-card">
          <h4>Target date</h4>
          <p>{event.end_date || "Open-ended"}</p>
        </article>
        <article className="detail-card detail-card-wide">
          <h4>Reflection</h4>
          <p>{event.notes || event.timeline_phase || "No reflection saved yet."}</p>
        </article>
      </div>
    </section>
  );
}

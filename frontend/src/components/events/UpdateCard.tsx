import type { EventUpdate } from "../../types/eventUpdate";

type Props = {
  item: EventUpdate;
  isSaving: boolean;
  onEdit: () => void;
  onDelete: () => Promise<void>;
};

export function UpdateCard({ item, isSaving, onEdit, onDelete }: Props) {
  return (
    <article className="detail-card detail-card-wide">
      <div className="timeline-meta-row">
        <span className="pill subtle">{item.update_type}</span>
        <span className="muted-text">{item.effective_date || item.created_at || "-"}</span>
      </div>
      <h4>{item.title}</h4>
      <p>{item.body}</p>
      <div className="plan-card-actions">
        <button type="button" className="timeline-secondary-button" onClick={onEdit}>Edit</button>
        <button type="button" className="ghost-danger" disabled={isSaving} onClick={() => void onDelete()}>Delete</button>
      </div>
    </article>
  );
}

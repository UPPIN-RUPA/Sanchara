import { useState } from "react";
import type { EventUpdate } from "../../types/eventUpdate";
import { UpdateCard } from "./UpdateCard";
import { UpdateEditor } from "./UpdateEditor";

type Props = {
  items: EventUpdate[];
  isSaving: boolean;
  onCreate: (payload: {
    title: string;
    body: string;
    update_type: EventUpdate["update_type"];
    effective_date?: string | null;
  }) => Promise<void>;
  onUpdate: (
    updateId: string,
    payload: {
      title: string;
      body: string;
      update_type: EventUpdate["update_type"];
      effective_date?: string | null;
    }
  ) => Promise<void>;
  onDelete: (updateId: string) => Promise<void>;
};

export function EventUpdates({ items, isSaving, onCreate, onUpdate, onDelete }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <section className="panel section-panel">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Updates</p>
          <h3>Progress journal</h3>
        </div>
      </div>
      <UpdateEditor isSaving={isSaving} submitLabel="Add Update" onSubmit={onCreate} />
      <div className="activity-feed">
        {items.map((item) => (
          <div key={item.id}>
            {editingId === item.id ? (
              <UpdateEditor
                initialValue={item}
                isSaving={isSaving}
                submitLabel="Save Update"
                onSubmit={async (payload) => {
                  await onUpdate(item.id, payload);
                  setEditingId(null);
                }}
              />
            ) : (
              <UpdateCard
                item={item}
                isSaving={isSaving}
                onEdit={() => setEditingId(item.id)}
                onDelete={() => onDelete(item.id)}
              />
            )}
          </div>
        ))}
        {items.length === 0 && <p>No updates recorded yet.</p>}
      </div>
    </section>
  );
}

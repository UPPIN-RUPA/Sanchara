import { useState } from "react";
import type { MemoryItem } from "../../lib/api";
import { AddMemoryForm } from "./AddMemoryForm";
import { MemoryEditor } from "./MemoryEditor";

type Props = {
  memories: MemoryItem[];
  isSaving: boolean;
  onCreate: (payload: {
    title: string;
    description?: string;
    memory_type?: "reflection" | "photo" | "video" | "document";
    asset_url?: string;
    captured_on?: string | null;
  }) => Promise<void>;
  onUpdate: (memoryId: string, payload: {
    title: string;
    description?: string;
    memory_type?: "reflection" | "photo" | "video" | "document";
    asset_url?: string;
    captured_on?: string | null;
  }) => Promise<void>;
  onDelete: (memoryId: string) => Promise<void>;
};

export function EventMemories({ memories, isSaving, onCreate, onUpdate, onDelete }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <section className="panel section-panel">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Memories</p>
          <h3>Moments attached to this plan</h3>
        </div>
        <p className="section-copy">{memories.length} captured</p>
      </div>
      <AddMemoryForm isSaving={isSaving} onCreate={onCreate} />
      <div className="plan-grid">
        {memories.map((memory) => (
          <article key={memory.id} className="plan-card archive-card">
            {editingId === memory.id ? (
              <MemoryEditor
                initialValue={memory}
                isSaving={isSaving}
                submitLabel="Save Memory"
                onSubmit={async (payload) => {
                  await onUpdate(memory.id, payload);
                  setEditingId(null);
                }}
              />
            ) : (
              <>
                <div className="timeline-meta-row">
                  <span className="pill subtle">{memory.memory_type}</span>
                  <span className="muted-text">{memory.captured_on || "-"}</span>
                </div>
                <h4>{memory.title}</h4>
                <p>{memory.description || "No description yet."}</p>
                {memory.asset_url && <small className="muted-text">{memory.asset_url}</small>}
                <div className="plan-card-actions">
                  <button type="button" className="timeline-secondary-button" onClick={() => setEditingId(memory.id)}>Edit</button>
                  <button
                    type="button"
                    className="ghost-danger"
                    disabled={isSaving}
                    onClick={() => {
                      if (window.confirm("Delete this memory from the plan?")) {
                        void onDelete(memory.id);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </article>
        ))}
        {memories.length === 0 && (
          <article className="plan-card archive-card empty-memory-card">
            <h4>This journey has no saved memories yet.</h4>
            <p>Capture moments that make this plan meaningful once photo, note, or document entries begin to accumulate.</p>
          </article>
        )}
      </div>
    </section>
  );
}

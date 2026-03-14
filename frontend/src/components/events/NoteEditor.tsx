import { useState, type FormEvent } from "react";

type Props = {
  notes: string;
  isSaving: boolean;
  onSaveNotes: (notes: string) => Promise<void>;
  onAddEntry: (entry: string) => Promise<void>;
};

export function NoteEditor({ notes, isSaving, onSaveNotes, onAddEntry }: Props) {
  const [draftNotes, setDraftNotes] = useState(notes);
  const [entry, setEntry] = useState("");

  async function handleEntrySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!entry.trim()) return;
    await onAddEntry(entry.trim());
    setEntry("");
  }

  return (
    <section className="panel section-panel">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Notes</p>
          <h3>Reflection and journal context</h3>
        </div>
      </div>
      <article className="detail-card detail-card-wide notes-card">
        <h4>Current note stack</h4>
        <textarea rows={10} value={draftNotes} onChange={(event) => setDraftNotes(event.target.value)} />
        <div className="plan-card-actions">
          <button type="button" disabled={isSaving} onClick={() => onSaveNotes(draftNotes)}>Save Notes</button>
        </div>
      </article>
      <form className="detail-inline-form" onSubmit={handleEntrySubmit}>
        <label className="form-field form-field-wide">
          <span>Add journal entry</span>
          <textarea rows={4} value={entry} placeholder="What changed in this plan today?" onChange={(event) => setEntry(event.target.value)} />
        </label>
        <button type="submit" disabled={isSaving || !entry.trim()}>Add Entry</button>
      </form>
    </section>
  );
}

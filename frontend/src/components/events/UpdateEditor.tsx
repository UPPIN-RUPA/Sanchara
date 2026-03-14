import { useState, type FormEvent } from "react";
import type { EventUpdate, EventUpdateType } from "../../types/eventUpdate";

type Props = {
  initialValue?: EventUpdate;
  isSaving: boolean;
  submitLabel: string;
  onSubmit: (payload: {
    title: string;
    body: string;
    update_type: EventUpdateType;
    effective_date?: string | null;
  }) => Promise<void>;
};

export function UpdateEditor({ initialValue, isSaving, submitLabel, onSubmit }: Props) {
  const [title, setTitle] = useState(initialValue?.title ?? "");
  const [body, setBody] = useState(initialValue?.body ?? "");
  const [updateType, setUpdateType] = useState<EventUpdateType>(initialValue?.update_type ?? "journal");
  const [effectiveDate, setEffectiveDate] = useState(initialValue?.effective_date ?? "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !body.trim()) return;
    await onSubmit({
      title: title.trim(),
      body: body.trim(),
      update_type: updateType,
      effective_date: effectiveDate || null,
    });
    if (!initialValue) {
      setTitle("");
      setBody("");
      setUpdateType("journal");
      setEffectiveDate("");
    }
  }

  return (
    <form className="detail-inline-form" onSubmit={handleSubmit}>
      <label className="form-field form-field-wide">
        <span>Title</span>
        <input value={title} placeholder="What changed?" onChange={(event) => setTitle(event.target.value)} />
      </label>
      <label className="form-field">
        <span>Type</span>
        <select value={updateType} onChange={(event) => setUpdateType(event.target.value as EventUpdateType)}>
          <option value="journal">journal</option>
          <option value="progress">progress</option>
          <option value="reflection">reflection</option>
          <option value="decision">decision</option>
          <option value="milestone_note">milestone note</option>
        </select>
      </label>
      <label className="form-field">
        <span>Effective date</span>
        <input type="date" value={effectiveDate ?? ""} onChange={(event) => setEffectiveDate(event.target.value)} />
      </label>
      <label className="form-field form-field-wide">
        <span>Entry</span>
        <textarea rows={4} value={body} placeholder="Capture the progress, decision, or reflection." onChange={(event) => setBody(event.target.value)} />
      </label>
      <button type="submit" disabled={isSaving || !title.trim() || !body.trim()}>{submitLabel}</button>
    </form>
  );
}

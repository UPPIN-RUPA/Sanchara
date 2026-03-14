import { useState, type FormEvent } from "react";
import type { MemoryItem } from "../../lib/api";

type Props = {
  initialValue?: MemoryItem;
  isSaving: boolean;
  submitLabel: string;
  onSubmit: (payload: {
    title: string;
    description?: string;
    memory_type?: "reflection" | "photo" | "video" | "document";
    asset_url?: string;
    captured_on?: string | null;
  }) => Promise<void>;
};

export function MemoryEditor({ initialValue, isSaving, submitLabel, onSubmit }: Props) {
  const [title, setTitle] = useState(initialValue?.title ?? "");
  const [description, setDescription] = useState(initialValue?.description ?? "");
  const [memoryType, setMemoryType] = useState<"reflection" | "photo" | "video" | "document">(initialValue?.memory_type ?? "reflection");
  const [capturedOn, setCapturedOn] = useState(initialValue?.captured_on ?? "");
  const [assetUrl, setAssetUrl] = useState(initialValue?.asset_url ?? "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    await onSubmit({
      title: title.trim(),
      description: description || undefined,
      memory_type: memoryType,
      captured_on: capturedOn || null,
      asset_url: assetUrl || undefined,
    });
    if (!initialValue) {
      setTitle("");
      setDescription("");
      setMemoryType("reflection");
      setCapturedOn("");
      setAssetUrl("");
    }
  }

  return (
    <form className="detail-inline-form" onSubmit={handleSubmit}>
      <label className="form-field form-field-wide">
        <span>Memory title</span>
        <input value={title} placeholder="First land visit" onChange={(event) => setTitle(event.target.value)} />
      </label>
      <label className="form-field">
        <span>Type</span>
        <select value={memoryType} onChange={(event) => setMemoryType(event.target.value as typeof memoryType)}>
          <option value="reflection">reflection</option>
          <option value="photo">photo</option>
          <option value="video">video</option>
          <option value="document">document</option>
        </select>
      </label>
      <label className="form-field">
        <span>Captured on</span>
        <input type="date" value={capturedOn || ""} onChange={(event) => setCapturedOn(event.target.value)} />
      </label>
      <label className="form-field form-field-wide">
        <span>Note</span>
        <input value={description} placeholder="What made this moment meaningful?" onChange={(event) => setDescription(event.target.value)} />
      </label>
      <label className="form-field form-field-wide">
        <span>Asset URL</span>
        <input value={assetUrl} placeholder="Optional link for now" onChange={(event) => setAssetUrl(event.target.value)} />
      </label>
      <button type="submit" disabled={isSaving || !title.trim()}>{submitLabel}</button>
    </form>
  );
}

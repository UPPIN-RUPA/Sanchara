import { MemoryEditor } from "./MemoryEditor";

type Props = {
  isSaving: boolean;
  onCreate: (payload: {
    title: string;
    description?: string;
    memory_type?: "reflection" | "photo" | "video" | "document";
    asset_url?: string;
    captured_on?: string | null;
  }) => Promise<void>;
};

export function AddMemoryForm({ isSaving, onCreate }: Props) {
  return <MemoryEditor isSaving={isSaving} submitLabel="Add Memory" onSubmit={onCreate} />;
}

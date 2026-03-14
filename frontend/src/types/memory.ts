export type MemoryType = "photo" | "note" | "video" | "voice";

export type Memory = {
  id: string;
  planId?: string;
  title: string;
  date: string;
  description?: string;
  imageUrl?: string;
  type: MemoryType;
};

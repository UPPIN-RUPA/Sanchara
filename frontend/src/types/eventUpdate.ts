export type EventUpdateType =
  | "journal"
  | "progress"
  | "reflection"
  | "decision"
  | "milestone_note";

export type EventUpdate = {
  id: string;
  event_id: string;
  user_id: string;
  title: string;
  body: string;
  update_type: EventUpdateType;
  effective_date?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
};

export type EventUpdateListResponse = {
  items: EventUpdate[];
};

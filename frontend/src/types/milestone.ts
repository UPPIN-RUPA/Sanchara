export type MilestoneStatus = "planned" | "in_progress" | "completed";

export type Milestone = {
  id: string;
  planId: string;
  title: string;
  targetDate?: string;
  status: MilestoneStatus;
  note?: string;
};

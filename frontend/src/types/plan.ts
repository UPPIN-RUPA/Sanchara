export type PlanCategory =
  | "career"
  | "personal"
  | "family"
  | "finance"
  | "health"
  | "travel"
  | "dreams";

export type PlanStatus =
  | "planned"
  | "in_progress"
  | "completed"
  | "paused";

export type Plan = {
  id: string;
  title: string;
  category: PlanCategory;
  description: string;
  startDate: string;
  targetDate: string;
  status: PlanStatus;
  progress: number;
  year: number;
  budgetTarget?: number;
  savedAmount?: number;
  reflection?: string;
  lifePhase?: string;
};

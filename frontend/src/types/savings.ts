export type SavingsGoal = {
  id: string;
  planId?: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  targetYear?: number;
};

export type ActivityItem = {
  id: string;
  title: string;
  detail: string;
  date: string;
  kind: "plan" | "memory" | "savings" | "milestone";
};

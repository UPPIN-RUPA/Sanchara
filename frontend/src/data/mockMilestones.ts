import type { Milestone } from "../types/milestone";

export const mockMilestones: Milestone[] = [
  { id: "milestone-1", planId: "plan-land", title: "Visit shortlisted villages", targetDate: "2035-06-20", status: "planned" },
  { id: "milestone-2", planId: "plan-land", title: "Evaluate groundwater and soil", targetDate: "2035-08-10", status: "planned" },
  { id: "milestone-3", planId: "plan-farm", title: "Begin water recharge work", targetDate: "2037-03-01", status: "planned" },
  { id: "milestone-4", planId: "plan-farm", title: "Plant first tree layer", targetDate: "2037-07-15", status: "planned" },
];

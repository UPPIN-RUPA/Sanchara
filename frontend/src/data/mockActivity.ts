import type { ActivityItem } from "../types/savings";

export const mockActivity: ActivityItem[] = [
  {
    id: "activity-memory",
    title: "Attached memory to land visit",
    detail: "Added the first site-visit note under Buy Agricultural Land.",
    date: "2034-07-12",
    kind: "memory",
  },
  {
    id: "activity-savings",
    title: "Updated land savings",
    detail: "Recorded another contribution toward the purchase fund.",
    date: "2034-08-03",
    kind: "savings",
  },
  {
    id: "activity-plan",
    title: "Created farm setup plan",
    detail: "Added a long-term ecosystem setup chapter to the life map.",
    date: "2035-01-15",
    kind: "plan",
  },
];

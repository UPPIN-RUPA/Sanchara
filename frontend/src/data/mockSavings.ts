import type { SavingsGoal } from "../types/savings";

export const mockSavings: SavingsGoal[] = [
  { id: "savings-marriage", planId: "plan-marriage", title: "Marriage Fund", targetAmount: 5000000, savedAmount: 1200000, targetYear: 2028 },
  { id: "savings-land", planId: "plan-land", title: "Land Purchase", targetAmount: 25000000, savedAmount: 4000000, targetYear: 2035 },
  { id: "savings-farm", planId: "plan-farm", title: "Farm Ecosystem", targetAmount: 40000000, savedAmount: 6000000, targetYear: 2040 },
];

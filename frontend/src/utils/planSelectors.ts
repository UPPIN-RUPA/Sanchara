import { mockActivity } from "../data/mockActivity";
import { mockMemories } from "../data/mockMemories";
import { mockMilestones } from "../data/mockMilestones";
import { mockPlans } from "../data/mockPlans";
import { mockSavings } from "../data/mockSavings";

export function getPlanById(planId: string) {
  return mockPlans.find((plan) => plan.id === planId);
}

export function getMilestonesByPlanId(planId: string) {
  return mockMilestones.filter((milestone) => milestone.planId === planId);
}

export function getMemoriesByPlanId(planId: string) {
  return mockMemories.filter((memory) => memory.planId === planId);
}

export function getSavingsByPlanId(planId: string) {
  return mockSavings.find((goal) => goal.planId === planId);
}

export function getActivityByPlanId(planId: string) {
  return mockActivity.filter((item) => item.planId === planId);
}

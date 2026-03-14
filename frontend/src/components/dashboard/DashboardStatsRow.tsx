import { DashboardCards } from "../DashboardCards";

type Props = {
  totalEvents: number;
  activePlans: number;
  upcomingMilestones: number;
  completedMilestones: number;
  lifeProgress: number;
};

export function DashboardStatsRow(props: Props) {
  return <DashboardCards {...props} />;
}

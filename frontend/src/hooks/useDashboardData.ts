import { useEffect, useMemo, useState } from "react";
import {
  getEvents,
  getFinancialSummary,
  getOverviewSummary,
  type EventItem,
  type FinancialSummary,
  type OverviewSummary,
} from "../lib/api";
import { mockActivity } from "../data/mockActivity";

function isUpcoming(event: EventItem): boolean {
  return new Date(event.start_date) >= new Date(new Date().toISOString().slice(0, 10));
}

function percentage(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function useDashboardData() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [overview, setOverview] = useState<OverviewSummary | null>(null);
  const [financial, setFinancial] = useState<FinancialSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    setIsLoading(true);
    setError("");
    try {
      const [eventData, overviewData, financialData] = await Promise.all([
        getEvents({ pageSize: 100 }),
        getOverviewSummary(),
        getFinancialSummary(),
      ]);
      setEvents(eventData.items);
      setOverview(overviewData);
      setFinancial(financialData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const model = useMemo(() => {
    const upcomingEvents = events.filter(isUpcoming).slice(0, 4);
    const recentEvents = [...events]
      .sort((a, b) => (b.updated_at ?? b.start_date).localeCompare(a.updated_at ?? a.start_date))
      .slice(0, 4);
    const completedEvents = events.filter((event) => event.status === "completed");
    const activePlans = events.filter((event) => event.status !== "completed");
    const totalEvents = overview?.total_events ?? events.length;
    const completedCount = overview?.by_status?.completed ?? completedEvents.length;
    const currentYear = new Date().getFullYear();
    const currentYearEvents = events.filter((event) => new Date(event.start_date).getFullYear() === currentYear);
    const activity =
      recentEvents.length > 0
        ? recentEvents.slice(0, 3).map((event, index) => ({
            id: `event-${event.id}`,
            title: index === 0 ? `Updated ${event.title}` : `Revisited ${event.title}`,
            detail: event.description || event.timeline_phase || "Plan details were updated in the workspace.",
            date: event.updated_at ?? event.start_date,
            kind: "plan" as const,
          }))
        : mockActivity;

    return {
      totalEvents,
      activePlansCount: activePlans.length,
      upcomingMilestonesCount: upcomingEvents.length,
      completedMilestonesCount: completedCount,
      lifeProgress: percentage(completedCount, totalEvents),
      focusText: upcomingEvents[0]?.title ?? "Your next chapter",
      upcomingEvents,
      currentYear,
      currentYearEvents,
      activity,
      financial,
    };
  }, [events, overview, financial]);

  return {
    ...model,
    isLoading,
    error,
    refresh,
  };
}

import { useEffect, useMemo, useState } from "react";
import { getEvents, getMemories, type EventItem } from "../lib/api";

type Params = {
  year: number;
};

export function useYearView({ year }: Params) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [memoryCount, setMemoryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    setIsLoading(true);
    setError("");
    try {
      const eventResponse = await getEvents({ year: String(year), pageSize: 100 });
      setEvents(eventResponse.items);

      const memoryResponses = await Promise.all(
        eventResponse.items.map(async (event) => {
          try {
            const response = await getMemories(event.id);
            return response.items.length;
          } catch {
            return 0;
          }
        })
      );
      setMemoryCount(memoryResponses.reduce((total, count) => total + count, 0));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load year view.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, [year]);

  const summary = useMemo(() => {
    const completed = events.filter((event) => event.status === "completed").length;
    const inProgress = events.filter((event) => event.status === "in-progress").length;
    const savingsTarget = events.reduce((total, event) => total + (event.savings_target ?? 0), 0);
    const totalSaved = events.reduce((total, event) => total + (event.amount_saved ?? 0), 0);
    const heroSummary = events[0]?.description
      ? `A year shaped by ${events[0].description.toLowerCase()}.`
      : `A year focused on ${events.length > 0 ? "important life milestones and long-term preparation." : "laying down a new chapter."}`;
    const focus = events[0]?.title ?? "Define the main milestone for this year.";

    return {
      totalPlans: events.length,
      completed,
      inProgress,
      savingsTarget,
      totalSaved,
      memoryCount,
      heroSummary,
      focus,
    };
  }, [events, memoryCount]);

  return {
    year,
    events,
    summary,
    isLoading,
    error,
    refresh,
  };
}

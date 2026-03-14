import { useEffect, useMemo, useState } from "react";
import { getEvents, type EventItem } from "../lib/api";

export function useArchiveData() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    setIsLoading(true);
    setError("");
    try {
      const response = await getEvents({ pageSize: 100 });
      setEvents(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load archive.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const archivedEvents = useMemo(
    () =>
      events
        .filter((event) => event.status === "completed")
        .sort((a, b) => (b.updated_at ?? b.start_date).localeCompare(a.updated_at ?? a.start_date)),
    [events]
  );

  return {
    events: archivedEvents,
    isLoading,
    error,
    refresh,
  };
}

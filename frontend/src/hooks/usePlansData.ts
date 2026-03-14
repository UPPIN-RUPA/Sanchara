import { useEffect, useMemo, useState } from "react";
import { getEvents, type EventItem } from "../lib/api";

function matchesPlanSearch(event: EventItem, query: string): boolean {
  const haystack = [
    event.title,
    event.category,
    event.description ?? "",
    event.timeline_phase ?? "",
    event.notes ?? "",
    event.priority,
    event.status,
    event.start_date,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

export function usePlansData() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    setIsLoading(true);
    setError("");
    try {
      const response = await getEvents({ pageSize: 100 });
      setEvents(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load plans.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(events.map((event) => event.category))).sort(),
    [events]
  );

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (status && event.status !== status) return false;
      if (category && event.category !== category) return false;
      if (query.trim() && !matchesPlanSearch(event, query.trim())) return false;
      return true;
    });
  }, [category, events, query, status]);

  return {
    events: filteredEvents,
    query,
    status,
    category,
    categories,
    isLoading,
    error,
    setQuery,
    setStatus,
    setCategory,
    refresh,
  };
}

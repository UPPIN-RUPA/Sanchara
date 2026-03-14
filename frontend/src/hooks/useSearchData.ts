import { useEffect, useMemo, useState } from "react";
import { getEvents, type EventItem } from "../lib/api";

function matchesSearch(event: EventItem, query: string): boolean {
  const yearLabel = new Date(event.start_date).getFullYear().toString();
  const haystack = [
    event.title,
    event.category,
    event.description ?? "",
    event.notes ?? "",
    event.timeline_phase ?? "",
    yearLabel,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

export function useSearchData() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    setIsLoading(true);
    setError("");
    try {
      const response = await getEvents({ pageSize: 100 });
      setEvents(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load searchable plans.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return events.filter((event) => matchesSearch(event, query.trim()));
  }, [events, query]);

  return {
    query,
    results,
    isLoading,
    error,
    setQuery,
    refresh,
  };
}

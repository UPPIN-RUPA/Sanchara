import { useEffect, useMemo, useState } from "react";
import { getEvents, getMemories, type EventItem, type MemoryItem } from "../lib/api";

export function useTimelineData() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [memoriesByEvent, setMemoriesByEvent] = useState<Record<string, MemoryItem[]>>({});
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    setIsLoading(true);
    setError("");
    try {
      const eventResponse = await getEvents({ pageSize: 100 });
      setEvents(eventResponse.items);

      const memoryEntries = await Promise.all(
        eventResponse.items.slice(0, 12).map(async (event) => {
          try {
            const response = await getMemories(event.id);
            return [event.id, response.items] as const;
          } catch {
            return [event.id, []] as const;
          }
        })
      );
      setMemoriesByEvent(Object.fromEntries(memoryEntries));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load timeline.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) ?? null,
    [events, selectedEventId]
  );

  return {
    events,
    memoriesByEvent,
    selectedEventId,
    selectedEvent,
    isLoading,
    error,
    setSelectedEventId,
    refresh,
  };
}

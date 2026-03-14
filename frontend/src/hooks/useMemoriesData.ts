import { useEffect, useMemo, useState } from "react";
import { getEvents, getMemories, type EventItem, type MemoryItem } from "../lib/api";

type MemoryRow = {
  event: EventItem;
  memory: MemoryItem;
};

export function useMemoriesData() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [memoryMap, setMemoryMap] = useState<Record<string, MemoryItem[]>>({});
  const [query, setQuery] = useState("");
  const [memoryType, setMemoryType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    setIsLoading(true);
    setError("");
    try {
      const eventResponse = await getEvents({ pageSize: 100 });
      setEvents(eventResponse.items);

      const memoryResults = await Promise.all(
        eventResponse.items.map(async (event) => {
          try {
            const response = await getMemories(event.id);
            return [event.id, response.items] as const;
          } catch {
            return [event.id, []] as const;
          }
        })
      );
      setMemoryMap(Object.fromEntries(memoryResults));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load memories.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const memoryRows = useMemo<MemoryRow[]>(() => {
    return events
      .flatMap((event) => (memoryMap[event.id] ?? []).map((memory) => ({ event, memory })))
      .sort((a, b) => (b.memory.captured_on ?? "").localeCompare(a.memory.captured_on ?? ""));
  }, [events, memoryMap]);

  const filteredRows = useMemo(() => {
    return memoryRows.filter(({ event, memory }) => {
      if (memoryType && memory.memory_type !== memoryType) return false;
      if (!query.trim()) return true;

      const haystack = [
        memory.title,
        memory.description ?? "",
        memory.memory_type,
        event.title,
        event.category,
        memory.captured_on ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query.trim().toLowerCase());
    });
  }, [memoryRows, memoryType, query]);

  const memoryTypes = useMemo(
    () =>
      Array.from(new Set(memoryRows.map(({ memory }) => memory.memory_type))).sort(),
    [memoryRows]
  );

  return {
    rows: filteredRows,
    query,
    memoryType,
    memoryTypes,
    isLoading,
    error,
    setQuery,
    setMemoryType,
    refresh,
  };
}

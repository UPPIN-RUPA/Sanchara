import { useEffect, useMemo, useState } from "react";
import {
  createEventUpdate,
  createMemory,
  createTask,
  deleteEventUpdate,
  deleteMemory,
  deleteTask,
  getEvent,
  getEventUpdates,
  getMemories,
  getTasks,
  updateEvent,
  updateEventUpdate,
  updateMemory,
  updateTask,
  type CreateEventUpdatePayload,
  type CreateMemoryPayload,
  type CreateTaskPayload,
  type EventItem,
  type UpdateEventPayload,
  type UpdateEventUpdatePayload,
  type UpdateMemoryPayload,
  type UpdateTaskPayload,
} from "../lib/api";

type Params = {
  eventId?: string;
  onEventUpdated?: (event: EventItem) => void;
  onWorkspaceRefresh?: () => Promise<void> | void;
};

function progressForEvent(event: EventItem): number {
  if (event.is_financial) return Math.min(100, Math.max(0, event.savings_progress_pct ?? 0));
  if (event.status === "completed") return 100;
  if (event.status === "in-progress") return 56;
  return 18;
}

export function useEventDetail({ eventId, onEventUpdated, onWorkspaceRefresh }: Params) {
  const [event, setEvent] = useState<EventItem | null>(null);
  const [tasks, setTasks] = useState<Awaited<ReturnType<typeof getTasks>>["items"]>([]);
  const [memories, setMemories] = useState<Awaited<ReturnType<typeof getMemories>>["items"]>([]);
  const [updates, setUpdates] = useState<Awaited<ReturnType<typeof getEventUpdates>>["items"]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function refresh() {
    if (!eventId) {
      setEvent(null);
      setTasks([]);
      setMemories([]);
      setUpdates([]);
      return;
    }

    setIsLoading(true);
    try {
      const [eventResponse, taskResponse, memoryResponse, updateResponse] = await Promise.all([
        getEvent(eventId),
        getTasks(eventId),
        getMemories(eventId),
        getEventUpdates(eventId),
      ]);
      setEvent(eventResponse);
      setTasks(taskResponse.items);
      setMemories(memoryResponse.items);
      setUpdates(updateResponse.items);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, [eventId]);

  const summary = useMemo(() => {
    if (!event) {
      return {
        completedMilestones: 0,
        savedAmount: 0,
        targetAmount: 0,
        remainingAmount: 0,
        progress: 0,
      };
    }

    const completedMilestones = tasks.filter((task) => task.status === "completed").length;
    const savedAmount = event.amount_saved ?? 0;
    const targetAmount = event.savings_target ?? 0;

    return {
      completedMilestones,
      savedAmount,
      targetAmount,
      remainingAmount: Math.max(targetAmount - savedAmount, 0),
      progress: progressForEvent(event),
    };
  }, [event, tasks]);

  async function mutate<T>(work: () => Promise<T>): Promise<T> {
    setIsSaving(true);
    try {
      return await work();
    } finally {
      setIsSaving(false);
    }
  }

  async function saveEvent(payload: UpdateEventPayload) {
    if (!eventId) return;
    await mutate(async () => {
      const updated = await updateEvent(eventId, payload);
      setEvent(updated);
      onEventUpdated?.(updated);
      return updated;
    });
  }

  return {
    event,
    tasks,
    memories,
    updates,
    isLoading,
    isSaving,
    summary,
    saveEvent,
    addMilestone: (payload: CreateTaskPayload) =>
      mutate(async () => {
        if (!eventId) return;
        await createTask(eventId, payload);
        await refresh();
      }),
    updateMilestone: (taskId: string, payload: UpdateTaskPayload) =>
      mutate(async () => {
        if (!eventId) return;
        await updateTask(eventId, taskId, payload);
        await refresh();
      }),
    deleteMilestone: (taskId: string) =>
      mutate(async () => {
        if (!eventId) return;
        await deleteTask(eventId, taskId);
        await refresh();
      }),
    addMemory: (payload: CreateMemoryPayload) =>
      mutate(async () => {
        if (!eventId) return;
        await createMemory(eventId, payload);
        await refresh();
        await onWorkspaceRefresh?.();
      }),
    updateMemoryItem: (memoryId: string, payload: UpdateMemoryPayload) =>
      mutate(async () => {
        if (!eventId) return;
        await updateMemory(eventId, memoryId, payload);
        await refresh();
        await onWorkspaceRefresh?.();
      }),
    deleteMemoryItem: (memoryId: string) =>
      mutate(async () => {
        if (!eventId) return;
        await deleteMemory(eventId, memoryId);
        await refresh();
        await onWorkspaceRefresh?.();
      }),
    addUpdate: (payload: CreateEventUpdatePayload) =>
      mutate(async () => {
        if (!eventId) return;
        await createEventUpdate(eventId, payload);
        await refresh();
      }),
    updateUpdateItem: (updateId: string, payload: UpdateEventUpdatePayload) =>
      mutate(async () => {
        if (!eventId) return;
        await updateEventUpdate(eventId, updateId, payload);
        await refresh();
      }),
    deleteUpdateItem: (updateId: string) =>
      mutate(async () => {
        if (!eventId) return;
        await deleteEventUpdate(eventId, updateId);
        await refresh();
      }),
  };
}

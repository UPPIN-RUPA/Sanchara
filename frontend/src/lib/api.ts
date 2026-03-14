import type {
  EventUpdate,
  EventUpdateListResponse,
  EventUpdateType,
} from "../types/eventUpdate";
import type { AuthResponse, AuthUser, LoginPayload, SignupPayload } from "../types/auth";

export type EventItem = {
  id: string;
  user_id: string;
  title: string;
  category: string;
  start_date: string;
  end_date?: string | null;
  description?: string | null;
  notes?: string | null;
  status: "planned" | "in-progress" | "completed";
  priority: "low" | "medium" | "high" | "critical";
  timeline_phase?: string | null;
  is_financial: boolean;
  estimated_cost?: number | null;
  savings_target?: number | null;
  actual_cost?: number | null;
  amount_saved?: number | null;
  savings_progress_pct?: number | null;
  is_fully_funded?: boolean | null;
  linked_event_ids?: string[];
  created_at?: string;
  updated_at?: string;
};

export type UpdateEventPayload = {
  title?: string;
  category?: string;
  start_date?: string;
  end_date?: string | null;
  description?: string | null;
  notes?: string | null;
  status?: "planned" | "in-progress" | "completed";
  priority?: "low" | "medium" | "high" | "critical";
  timeline_phase?: string | null;
  is_financial?: boolean;
  estimated_cost?: number | null;
  savings_target?: number | null;
  actual_cost?: number | null;
  amount_saved?: number | null;
  linked_event_ids?: string[] | null;
};

export type TaskItem = {
  id: string;
  event_id: string;
  user_id: string;
  title: string;
  notes?: string | null;
  due_date?: string | null;
  status: "pending" | "completed";
  priority: "low" | "medium" | "high";
  created_at?: string;
  updated_at?: string;
};

export type TaskListResponse = {
  items: TaskItem[];
};

export type CreateTaskPayload = {
  title: string;
  notes?: string;
  due_date?: string;
  priority?: "low" | "medium" | "high";
};

export type UpdateTaskPayload = {
  title?: string;
  notes?: string;
  due_date?: string | null;
  status?: "pending" | "completed";
  priority?: "low" | "medium" | "high";
};

export type MemoryItem = {
  id: string;
  event_id: string;
  user_id: string;
  title: string;
  description?: string | null;
  memory_type: "reflection" | "photo" | "video" | "document";
  asset_url?: string | null;
  captured_on?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type MemoryListResponse = {
  items: MemoryItem[];
};

export type CreateMemoryPayload = {
  title: string;
  description?: string;
  memory_type?: "reflection" | "photo" | "video" | "document";
  asset_url?: string;
  captured_on?: string;
};

export type UpdateMemoryPayload = {
  title?: string;
  description?: string | null;
  memory_type?: "reflection" | "photo" | "video" | "document";
  asset_url?: string | null;
  captured_on?: string | null;
};

export type CreateEventUpdatePayload = {
  title: string;
  body: string;
  update_type?: EventUpdateType;
  effective_date?: string | null;
};

export type UpdateEventUpdatePayload = {
  title?: string;
  body?: string;
  update_type?: EventUpdateType;
  effective_date?: string | null;
};

export type EventListResponse = {
  items: EventItem[];
  page: number;
  page_size: number;
  total: number;
};

export type OverviewSummary = {
  total_events: number;
  by_status: Record<string, number>;
  by_timeline_phase: Record<string, number>;
};

export type FinancialSummary = {
  total_savings_target: number;
  total_amount_saved: number;
  fully_funded_events: number;
  upcoming_financial_events: number;
  next_years: number;
};

export type CreateEventPayload = {
  title: string;
  category: string;
  start_date: string;
  status: "planned" | "in-progress" | "completed";
  priority: "low" | "medium" | "high" | "critical";
  timeline_phase?: string;
  is_financial: boolean;
  estimated_cost?: number;
  savings_target?: number;
  amount_saved?: number;
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";
let accessToken: string | null = null;

export function setApiAccessToken(token: string | null) {
  accessToken = token;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const json = (await response.json()) as { detail?: string };
      message = json.detail ?? message;
    } else {
      const body = await response.text();
      if (body) message = body;
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function signupUser(payload: SignupPayload): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getCurrentUser(): Promise<AuthUser> {
  return request<AuthUser>("/auth/me");
}

export function getEvents(
  params: { status?: string; category?: string; year?: string; page?: number; pageSize?: number } = {}
): Promise<EventListResponse> {
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  if (params.category) search.set("category", params.category);
  if (params.year) search.set("year", params.year);
  search.set("page", String(params.page ?? 1));
  search.set("page_size", String(params.pageSize ?? 100));
  search.set("sort_by", "start_date");
  search.set("sort_order", "asc");
  const query = search.toString();
  return request<EventListResponse>(`/events${query ? `?${query}` : ""}`);
}

export function getEvent(eventId: string): Promise<EventItem> {
  return request<EventItem>(`/events/${eventId}`);
}

export function createEvent(payload: CreateEventPayload): Promise<EventItem> {
  return request<EventItem>("/events", { method: "POST", body: JSON.stringify(payload) });
}

export function updateEvent(eventId: string, payload: UpdateEventPayload): Promise<EventItem> {
  return request<EventItem>(`/events/${eventId}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function deleteEvent(eventId: string): Promise<void> {
  return request<void>(`/events/${eventId}`, { method: "DELETE" });
}

export function getTasks(eventId: string): Promise<TaskListResponse> {
  return request<TaskListResponse>(`/events/${eventId}/tasks`);
}

export function createTask(eventId: string, payload: CreateTaskPayload): Promise<TaskItem> {
  return request<TaskItem>(`/events/${eventId}/tasks`, { method: "POST", body: JSON.stringify(payload) });
}

export function updateTask(eventId: string, taskId: string, payload: UpdateTaskPayload): Promise<TaskItem> {
  return request<TaskItem>(`/events/${eventId}/tasks/${taskId}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function deleteTask(eventId: string, taskId: string): Promise<void> {
  return request<void>(`/events/${eventId}/tasks/${taskId}`, { method: "DELETE" });
}

export function getMemories(eventId: string): Promise<MemoryListResponse> {
  return request<MemoryListResponse>(`/events/${eventId}/memories`);
}

export function createMemory(eventId: string, payload: CreateMemoryPayload): Promise<MemoryItem> {
  return request<MemoryItem>(`/events/${eventId}/memories`, { method: "POST", body: JSON.stringify(payload) });
}

export function updateMemory(eventId: string, memoryId: string, payload: UpdateMemoryPayload): Promise<MemoryItem> {
  return request<MemoryItem>(`/events/${eventId}/memories/${memoryId}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function deleteMemory(eventId: string, memoryId: string): Promise<void> {
  return request<void>(`/events/${eventId}/memories/${memoryId}`, { method: "DELETE" });
}

export function getOverviewSummary(): Promise<OverviewSummary> {
  return request<OverviewSummary>("/summary/overview");
}

export function getFinancialSummary(): Promise<FinancialSummary> {
  return request<FinancialSummary>("/summary/financial?next_years=5");
}

export function getEventUpdates(eventId: string): Promise<EventUpdateListResponse> {
  return request<EventUpdateListResponse>(`/events/${eventId}/updates`);
}

export function createEventUpdate(
  eventId: string,
  payload: CreateEventUpdatePayload
): Promise<EventUpdate> {
  return request<EventUpdate>(`/events/${eventId}/updates`, { method: "POST", body: JSON.stringify(payload) });
}

export function updateEventUpdate(
  eventId: string,
  updateId: string,
  payload: UpdateEventUpdatePayload
): Promise<EventUpdate> {
  return request<EventUpdate>(`/events/${eventId}/updates/${updateId}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function deleteEventUpdate(eventId: string, updateId: string): Promise<void> {
  return request<void>(`/events/${eventId}/updates/${updateId}`, { method: "DELETE" });
}

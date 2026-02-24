export type EventItem = {
  id: string;
  user_id: string;
  title: string;
  category: string;
  start_date: string;
  end_date?: string | null;
  status: "planned" | "in-progress" | "completed";
  priority: "low" | "medium" | "high" | "critical";
  timeline_phase?: string | null;
  is_financial: boolean;
  savings_target?: number | null;
  amount_saved?: number | null;
  savings_progress_pct?: number | null;
  is_fully_funded?: boolean | null;
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

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

async function request<T>(
  path: string,
  userId: string,
  init?: RequestInit
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": userId,
        ...(init?.headers ?? {}),
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Network error while contacting backend";
    throw new ApiError(
      0,
      `${message}. Check backend is running and VITE_API_BASE_URL=${API_BASE}`
    );
  }

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const json = (await response.json()) as { detail?: string };
      message = json.detail ?? message;
    } else {
      const body = await response.text();
      if (body) {
        message = body;
      }
    }

    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function getEvents(
  userId: string,
  params: { status?: string; category?: string; year?: string; page?: number } = {}
): Promise<EventListResponse> {
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  if (params.category) search.set("category", params.category);
  if (params.year) search.set("year", params.year);
  search.set("page", String(params.page ?? 1));
  search.set("page_size", "10");
  search.set("sort_by", "start_date");
  search.set("sort_order", "asc");
  const query = search.toString();
  return request<EventListResponse>(`/events${query ? `?${query}` : ""}`, userId);
}

export function createEvent(
  userId: string,
  payload: CreateEventPayload
): Promise<EventItem> {
  return request<EventItem>("/events", userId, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteEvent(userId: string, eventId: string): Promise<void> {
  return request<void>(`/events/${eventId}`, userId, { method: "DELETE" });
}

export function getOverviewSummary(userId: string): Promise<OverviewSummary> {
  return request<OverviewSummary>("/summary/overview", userId);
}

export function getFinancialSummary(userId: string): Promise<FinancialSummary> {
  return request<FinancialSummary>("/summary/financial?next_years=5", userId);
}

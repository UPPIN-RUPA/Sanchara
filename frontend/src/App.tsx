import { useEffect, useMemo, useState } from "react";
import { DashboardCards } from "./components/DashboardCards";
import { EventDetailsPanel } from "./components/EventDetailsPanel";
import { EventForm } from "./components/EventForm";
import {
  ApiError,
  createEvent,
  deleteEvent,
  getEvent,
  getEvents,
  getFinancialSummary,
  getOverviewSummary,
  type CreateEventPayload,
  type EventItem,
  type EventListResponse,
  type FinancialSummary,
  type OverviewSummary,
} from "./lib/api";

type GroupedEvents = Record<string, EventItem[]>;

const QUICK_USERS = ["demo-user", "rupa", "alex"];

function toYear(dateIso: string): string {
  return new Date(dateIso).getFullYear().toString();
}

function groupedByYear(items: EventItem[]): GroupedEvents {
  return items.reduce<GroupedEvents>((acc, event) => {
    const year = toYear(event.start_date);
    acc[year] = acc[year] ?? [];
    acc[year].push(event);
    return acc;
  }, {});
}

export function App() {
  const [userId, setUserId] = useState("demo-user");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [year, setYear] = useState("");
  const [page, setPage] = useState(1);
  const [events, setEvents] = useState<EventListResponse | null>(null);
  const [overview, setOverview] = useState<OverviewSummary | null>(null);
  const [financial, setFinancial] = useState<FinancialSummary | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [detailError, setDetailError] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const totalPages = useMemo(() => {
    if (!events) return 1;
    return Math.max(1, Math.ceil(events.total / events.page_size));
  }, [events]);

  const groupedEvents = useMemo(
    () => groupedByYear(events?.items ?? []),
    [events?.items]
  );

  async function refresh() {
    try {
      setIsLoading(true);
      setError("");
      const [eventData, overviewData, financialData] = await Promise.all([
        getEvents(userId, {
          status: status || undefined,
          category: category || undefined,
          year: year || undefined,
          page,
        }),
        getOverviewSummary(userId),
        getFinancialSummary(userId),
      ]);
      setEvents(eventData);
      setOverview(overviewData);
      setFinancial(financialData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, [userId, status, category, year, page]);

  useEffect(() => {
    if (!selectedEventId) {
      setSelectedEvent(null);
      setDetailError("");
      return;
    }

    const selectedId = selectedEventId;
    let cancelled = false;

    async function loadEvent() {
      try {
        setIsDetailLoading(true);
        setDetailError("");
        const event = await getEvent(userId, selectedId);
        if (!cancelled) {
          setSelectedEvent(event);
        }
      } catch (err) {
        if (!cancelled) {
          setSelectedEvent(null);
          setDetailError(
            err instanceof Error ? err.message : "Failed to load event details"
          );
        }
      } finally {
        if (!cancelled) {
          setIsDetailLoading(false);
        }
      }
    }

    void loadEvent();

    return () => {
      cancelled = true;
    };
  }, [selectedEventId, userId]);

  useEffect(() => {
    if (!selectedEventId) {
      return;
    }

    const hasSelectedEvent = events?.items.some((event) => event.id === selectedEventId);
    if (!hasSelectedEvent) {
      setSelectedEventId(null);
      setSelectedEvent(null);
      setDetailError("");
    }
  }, [events, selectedEventId]);

  async function handleCreate(payload: CreateEventPayload): Promise<string | null> {
    try {
      await createEvent(userId, payload);
      await refresh();
      return null;
    } catch (err) {
      if (err instanceof ApiError) {
        return err.message;
      }
      return "Failed to create event.";
    }
  }

  async function handleDelete(id: string) {
    try {
      setError("");
      if (selectedEventId === id) {
        setSelectedEventId(null);
        setSelectedEvent(null);
        setDetailError("");
      }
      await deleteEvent(userId, id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete event");
    }
  }

  return (
    <main className="container">
      <header className="topbar">
        <h1>Sanchara</h1>
        <div className="row user-controls">
          <label>
            Quick user
            <select
              value={QUICK_USERS.includes(userId) ? userId : "custom"}
              onChange={(e) => {
                if (e.target.value !== "custom") {
                  setPage(1);
                  setSelectedEventId(null);
                  setUserId(e.target.value);
                }
              }}
            >
              {QUICK_USERS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
              <option value="custom">custom</option>
            </select>
          </label>
          <label>
            User id
            <input
              value={userId}
              onChange={(e) => {
                setPage(1);
                setSelectedEventId(null);
                setUserId(e.target.value || "demo-user");
              }}
            />
          </label>
        </div>
      </header>

      <DashboardCards overview={overview} financial={financial} />

      <section className="panel filters">
        <h3>Filters</h3>
        <div className="row">
          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setSelectedEventId(null);
              setStatus(e.target.value);
            }}
          >
            <option value="">all status</option>
            <option value="planned">planned</option>
            <option value="in-progress">in-progress</option>
            <option value="completed">completed</option>
          </select>
          <input
            placeholder="category"
            value={category}
            onChange={(e) => {
              setPage(1);
              setSelectedEventId(null);
              setCategory(e.target.value);
            }}
          />
          <input
            placeholder="year"
            value={year}
            onChange={(e) => {
              setPage(1);
              setSelectedEventId(null);
              setYear(e.target.value);
            }}
          />
        </div>
      </section>

      <EventForm onSubmit={handleCreate} />

      <section className="workspace-grid">
        <section className="panel">
          <h3>Events</h3>
          {isLoading && <p className="loading">Loading data...</p>}
          {error && <p className="error">{error}</p>}
          {!isLoading && !events?.items?.length && (
            <p>No events yet. Add your first life event ✨</p>
          )}

          {Object.entries(groupedEvents)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([groupYear, yearEvents]) => (
              <div key={groupYear} className="year-group">
                <h4>{groupYear}</h4>
                <ul className="event-list">
                  {yearEvents.map((event) => {
                    const isSelected = event.id === selectedEventId;

                    return (
                      <li key={event.id} className={isSelected ? "event-list-item selected" : "event-list-item"}>
                        <button
                          type="button"
                          className="event-button"
                          onClick={() => setSelectedEventId(event.id)}
                        >
                          <div>
                            <strong>{event.title}</strong>
                            <p>
                              {event.start_date} · {event.status} · {event.priority}
                            </p>
                            <p>{event.timeline_phase || "-"}</p>
                            {event.is_financial && (
                              <div className="finance-meta">
                                <span
                                  className={`badge ${
                                    event.is_fully_funded ? "badge-funded" : "badge-progress"
                                  }`}
                                >
                                  {event.is_fully_funded ? "Fully funded" : "Funding in progress"}
                                </span>
                                <div className="progress-wrap">
                                  <div
                                    className="progress-bar"
                                    style={{ width: `${event.savings_progress_pct ?? 0}%` }}
                                  />
                                </div>
                                <small>{event.savings_progress_pct ?? 0}%</small>
                              </div>
                            )}
                          </div>
                        </button>
                        <button type="button" onClick={() => void handleDelete(event.id)}>
                          Delete
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

          <div className="row">
            <button
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <span>
              Page {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </section>

        <section>
          {!selectedEventId && (
            <aside className="panel detail-empty-state">
              <h3>Select an event</h3>
              <p>
                Choose a milestone from the timeline list to open overview, savings,
                and notes details.
              </p>
            </aside>
          )}
          {isDetailLoading && selectedEventId && (
            <aside className="panel detail-empty-state">
              <h3>Loading event</h3>
              <p className="loading">Fetching the selected milestone...</p>
            </aside>
          )}
          {detailError && !isDetailLoading && (
            <aside className="panel detail-empty-state">
              <h3>Unable to load details</h3>
              <p className="error">{detailError}</p>
            </aside>
          )}
          {selectedEvent && !isDetailLoading && !detailError && (
            <EventDetailsPanel
              key={selectedEvent.id}
              event={selectedEvent}
              userId={userId}
              onClose={() => {
                setSelectedEventId(null);
                setSelectedEvent(null);
                setDetailError("");
              }}
            />
          )}
        </section>
      </section>
    </main>
  );
}

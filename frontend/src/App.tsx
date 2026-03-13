import { useEffect, useMemo, useState } from "react";
import { DashboardCards } from "./components/DashboardCards";
import { EventDetailsPanel } from "./components/EventDetailsPanel";
import { EventForm } from "./components/EventForm";
import { MemoriesBoard } from "./components/MemoriesBoard";
import { SidebarNav } from "./components/SidebarNav";
import { SavingsBoard } from "./components/SavingsBoard";
import { TimelineBoard } from "./components/TimelineBoard";
import {
  ApiError,
  createEvent,
  deleteEvent,
  getEvent,
  getEvents,
  getFinancialSummary,
  getMemories,
  getOverviewSummary,
  type CreateEventPayload,
  type EventItem,
  type EventListResponse,
  type FinancialSummary,
  type MemoryItem,
  type OverviewSummary,
} from "./lib/api";

type View = "dashboard" | "timeline" | "savings" | "memories";

const QUICK_USERS = ["demo-user", "rupa", "alex"];

function isUpcoming(event: EventItem): boolean {
  return new Date(event.start_date) >= new Date(new Date().toISOString().slice(0, 10));
}

export function App() {
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [userId, setUserId] = useState("demo-user");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [year, setYear] = useState("");
  const [events, setEvents] = useState<EventListResponse | null>(null);
  const [overview, setOverview] = useState<OverviewSummary | null>(null);
  const [financial, setFinancial] = useState<FinancialSummary | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [memoriesByEvent, setMemoriesByEvent] = useState<Record<string, MemoryItem[]>>({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const items = events?.items ?? [];
  const upcomingEvents = useMemo(() => items.filter(isUpcoming).slice(0, 4), [items]);
  const recentEvents = useMemo(() => [...items].sort((a, b) => b.start_date.localeCompare(a.start_date)).slice(0, 4), [items]);
  const completedCount = overview?.by_status?.completed ?? 0;
  const focusText = selectedEvent?.title ?? upcomingEvents[0]?.title ?? "Your next chapter";

  async function refresh() {
    try {
      setIsLoading(true);
      setError("");
      const [eventData, overviewData, financialData] = await Promise.all([
        getEvents(userId, {
          status: status || undefined,
          category: category || undefined,
          year: year || undefined,
          pageSize: 100,
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
  }, [userId, status, category, year]);

  useEffect(() => {
    if (!selectedEventId) {
      setSelectedEvent(null);
      return;
    }
    const selectedId = selectedEventId;
    let cancelled = false;
    async function loadEvent() {
      try {
        setIsDetailLoading(true);
        const event = await getEvent(userId, selectedId);
        if (!cancelled) setSelectedEvent(event);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load event details");
      } finally {
        if (!cancelled) setIsDetailLoading(false);
      }
    }
    void loadEvent();
    return () => {
      cancelled = true;
    };
  }, [selectedEventId, userId]);

  useEffect(() => {
    let cancelled = false;
    async function hydrateMemories() {
      if (items.length === 0) {
        setMemoriesByEvent({});
        return;
      }
      const results = await Promise.all(
        items.slice(0, 12).map(async (event) => {
          try {
            const response = await getMemories(userId, event.id);
            return [event.id, response.items] as const;
          } catch {
            return [event.id, []] as const;
          }
        })
      );
      if (!cancelled) {
        setMemoriesByEvent(Object.fromEntries(results));
      }
    }
    void hydrateMemories();
    return () => {
      cancelled = true;
    };
  }, [items, userId]);

  async function handleCreate(payload: CreateEventPayload): Promise<string | null> {
    try {
      await createEvent(userId, payload);
      await refresh();
      return null;
    } catch (err) {
      if (err instanceof ApiError) return err.message;
      return "Failed to create event.";
    }
  }

  async function handleDelete(eventId: string) {
    try {
      if (selectedEventId === eventId) {
        setSelectedEventId(null);
        setSelectedEvent(null);
      }
      await deleteEvent(userId, eventId);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete event");
    }
  }

  function handleEventUpdated(updatedEvent: EventItem) {
    setSelectedEvent(updatedEvent);
    setEvents((current) =>
      current
        ? { ...current, items: current.items.map((item) => (item.id === updatedEvent.id ? updatedEvent : item)) }
        : current
    );
    void refresh();
  }

  return (
    <main className="app-shell">
      <SidebarNav activeView={activeView} onChange={setActiveView} />
      <section className="app-main">
        <header className="hero panel">
          <div className="hero-copy-block">
            <p className="hero-kicker">Life planning platform</p>
            <h1>Sanchara</h1>
            <p className="hero-copy">A visual workspace for long-term milestones, savings journeys, reflections, and the small tasks that turn plans into a lived life.</p>
            <div className="hero-tags">
              <span className="hero-tag">{items.length} milestones mapped</span>
              <span className="hero-tag">{completedCount} completed</span>
              <span className="hero-tag">Focus: {focusText}</span>
            </div>
          </div>
          <div className="hero-sidecard">
            <p className="section-kicker">Today&apos;s focus</p>
            <h3>{focusText}</h3>
            <p className="section-copy">Keep the plan visible, make one concrete move, and record what changed.</p>
            <div className="hero-controls">
              <label>
                Quick user
                <select value={QUICK_USERS.includes(userId) ? userId : "custom"} onChange={(e) => setUserId(e.target.value === "custom" ? userId : e.target.value)}>
                  {QUICK_USERS.map((u) => <option key={u} value={u}>{u}</option>)}
                  <option value="custom">custom</option>
                </select>
              </label>
              <label>
                User id
                <input value={userId} onChange={(e) => setUserId(e.target.value || "demo-user")} />
              </label>
            </div>
          </div>
        </header>

        <div className="filters-bar panel">
          <label><span>Status</span><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">all</option><option value="planned">planned</option><option value="in-progress">in-progress</option><option value="completed">completed</option></select></label>
          <label><span>Category</span><input value={category} placeholder="career, finance..." onChange={(e) => setCategory(e.target.value)} /></label>
          <label><span>Year</span><input value={year} placeholder="2028" onChange={(e) => setYear(e.target.value)} /></label>
        </div>

        {error && <p className="error panel">{error}</p>}
        {isLoading && <p className="loading panel">Loading Sanchara workspace...</p>}

        {activeView === "dashboard" && (
          <div className="view-stack">
            <DashboardCards overview={overview} financial={financial} />
            <section className="panel dashboard-grid dashboard-insights">
              <article className="dashboard-card featured-card">
                <p className="section-kicker">Upcoming</p>
                <h3>Next milestones</h3>
                <p className="section-copy">A clear line of sight into what deserves attention next.</p>
                <div className="stacked-links">
                  {upcomingEvents.map((event) => <button key={event.id} type="button" className="list-link" onClick={() => { setSelectedEventId(event.id); setActiveView("timeline"); }}>{event.title} <span>{event.start_date}</span></button>)}
                  {upcomingEvents.length === 0 && <p>No upcoming milestones yet.</p>}
                </div>
              </article>
              <article className="dashboard-card accent-card">
                <p className="section-kicker">Momentum</p>
                <h3>Recent additions</h3>
                <p className="section-copy">The latest moves across your life timeline.</p>
                <div className="stacked-links">
                  {recentEvents.map((event) => <button key={event.id} type="button" className="list-link" onClick={() => { setSelectedEventId(event.id); setActiveView("timeline"); }}>{event.title} <span>{event.category}</span></button>)}
                  {recentEvents.length === 0 && <p>No events yet.</p>}
                </div>
              </article>
            </section>
            <EventForm onSubmit={handleCreate} />
          </div>
        )}

        {activeView === "timeline" && (
          <div className="workspace-grid">
            <div className="view-stack">
              <TimelineBoard events={items} selectedEventId={selectedEventId} onSelect={setSelectedEventId} onDelete={(eventId) => void handleDelete(eventId)} />
              <EventForm onSubmit={handleCreate} />
            </div>
            <section>
              {!selectedEventId && <aside className="panel detail-empty-state"><h3>Select an event</h3><p>Choose a milestone to open its full workspace and edit the plan in context.</p></aside>}
              {isDetailLoading && <aside className="panel detail-empty-state"><p className="loading">Loading event workspace...</p></aside>}
              {selectedEvent && !isDetailLoading && (
                <EventDetailsPanel event={selectedEvent} userId={userId} onClose={() => { setSelectedEventId(null); setSelectedEvent(null); }} onEventUpdated={handleEventUpdated} />
              )}
            </section>
          </div>
        )}

        {activeView === "savings" && <SavingsBoard events={items} financial={financial} onSelect={(eventId) => { setSelectedEventId(eventId); setActiveView("timeline"); }} />}
        {activeView === "memories" && <MemoriesBoard events={items} memoriesByEvent={memoriesByEvent} onSelect={(eventId) => { setSelectedEventId(eventId); setActiveView("timeline"); }} />}
      </section>
    </main>
  );
}

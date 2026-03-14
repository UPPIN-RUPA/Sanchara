import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { EventDetailsPanel } from "../components/EventDetailsPanel";
import { EventForm } from "../components/EventForm";
import { MemoriesBoard } from "../components/MemoriesBoard";
import { SavingsBoard } from "../components/SavingsBoard";
import { AppShell } from "../components/layout/AppShell";
import { ContentContainer } from "../components/layout/ContentContainer";
import { HeaderBar } from "../components/layout/HeaderBar";
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
} from "../lib/api";
import { DashboardPage } from "./DashboardPage";
import { TimelinePage } from "./TimelinePage";
import { YearViewPage } from "./YearViewPage";
import type { View } from "../types/navigation";
import { mockActivity } from "../data/mockActivity";

type DetailTab = "overview" | "tasks" | "savings" | "memories" | "notes";

const QUICK_USERS = ["demo-user", "rupa", "alex"];

function isUpcoming(event: EventItem): boolean {
  return new Date(event.start_date) >= new Date(new Date().toISOString().slice(0, 10));
}

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

function percentage(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function AppWorkspace() {
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [userId, setUserId] = useState("demo-user");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [year, setYear] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<EventListResponse | null>(null);
  const [overview, setOverview] = useState<OverviewSummary | null>(null);
  const [financial, setFinancial] = useState<FinancialSummary | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("overview");
  const [memoriesByEvent, setMemoriesByEvent] = useState<Record<string, MemoryItem[]>>({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const deferredSearchQuery = useDeferredValue(searchQuery);
  const items = events?.items ?? [];
  const upcomingEvents = useMemo(() => items.filter(isUpcoming).slice(0, 4), [items]);
  const recentEvents = useMemo(() => [...items].sort((a, b) => (b.updated_at ?? b.start_date).localeCompare(a.updated_at ?? a.start_date)).slice(0, 4), [items]);
  const completedEvents = useMemo(() => items.filter((event) => event.status === "completed"), [items]);
  const activePlans = useMemo(() => items.filter((event) => event.status !== "completed"), [items]);
  const searchResults = useMemo(
    () => (deferredSearchQuery.trim() ? items.filter((event) => matchesSearch(event, deferredSearchQuery)) : []),
    [deferredSearchQuery, items]
  );

  const totalEvents = overview?.total_events ?? items.length;
  const completedCount = overview?.by_status?.completed ?? completedEvents.length;
  const lifeProgress = percentage(completedCount, totalEvents);
  const focusText = selectedEvent?.title ?? upcomingEvents[0]?.title ?? "Your next chapter";
  const [focusedYear, setFocusedYear] = useState(new Date().getFullYear());
  const currentYearEvents = useMemo(
    () => items.filter((event) => new Date(event.start_date).getFullYear() === focusedYear),
    [focusedYear, items]
  );
  const timelineYearEvents = useMemo(
    () => items.filter((event) => new Date(event.start_date).getFullYear() === focusedYear),
    [focusedYear, items]
  );
  const activity = useMemo(
    () =>
      recentEvents.slice(0, 3).map((event, index) => ({
        id: `event-${event.id}`,
        title: index === 0 ? `Updated ${event.title}` : `Revisited ${event.title}`,
        detail: event.description || event.timeline_phase || "Plan details were updated in the workspace.",
        date: event.updated_at ?? event.start_date,
        kind: "plan" as const,
      })),
    [recentEvents]
  );
  const mergedActivity = activity.length > 0 ? activity : mockActivity;

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
      if (!cancelled) setMemoriesByEvent(Object.fromEntries(results));
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

  function openEvent(eventId: string, targetView: View = "timeline") {
    setSelectedEventId(eventId);
    setActiveView(targetView);
  }

  function openFullDetails(tab: DetailTab = "overview") {
    setDetailTab(tab);
    setActiveView("plans");
  }

  function renderDetailPanel(emptyTitle: string, emptyCopy: string) {
    if (!selectedEventId) {
      return (
        <aside className="panel detail-empty-state">
          <h3>{emptyTitle}</h3>
          <p>{emptyCopy}</p>
        </aside>
      );
    }

    if (isDetailLoading) {
      return (
        <aside className="panel detail-empty-state">
          <p className="loading">Loading event workspace...</p>
        </aside>
      );
    }

    if (selectedEvent) {
      return (
        <EventDetailsPanel
          event={selectedEvent}
          userId={userId}
          initialTab={detailTab}
          onClose={() => {
            setSelectedEventId(null);
            setSelectedEvent(null);
          }}
          onEventUpdated={handleEventUpdated}
        />
      );
    }

    return null;
  }

  const viewMeta: Record<View, { title: string; subtitle: string }> = {
    dashboard: { title: "Dashboard", subtitle: "A calm command center for the journey you are intentionally building." },
    timeline: { title: "Timeline", subtitle: "See your life plans across years, milestones, and chapters." },
    year: { title: `${focusedYear}`, subtitle: "Understand what this year means in the larger life plan." },
    plans: { title: "Plans", subtitle: "Create, organize, and revisit the milestones shaping your future." },
    savings: { title: "Savings", subtitle: "Track the money behind the dreams you are preparing to live." },
    memories: { title: "Memories", subtitle: "Keep the emotional record of moments that shaped the journey." },
    search: { title: "Search", subtitle: "Find plans, years, memories, and notes without losing the thread." },
    archive: { title: "Archive", subtitle: "Completed chapters, kept with care instead of pushed away." },
    settings: { title: "Settings", subtitle: "Profile, preferences, notifications, and data controls." },
  };

  return (
    <AppShell activeView={activeView} onViewChange={setActiveView}>
      <HeaderBar
        title={viewMeta[activeView].title}
        subtitle={viewMeta[activeView].subtitle}
        actions={
          activeView !== "settings" ? (
            <div className="header-bar-user">
              <span className="header-user-label">Profile</span>
              <strong>{userId}</strong>
            </div>
          ) : undefined
        }
      />
      <ContentContainer>
        {activeView !== "settings" && (
          <div className="filters-bar panel quiet-panel">
            <label><span>Status</span><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">all</option><option value="planned">planned</option><option value="in-progress">in-progress</option><option value="completed">completed</option></select></label>
            <label><span>Category</span><input value={category} placeholder="career, finance..." onChange={(e) => setCategory(e.target.value)} /></label>
            <label><span>Year</span><input value={year} placeholder="2035" onChange={(e) => setYear(e.target.value)} /></label>
          </div>
        )}

        {error && <p className="error panel">{error}</p>}
        {isLoading && <p className="loading panel">Loading Sanchara workspace...</p>}

        {activeView === "dashboard" && (
          <DashboardPage
            totalEvents={totalEvents}
            activePlans={activePlans.length}
            upcomingMilestones={upcomingEvents.length}
            completedMilestones={completedCount}
            lifeProgress={lifeProgress}
            focusText={focusText}
            userId={userId}
            quickUsers={QUICK_USERS}
            onUserChange={setUserId}
            upcomingEvents={upcomingEvents}
            onOpenEvent={openEvent}
            onGoToPlans={() => setActiveView("plans")}
            onGoToTimeline={() => setActiveView("timeline")}
            onGoToMemories={() => setActiveView("memories")}
            onGoToYear={() => {
              setFocusedYear(new Date().getFullYear());
              setActiveView("year");
            }}
            currentYear={focusedYear}
            currentYearEvents={currentYearEvents}
            activity={mergedActivity}
            onSubmitEvent={handleCreate}
          />
        )}

        {activeView === "timeline" && (
          <TimelinePage
            events={items}
            memoriesByEvent={memoriesByEvent}
            selectedEvent={selectedEvent}
            onSelect={(eventId) => openEvent(eventId, "timeline")}
            onAddPlan={() => setActiveView("plans")}
            onOpenFullDetails={openFullDetails}
            onOpenYear={(year) => {
              setFocusedYear(year);
              setActiveView("year");
            }}
          />
        )}

        {activeView === "year" && (
          <YearViewPage
            year={focusedYear}
            events={timelineYearEvents}
            memoryCount={timelineYearEvents.reduce((total, event) => total + (memoriesByEvent[event.id]?.length ?? 0), 0)}
            onOpenEvent={(eventId) => openEvent(eventId, "plans")}
          />
        )}

        {activeView === "plans" && (
          <div className="workspace-grid">
            <div className="view-stack">
              <section className="panel section-panel">
                <div className="section-heading">
                  <div>
                    <p className="section-kicker">Plans</p>
                    <h3>All life plans and milestones</h3>
                  </div>
                  <p className="section-copy">A cleaner planning surface for everything you are intentionally shaping across years and life phases.</p>
                </div>
                <div className="plan-grid">
                  {items.map((event) => (
                    <article key={event.id} className="plan-card">
                      <div className="timeline-meta-row">
                        <span className="pill subtle">{event.category}</span>
                        <span className="muted-text">{event.status}</span>
                      </div>
                      <h4>{event.title}</h4>
                      <p>{event.description || event.timeline_phase || "No description yet."}</p>
                      <div className="manuscript-notes">
                        <small>{event.start_date}</small>
                        <small>{event.priority} priority</small>
                      </div>
                      <div className="plan-card-actions">
                        <button type="button" className="ghost-link" onClick={() => openEvent(event.id, "plans")}>Open plan</button>
                        <button type="button" className="ghost-danger" onClick={() => void handleDelete(event.id)}>Remove plan</button>
                      </div>
                    </article>
                  ))}
                  {items.length === 0 && <p>No plans yet.</p>}
                </div>
              </section>
              <EventForm onSubmit={handleCreate} />
            </div>
            <section>
              {renderDetailPanel("Choose a plan", "Open any plan to view details, update milestones, save notes, and attach memories.")}
            </section>
          </div>
        )}

        {activeView === "savings" && <SavingsBoard events={items} financial={financial} onSelect={(eventId) => openEvent(eventId)} />}
        {activeView === "memories" && <MemoriesBoard events={items} memoriesByEvent={memoriesByEvent} onSelect={(eventId) => openEvent(eventId)} />}

        {activeView === "search" && (
          <div className="workspace-grid">
            <div className="view-stack">
              <section className="panel section-panel">
                <div className="section-heading">
                  <div>
                    <p className="section-kicker">Search</p>
                    <h3>Find plans, notes, years, and themes</h3>
                  </div>
                  <p className="section-copy">Search across event names, notes, categories, and years to jump directly to the right chapter.</p>
                </div>
                <label className="search-field">
                  <span>Search your life map</span>
                  <input value={searchQuery} placeholder="land, 2035, career..." onChange={(e) => setSearchQuery(e.target.value)} />
                </label>
                <div className="plan-grid">
                  {searchResults.map((event) => (
                    <article key={event.id} className="plan-card">
                      <div className="timeline-meta-row">
                        <span className="pill subtle">{event.category}</span>
                        <span className="muted-text">{new Date(event.start_date).getFullYear()}</span>
                      </div>
                      <h4>{event.title}</h4>
                      <p>{event.description || event.notes || "No searchable notes yet."}</p>
                      <button type="button" className="ghost-link" onClick={() => openEvent(event.id, "search")}>Open result</button>
                    </article>
                  ))}
                  {!deferredSearchQuery.trim() && <p>Start typing to search your plans.</p>}
                  {deferredSearchQuery.trim() && searchResults.length === 0 && <p>No matching plans found.</p>}
                </div>
              </section>
            </div>
            <section>
              {renderDetailPanel("Open a search result", "Select a result to inspect the full event details without leaving search.")}
            </section>
          </div>
        )}

        {activeView === "archive" && (
          <div className="workspace-grid">
            <div className="view-stack">
              <section className="panel section-panel">
                <div className="section-heading">
                  <div>
                    <p className="section-kicker">Archive</p>
                    <h3>Completed chapters</h3>
                  </div>
                  <p className="section-copy">A place for milestones that are finished, so the timeline stays clear while the memory of what was built remains accessible.</p>
                </div>
                <div className="plan-grid">
                  {completedEvents.map((event) => (
                    <article key={event.id} className="plan-card archive-plan">
                      <div className="timeline-meta-row">
                        <span className="pill subtle">{event.category}</span>
                        <span className="muted-text">completed</span>
                      </div>
                      <h4>{event.title}</h4>
                      <p>{event.description || event.notes || "Completed milestone."}</p>
                      <button type="button" className="ghost-link" onClick={() => openEvent(event.id, "archive")}>Open archive entry</button>
                    </article>
                  ))}
                  {completedEvents.length === 0 && <p>No archived milestones yet.</p>}
                </div>
              </section>
            </div>
            <section>
              {renderDetailPanel("Open an archived chapter", "Choose a completed milestone to revisit its notes, memories, and records.")}
            </section>
          </div>
        )}

        {activeView === "settings" && (
          <section className="panel section-panel">
            <div className="section-heading">
              <div>
                <p className="section-kicker">Settings</p>
                <h3>Account and preferences</h3>
              </div>
              <p className="section-copy">Profile, preferences, and future data controls for your personal life-planning archive.</p>
            </div>
            <div className="settings-grid">
              <article className="detail-card">
                <h4>Profile</h4>
                <p>Current profile key</p>
                <strong>{userId}</strong>
              </article>
              <article className="detail-card">
                <h4>Preferences</h4>
                <p>Theme, notifications, and reminder settings belong here as the product expands.</p>
              </article>
              <article className="detail-card">
                <h4>Data</h4>
                <p>Export timeline, backup memories, and preserve your archive safely.</p>
              </article>
            </div>
          </section>
        )}
      </ContentContainer>
    </AppShell>
  );
}

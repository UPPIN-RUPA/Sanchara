import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { AppShell } from "../components/layout/AppShell";
import { ContentContainer } from "../components/layout/ContentContainer";
import { HeaderBar } from "../components/layout/HeaderBar";
import {
  ApiError,
  createEvent,
  deleteEvent,
  type CreateEventPayload,
  type EventItem,
} from "../lib/api";
import { ArchivePage } from "./ArchivePage";
import { DashboardPage } from "./DashboardPage";
import { CreateEventPage } from "./CreateEventPage";
import { EditEventPage } from "./EditEventPage";
import { EventDetailPage } from "./EventDetailPage";
import { MemoriesPage } from "./MemoriesPage";
import { PlansPage } from "./PlansPage";
import { SavingsPage } from "./SavingsPage";
import { SearchPage } from "./SearchPage";
import { TimelinePage } from "./TimelinePage";
import { YearViewPage } from "./YearViewPage";
import type { View } from "../types/navigation";

type DetailTab = "overview" | "milestones" | "savings" | "memories" | "updates";

function routeInfoFromPath(pathname: string): { view: View; eventId?: string; year?: number } {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] === "timeline" && segments[1]) {
    return { view: "year", year: Number(segments[1]) };
  }
  if (segments[0] === "timeline") return { view: "timeline" };
  if (segments[0] === "plans" && segments[1] === "new") return { view: "create-event" };
  if (segments[0] === "plans" && segments[1] && segments[2] === "edit") {
    return { view: "edit-event", eventId: segments[1] };
  }
  if (segments[0] === "plans" && segments[1]) return { view: "event-detail", eventId: segments[1] };
  if (segments[0] === "plans") return { view: "plans" };
  if (segments[0] === "savings") return { view: "savings" };
  if (segments[0] === "memories") return { view: "memories" };
  if (segments[0] === "search") return { view: "search" };
  if (segments[0] === "archive") return { view: "archive" };
  if (segments[0] === "settings") return { view: "settings" };
  return { view: "dashboard" };
}

export function AppWorkspace() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const routeInfo = routeInfoFromPath(location.pathname);
  const activeView = routeInfo.view;

  async function handleCreate(payload: CreateEventPayload): Promise<string | null> {
    try {
      await createEvent(payload);
      return null;
    } catch (err) {
      if (err instanceof ApiError) return err.message;
      return "Failed to create event.";
    }
  }

  async function handleDelete(eventId: string) {
    try {
      await deleteEvent(eventId);
    } catch {
      return;
    }
  }

  function handleEventUpdated(_updatedEvent: EventItem) {
    return;
  }

  function openEvent(eventId: string, targetView: View = "event-detail") {
    if (targetView === "timeline") {
      navigate("/timeline");
      return;
    }
    if (targetView === "edit-event") {
      navigate(`/plans/${eventId}/edit`);
      return;
    }
    navigate(`/plans/${eventId}`);
  }

  function navigateToView(view: View) {
    if (view === "dashboard") navigate("/dashboard");
    else if (view === "timeline") navigate("/timeline");
    else if (view === "plans") navigate("/plans");
    else if (view === "savings") navigate("/savings");
    else if (view === "memories") navigate("/memories");
    else if (view === "search") navigate("/search");
    else if (view === "archive") navigate("/archive");
    else if (view === "settings") navigate("/settings");
  }

  const viewMeta: Record<View, { title: string; subtitle: string }> = {
    dashboard: { title: "Dashboard", subtitle: "A calm command center for the journey you are intentionally building." },
    timeline: { title: "Timeline", subtitle: "See your life plans across years, milestones, and chapters." },
    year: { title: `${routeInfo.year ?? new Date().getFullYear()}`, subtitle: "Understand what this year means in the larger life plan." },
    "create-event": { title: "Create Plan", subtitle: "Add a meaningful milestone, dream, or life chapter to the map." },
    "edit-event": { title: "Edit Plan", subtitle: "Refine the timing, meaning, and structure of one chapter." },
    "event-detail": { title: "Plan Detail", subtitle: "Read the full story of a plan and manage it deeply." },
    plans: { title: "Plans", subtitle: "Create, organize, and revisit the milestones shaping your future." },
    savings: { title: "Savings", subtitle: "Track the money behind the dreams you are preparing to live." },
    memories: { title: "Memories", subtitle: "Keep the emotional record of moments that shaped the journey." },
    search: { title: "Search", subtitle: "Find plans, years, memories, and notes without losing the thread." },
    archive: { title: "Archive", subtitle: "Completed chapters, kept with care instead of pushed away." },
    settings: { title: "Settings", subtitle: "Profile, preferences, notifications, and data controls." },
  };

  return (
    <AppShell activeView={activeView} onViewChange={navigateToView}>
      <HeaderBar
        title={viewMeta[activeView].title}
        subtitle={viewMeta[activeView].subtitle}
        actions={
          activeView !== "settings" ? (
            <div className="header-bar-user">
              <span className="header-user-label">Profile</span>
              <strong>{currentUser?.name ?? currentUser?.email}</strong>
              <button type="button" className="ghost-link" onClick={() => { logout(); navigate("/login"); }}>
                Logout
              </button>
            </div>
          ) : undefined
        }
      />
      <ContentContainer>
        {activeView === "dashboard" && (
          <DashboardPage
            onOpenEvent={(eventId) => openEvent(eventId, "event-detail")}
            onGoToPlans={() => navigate("/plans/new")}
            onGoToTimeline={() => navigate("/timeline")}
            onGoToMemories={() => navigate("/memories")}
            onGoToYear={() => navigate(`/timeline/${new Date().getFullYear()}`)}
            onSubmitEvent={handleCreate}
          />
        )}

        {activeView === "timeline" && <TimelinePage />}

        {activeView === "year" && <YearViewPage />}

        {activeView === "create-event" && (
          <CreateEventPage
            onCreated={(eventId) => navigate(`/plans/${eventId}`)}
            onCancel={() => navigate("/dashboard")}
          />
        )}

        {activeView === "edit-event" && (
          <EditEventPage
            onSaved={(eventId) => navigate(`/plans/${eventId}`)}
            onCancel={() => navigate(routeInfo.eventId ? `/plans/${routeInfo.eventId}` : "/dashboard")}
          />
        )}

        {activeView === "event-detail" && (
          <EventDetailPage
            onEventUpdated={handleEventUpdated}
          />
        )}

        {activeView === "plans" && <PlansPage onDelete={handleDelete} />}

        {activeView === "savings" && <SavingsPage />}
        {activeView === "memories" && <MemoriesPage />}

        {activeView === "search" && <SearchPage />}

        {activeView === "archive" && <ArchivePage />}

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
                <p>Authenticated account</p>
                <strong>{currentUser?.name}</strong>
                <span>{currentUser?.email}</span>
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

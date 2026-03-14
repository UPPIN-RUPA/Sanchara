import { useNavigate } from "react-router-dom";
import { TimelineWorkspace } from "../components/TimelineWorkspace";
import { useTimelineData } from "../hooks/useTimelineData";

export function TimelinePage() {
  const navigate = useNavigate();
  const { events, memoriesByEvent, selectedEvent, setSelectedEventId, isLoading, error } = useTimelineData();

  return (
    <div className="view-stack">
      {error && <p className="error panel">{error}</p>}
      {isLoading && <p className="loading panel">Loading timeline...</p>}
      <TimelineWorkspace
        events={events}
        memoriesByEvent={memoriesByEvent}
        selectedEvent={selectedEvent}
        onSelect={setSelectedEventId}
        onAddPlan={() => navigate("/plans/new")}
        onOpenFullDetails={() => {
          if (selectedEvent) navigate(`/plans/${selectedEvent.id}`);
        }}
        onOpenYear={(year) => navigate(`/timeline/${year}`)}
      />
    </div>
  );
}

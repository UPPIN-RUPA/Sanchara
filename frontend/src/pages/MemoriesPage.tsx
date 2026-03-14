import { useNavigate } from "react-router-dom";
import { MemoriesBoard } from "../components/MemoriesBoard";
import { useMemoriesData } from "../hooks/useMemoriesData";

export function MemoriesPage() {
  const navigate = useNavigate();
  const { rows, query, memoryType, memoryTypes, isLoading, error, setQuery, setMemoryType } = useMemoriesData();

  const eventIds = new Set(rows.map(({ event }) => event.id));
  const events = rows.map(({ event }) => event).filter((event, index, list) => list.findIndex((item) => item.id === event.id) === index);
  const memoriesByEvent = Object.fromEntries(
    Array.from(eventIds).map((eventId) => [
      eventId,
      rows.filter(({ event }) => event.id === eventId).map(({ memory }) => memory),
    ])
  );

  return (
    <div className="workspace-grid">
      <div className="view-stack">
        <section className="panel section-panel">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Memories</p>
              <h3>Moments attached to the plans you are living through</h3>
            </div>
            <p className="section-copy">
              Search and filter memories without losing the thread back to the chapter they belong to.
            </p>
          </div>

          {error && <p className="error panel">{error}</p>}
          {isLoading && <p className="loading panel">Loading memories...</p>}

          <div className="filters-bar panel quiet-panel">
            <label>
              <span>Search</span>
              <input value={query} placeholder="land visit, reflection, photo..." onChange={(e) => setQuery(e.target.value)} />
            </label>
            <label>
              <span>Type</span>
              <select value={memoryType} onChange={(e) => setMemoryType(e.target.value)}>
                <option value="">all</option>
                {memoryTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <MemoriesBoard
          events={events}
          memoriesByEvent={memoriesByEvent}
          onSelect={(eventId) => navigate(`/plans/${eventId}`)}
        />
      </div>
    </div>
  );
}

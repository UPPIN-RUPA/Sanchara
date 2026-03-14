import type { View } from "../../types/navigation";

type Props = {
  activeView: View;
  onChange: (view: View) => void;
};

const ITEMS: Array<{ id: View; label: string; hint: string }> = [
  { id: "dashboard", label: "Dashboard", hint: "Command center" },
  { id: "timeline", label: "Timeline", hint: "Life across years" },
  { id: "plans", label: "Plans", hint: "All major milestones" },
  { id: "savings", label: "Savings", hint: "Financial goals" },
  { id: "memories", label: "Memories", hint: "Emotional archive" },
  { id: "search", label: "Search", hint: "Find any chapter" },
  { id: "archive", label: "Archive", hint: "Completed milestones" },
  { id: "settings", label: "Settings", hint: "Profile and preferences" },
];

export function Sidebar({ activeView, onChange }: Props) {
  return (
    <aside className="app-sidebar panel">
      <div className="sidebar-block">
        <p className="sidebar-eyebrow">Sanchara</p>
        <h2>A quiet atlas for the life you are building.</h2>
        <p className="sidebar-copy">
          Not a task manager. A life planning system for future milestones, long-term goals, memories, and the larger journey they belong to.
        </p>
      </div>
      <nav className="sidebar-nav" aria-label="App sections">
        {ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={activeView === item.id ? "sidebar-link active" : "sidebar-link"}
            onClick={() => onChange(item.id)}
          >
            <strong>{item.label}</strong>
            <span>{item.hint}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footnote">
        <span>Life planning atlas</span>
        <small>Timeline, plans, savings, memories, archive, and the meaning between them.</small>
      </div>
    </aside>
  );
}

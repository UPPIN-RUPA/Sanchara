type View = "dashboard" | "timeline" | "savings" | "memories";

type Props = {
  activeView: View;
  onChange: (view: View) => void;
};

const ITEMS: Array<{ id: View; label: string; hint: string }> = [
  { id: "dashboard", label: "Dashboard", hint: "Overview and momentum" },
  { id: "timeline", label: "Timeline", hint: "Plan milestones" },
  { id: "savings", label: "Savings", hint: "Funding progress" },
  { id: "memories", label: "Memories", hint: "Reflections and artifacts" },
];

export function SidebarNav({ activeView, onChange }: Props) {
  return (
    <aside className="app-sidebar panel">
      <div>
        <p className="sidebar-eyebrow">Sanchara</p>
        <h2>Life OS</h2>
        <p className="sidebar-copy">
          Plan milestones, track progress, and preserve what matters.
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
    </aside>
  );
}

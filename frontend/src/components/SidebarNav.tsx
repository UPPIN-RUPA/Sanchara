type View = "dashboard" | "timeline" | "savings" | "memories";

type Props = {
  activeView: View;
  onChange: (view: View) => void;
};

const ITEMS: Array<{ id: View; label: string; hint: string; index: string }> = [
  { id: "dashboard", label: "Dashboard", hint: "Overview and momentum", index: "01" },
  { id: "timeline", label: "Timeline", hint: "Plan milestones", index: "02" },
  { id: "savings", label: "Savings", hint: "Funding progress", index: "03" },
  { id: "memories", label: "Memories", hint: "Reflections and artifacts", index: "04" },
];

export function SidebarNav({ activeView, onChange }: Props) {
  return (
    <aside className="app-sidebar panel">
      <div className="sidebar-block">
        <p className="sidebar-eyebrow">Sanchara</p>
        <h2>Life Operating System</h2>
        <p className="sidebar-copy">
          Shape the years ahead, then keep the memories close to the plan that made them possible.
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
            <span className="sidebar-index">{item.index}</span>
            <span>
              <strong>{item.label}</strong>
              <span>{item.hint}</span>
            </span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footnote">
        <span>V1 workspace</span>
        <small>Timeline, savings, memories, and execution in one place.</small>
      </div>
    </aside>
  );
}

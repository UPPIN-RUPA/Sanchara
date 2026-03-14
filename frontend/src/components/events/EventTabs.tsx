type EventDetailTab = "overview" | "milestones" | "savings" | "updates" | "memories" | "documents";

type Props = {
  activeTab: EventDetailTab;
  onChange: (tab: EventDetailTab) => void;
};

const TABS: EventDetailTab[] = ["overview", "milestones", "savings", "updates", "memories", "documents"];

export function EventTabs({ activeTab, onChange }: Props) {
  return (
    <div className="tab-row" role="tablist" aria-label="Event detail tabs">
      {TABS.map((tab) => (
        <button key={tab} type="button" className={tab === activeTab ? "tab-button tab-button-active" : "tab-button"} onClick={() => onChange(tab)}>
          {tab}
        </button>
      ))}
    </div>
  );
}

export type { EventDetailTab };

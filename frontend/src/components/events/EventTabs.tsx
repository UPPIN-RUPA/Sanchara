type EventDetailTab = "overview" | "milestones" | "savings" | "memories" | "updates";

type Props = {
  activeTab: EventDetailTab;
  onChange: (tab: EventDetailTab) => void;
};

const TABS: EventDetailTab[] = ["overview", "milestones", "savings", "memories", "updates"];

export function EventTabs({ activeTab, onChange }: Props) {
  return (
    <div className="tab-row" role="tablist" aria-label="Event detail tabs">
      {TABS.map((tab) => (
        <button key={tab} type="button" className={tab === activeTab ? "tab-button tab-button-active" : "tab-button"} onClick={() => onChange(tab)}>
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  );
}

export type { EventDetailTab };

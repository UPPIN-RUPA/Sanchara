type Props = {
  title: string;
  left: number;
  top: number;
  color: string;
  selected: boolean;
  onSelect: () => void;
};

export function TimelineMilestoneNode({ title, left, top, color, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      className={selected ? "timeline-node selected" : "timeline-node"}
      style={{ left, top, borderColor: color, color }}
      onClick={onSelect}
    >
      <span className="timeline-node-dot" style={{ backgroundColor: color }} />
      <span className="timeline-node-label">{title}</span>
    </button>
  );
}

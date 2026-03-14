import { PageHeader } from "../components/layout/PageHeader";
import { EventForm } from "../components/events/EventForm";

type Props = {
  userId: string;
  onCreated: (eventId: string) => void;
  onCancel: () => void;
};

export function CreateEventPage({ userId, onCreated, onCancel }: Props) {
  return (
    <div className="view-stack">
      <PageHeader
        eyebrow="Create plan"
        title="Add a meaningful milestone to your journey"
        subtitle="Craft the plan as a real life chapter, not as a ticket or admin entry."
      />
      <EventForm userId={userId} onCreated={onCreated} onCancel={onCancel} />
    </div>
  );
}

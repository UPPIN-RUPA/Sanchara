import { PageHeader } from "../components/layout/PageHeader";
import { EventForm } from "../components/events/EventForm";

type Props = {
  onCreated: (eventId: string) => void;
  onCancel: () => void;
};

export function CreateEventPage({ onCreated, onCancel }: Props) {
  return (
    <div className="view-stack">
      <PageHeader
        eyebrow="Create plan"
        title="Create New Plan"
        subtitle="Add a meaningful goal, chapter, or dream to your journey."
        actions={<button type="button" className="timeline-secondary-button" onClick={onCancel}>Cancel</button>}
      />
      <section className="panel create-plan-intro">
        <div>
          <p className="section-kicker">Guidance</p>
          <h3>Start a future chapter, not just a form entry.</h3>
          <p className="section-copy">
            Plans in Sanchara can be long-term goals like marriage, building a house, saving for land, starting a PhD, or creating a self-sustaining farm.
          </p>
        </div>
        <div className="create-plan-examples">
          <span className="hero-tag">Build a House</span>
          <span className="hero-tag">Start a PhD</span>
          <span className="hero-tag">Buy Land</span>
        </div>
      </section>
      <EventForm mode="create" onSubmitted={onCreated} onCancel={onCancel} />
    </div>
  );
}

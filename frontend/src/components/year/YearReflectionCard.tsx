type Props = {
  reflection: string;
};

export function YearReflectionCard({ reflection }: Props) {
  return (
    <section className="panel year-reflection-card">
      <p className="section-kicker">Reflection</p>
      <h3>What this year means</h3>
      <p>{reflection}</p>
    </section>
  );
}

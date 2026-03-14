type Props = {
  year: number;
  summary: string;
  bigFocus: string;
};

export function YearHeroCard({ year, summary, bigFocus }: Props) {
  return (
    <article className="panel year-hero-card">
      <p className="section-kicker">Year overview</p>
      <h2>{year}</h2>
      <p className="section-copy">{summary}</p>
      <div className="year-focus-note">
        <span>Big focus</span>
        <strong>{bigFocus}</strong>
      </div>
    </article>
  );
}

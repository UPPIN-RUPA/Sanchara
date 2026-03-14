import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, subtitle, actions }: Props) {
  return (
    <header className="page-header panel">
      <div className="page-header-copy">
        {eyebrow && <p className="section-kicker">{eyebrow}</p>}
        <h2>{title}</h2>
        <p className="section-copy">{subtitle}</p>
      </div>
      {actions ? <div className="page-header-actions">{actions}</div> : null}
    </header>
  );
}

import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle: string;
  actions?: ReactNode;
};

export function HeaderBar({ title, subtitle, actions }: Props) {
  return (
    <header className="header-bar panel">
      <div className="header-bar-copy">
        <h2>{title}</h2>
        <p className="section-copy">{subtitle}</p>
      </div>
      {actions ? <div className="header-bar-actions">{actions}</div> : null}
    </header>
  );
}

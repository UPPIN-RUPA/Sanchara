import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function SectionHeader({ eyebrow, title, subtitle, action }: Props) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p className="section-kicker">{eyebrow}</p>}
        <h3>{title}</h3>
        {subtitle ? <p className="section-copy">{subtitle}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: string;
  subtitle: string;
  quote: string;
  children: ReactNode;
};

export function AuthLayout({ eyebrow, title, subtitle, quote, children }: Props) {
  return (
    <main className="auth-shell">
      <section className="auth-brand-panel">
        <div className="auth-brand-copy">
          <p className="hero-kicker">{eyebrow}</p>
          <h1>Sanchara</h1>
          <p className="hero-copy">{subtitle}</p>
        </div>
        <div className="auth-illustration" aria-hidden="true">
          <div className="auth-path" />
          <div className="auth-dot auth-dot-one" />
          <div className="auth-dot auth-dot-two" />
          <div className="auth-dot auth-dot-three" />
        </div>
        <blockquote>{quote}</blockquote>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-card panel">
          <p className="section-kicker">{eyebrow}</p>
          <h2>{title}</h2>
          <p className="section-copy">{subtitle}</p>
          {children}
        </div>
      </section>
    </main>
  );
}

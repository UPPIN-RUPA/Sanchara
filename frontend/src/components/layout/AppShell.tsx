import type { ReactNode } from "react";
import type { View } from "../../types/navigation";
import { Sidebar } from "./Sidebar";

type Props = {
  activeView: View;
  onViewChange: (view: View) => void;
  children: ReactNode;
};

export function AppShell({ activeView, onViewChange, children }: Props) {
  return (
    <main className="app-shell">
      <Sidebar activeView={activeView} onChange={onViewChange} />
      <section className="app-main">{children}</section>
    </main>
  );
}

import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

type Props = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: Props) {
  const location = useLocation();
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <main className="auth-shell">
        <section className="auth-form-panel">
          <div className="auth-form-card panel">
            <p className="section-kicker">Restoring session</p>
            <h2>Opening your life map</h2>
            <p className="section-copy">Checking your account and loading the authenticated workspace.</p>
          </div>
        </section>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

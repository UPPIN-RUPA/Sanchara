import { Navigate, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/auth/AuthLayout";
import { SignupForm } from "../components/auth/SignupForm";
import { useAuth } from "../auth/useAuth";

export function SignupPage() {
  const navigate = useNavigate();
  const { isAuthenticated, signup } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthLayout
      eyebrow="Begin your journey"
      title="Create your Sanchara account"
      subtitle="Start mapping long-term milestones, savings goals, and memories with a calmer life-planning space."
      quote="The years ahead deserve a place to be imagined well."
    >
      <SignupForm
        onSubmit={async (payload) => {
          try {
            await signup(payload);
            navigate("/dashboard");
            return null;
          } catch (error) {
            return error instanceof Error ? error.message : "Failed to create account.";
          }
        }}
        onLogin={() => navigate("/login")}
      />
    </AuthLayout>
  );
}

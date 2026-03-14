import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/auth/AuthLayout";
import { LoginForm } from "../components/auth/LoginForm";
import { useAuth } from "../auth/useAuth";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Enter your life map"
      subtitle="Login to continue planning the future you are intentionally building."
      quote="Every future begins with a first step."
    >
      <LoginForm
        onSubmit={async (payload) => {
          try {
            await login(payload);
            navigate((location.state as { from?: string } | null)?.from ?? "/dashboard");
            return null;
          } catch (error) {
            return error instanceof Error ? error.message : "Failed to log in.";
          }
        }}
        onSignup={() => navigate("/signup")}
      />
    </AuthLayout>
  );
}

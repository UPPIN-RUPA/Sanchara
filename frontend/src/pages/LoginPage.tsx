import { AuthLayout } from "../components/auth/AuthLayout";
import { LoginForm } from "../components/auth/LoginForm";

type Props = {
  onLogin: () => void;
  onSignup: () => void;
};

export function LoginPage({ onLogin, onSignup }: Props) {
  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Enter your life map"
      subtitle="Login to continue planning the future you are intentionally building."
      quote="Every future begins with a first step."
    >
      <LoginForm onSubmit={onLogin} onSignup={onSignup} />
    </AuthLayout>
  );
}

import { AuthLayout } from "../components/auth/AuthLayout";
import { SignupForm } from "../components/auth/SignupForm";

type Props = {
  onSignup: () => void;
  onLogin: () => void;
};

export function SignupPage({ onSignup, onLogin }: Props) {
  return (
    <AuthLayout
      eyebrow="Begin your journey"
      title="Create your Sanchara account"
      subtitle="Start mapping long-term milestones, savings goals, and memories with a calmer life-planning space."
      quote="The years ahead deserve a place to be imagined well."
    >
      <SignupForm onSubmit={onSignup} onLogin={onLogin} />
    </AuthLayout>
  );
}

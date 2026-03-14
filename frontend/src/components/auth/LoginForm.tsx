import { useState } from "react";
import type { LoginPayload } from "../../types/auth";

type Props = {
  onSubmit: (payload: LoginPayload) => Promise<string | null>;
  onSignup: () => void;
};

export function LoginForm({ onSubmit, onSignup }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <form
      className="auth-form"
      onSubmit={async (event) => {
        event.preventDefault();
        setError("");
        setIsSubmitting(true);
        const submitError = await onSubmit({ email, password });
        if (submitError) setError(submitError);
        setIsSubmitting(false);
      }}
    >
      {error && <p className="error">{error}</p>}
      <label className="form-field">
        <span>Email</span>
        <input type="email" placeholder="rupa@example.com" value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      <label className="form-field">
        <span>Password</span>
        <input type="password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} />
      </label>
      <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Logging in..." : "Login"}</button>
      <button type="button" className="ghost-link auth-switch-link" onClick={onSignup}>
        New here? Create an account
      </button>
    </form>
  );
}

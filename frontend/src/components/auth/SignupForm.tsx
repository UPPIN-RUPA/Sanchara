import { useState } from "react";
import type { SignupPayload } from "../../types/auth";

type Props = {
  onSubmit: (payload: SignupPayload) => Promise<string | null>;
  onLogin: () => void;
};

export function SignupForm({ onSubmit, onLogin }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <form
      className="auth-form"
      onSubmit={async (event) => {
        event.preventDefault();
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          return;
        }

        setError("");
        setIsSubmitting(true);
        const submitError = await onSubmit({ name, email, password });
        if (submitError) setError(submitError);
        setIsSubmitting(false);
      }}
    >
      {error && <p className="error">{error}</p>}
      <label className="form-field">
        <span>Name</span>
        <input type="text" placeholder="Rupa Uppin" value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label className="form-field">
        <span>Email</span>
        <input type="email" placeholder="rupa@example.com" value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      <label className="form-field">
        <span>Password</span>
        <input type="password" placeholder="Create a password" value={password} onChange={(event) => setPassword(event.target.value)} />
      </label>
      <label className="form-field">
        <span>Confirm password</span>
        <input type="password" placeholder="Confirm your password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
      </label>
      <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create account"}</button>
      <button type="button" className="ghost-link auth-switch-link" onClick={onLogin}>
        Already have an account? Login
      </button>
    </form>
  );
}

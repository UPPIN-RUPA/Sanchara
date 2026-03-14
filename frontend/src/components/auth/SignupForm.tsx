type Props = {
  onSubmit: () => void;
  onLogin: () => void;
};

export function SignupForm({ onSubmit, onLogin }: Props) {
  return (
    <form
      className="auth-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label className="form-field">
        <span>Name</span>
        <input type="text" placeholder="Rupa Uppin" />
      </label>
      <label className="form-field">
        <span>Email</span>
        <input type="email" placeholder="rupa@example.com" />
      </label>
      <label className="form-field">
        <span>Password</span>
        <input type="password" placeholder="Create a password" />
      </label>
      <label className="form-field">
        <span>Confirm password</span>
        <input type="password" placeholder="Confirm your password" />
      </label>
      <button type="submit">Create account</button>
      <button type="button" className="ghost-link auth-switch-link" onClick={onLogin}>
        Already have an account? Login
      </button>
    </form>
  );
}

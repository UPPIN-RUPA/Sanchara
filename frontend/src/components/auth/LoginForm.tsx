type Props = {
  onSubmit: () => void;
  onSignup: () => void;
};

export function LoginForm({ onSubmit, onSignup }: Props) {
  return (
    <form
      className="auth-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label className="form-field">
        <span>Email</span>
        <input type="email" placeholder="rupa@example.com" />
      </label>
      <label className="form-field">
        <span>Password</span>
        <input type="password" placeholder="Enter your password" />
      </label>
      <button type="submit">Login</button>
      <button type="button" className="ghost-link auth-switch-link" onClick={onSignup}>
        New here? Create an account
      </button>
    </form>
  );
}

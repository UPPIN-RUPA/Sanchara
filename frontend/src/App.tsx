import { useState } from "react";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { AppWorkspace } from "./pages/AppWorkspace";

type PublicView = "landing" | "login" | "signup" | "app";

export function App() {
  const [view, setView] = useState<PublicView>("landing");

  if (view === "landing") {
    return <LandingPage onStart={() => setView("signup")} onDemo={() => setView("app")} />;
  }

  if (view === "login") {
    return <LoginPage onLogin={() => setView("app")} onSignup={() => setView("signup")} />;
  }

  if (view === "signup") {
    return <SignupPage onSignup={() => setView("app")} onLogin={() => setView("login")} />;
  }

  return <AppWorkspace />;
}

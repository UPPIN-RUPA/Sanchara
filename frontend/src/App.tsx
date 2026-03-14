import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { AppWorkspace } from "./pages/AppWorkspace";

export function App() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={<LandingPage onStart={() => navigate("/signup")} onDemo={() => navigate("/login")} />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><AppWorkspace /></ProtectedRoute>} />
      <Route path="/timeline" element={<ProtectedRoute><AppWorkspace /></ProtectedRoute>} />
      <Route path="/timeline/:year" element={<ProtectedRoute><AppWorkspace /></ProtectedRoute>} />
      <Route path="/plans" element={<ProtectedRoute><AppWorkspace /></ProtectedRoute>} />
      <Route path="/plans/new" element={<ProtectedRoute><AppWorkspace /></ProtectedRoute>} />
      <Route path="/plans/:eventId" element={<ProtectedRoute><AppWorkspace /></ProtectedRoute>} />
      <Route path="/plans/:eventId/edit" element={<ProtectedRoute><AppWorkspace /></ProtectedRoute>} />
      <Route path="/savings" element={<ProtectedRoute><AppWorkspace /></ProtectedRoute>} />
      <Route path="/memories" element={<ProtectedRoute><AppWorkspace /></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><AppWorkspace /></ProtectedRoute>} />
      <Route path="/archive" element={<ProtectedRoute><AppWorkspace /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><AppWorkspace /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

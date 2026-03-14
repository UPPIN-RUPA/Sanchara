import { createContext, useEffect, useState, type ReactNode } from "react";
import {
  getCurrentUser,
  loginUser,
  setApiAccessToken,
  signupUser,
  type ApiError,
} from "../lib/api";
import type { AuthUser, LoginPayload, SignupPayload } from "../types/auth";

type AuthContextValue = {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => void;
};

const STORAGE_KEY = "sanchara.auth.token";

export const AuthContext = createContext<AuthContextValue | null>(null);

type Props = {
  children: ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  function storeToken(token: string | null) {
    if (token) {
      localStorage.setItem(STORAGE_KEY, token);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setApiAccessToken(token);
  }

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEY);
    if (!token) {
      setApiAccessToken(null);
      setIsBootstrapping(false);
      return;
    }

    storeToken(token);
    getCurrentUser()
      .then((user) => {
        setCurrentUser(user);
      })
      .catch(() => {
        storeToken(null);
        setCurrentUser(null);
      })
      .finally(() => {
        setIsBootstrapping(false);
      });
  }, []);

  async function login(payload: LoginPayload) {
    const response = await loginUser(payload);
    storeToken(response.access_token);
    setCurrentUser(response.user);
  }

  async function signup(payload: SignupPayload) {
    const response = await signupUser(payload);
    storeToken(response.access_token);
    setCurrentUser(response.user);
  }

  function logout() {
    storeToken(null);
    setCurrentUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: currentUser !== null,
        isBootstrapping,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

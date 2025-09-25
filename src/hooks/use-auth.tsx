import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type User = {
  email: string;
  role: "viewer" | "policymaker";
};

type AuthContextValue = {
  isAuthenticated: boolean;
  user: User | null;
  isPolicymaker: boolean;
  login: (args: { email: string; password: string }) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_STORAGE_KEY = "app_auth_token";
const AUTH_USER_KEY = "app_auth_user";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_STORAGE_KEY);
    const storedUser = localStorage.getItem(AUTH_USER_KEY);
    setIsAuthenticated(Boolean(token));
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const login = useCallback(async (args: { email: string; password: string }) => {
    // Mock credential check
    const isPolicyAdmin = args.email === "admin@policy.gov" && args.password === "policy123";
    const role: User["role"] = isPolicyAdmin ? "policymaker" : "viewer";
    const token = isPolicyAdmin ? "policy-token" : "viewer-token";
    localStorage.setItem(AUTH_STORAGE_KEY, token);
    const nextUser: User = { email: args.email, role };
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
    setIsAuthenticated(true);
    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, user, isPolicymaker: user?.role === "policymaker", login, logout }),
    [isAuthenticated, user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};



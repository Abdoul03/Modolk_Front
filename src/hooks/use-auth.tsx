import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, BackendUser, clearTokens, getTokens, setTokens } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  motDePasse: string;
  adresse?: string;
}

interface AuthCtx {
  user: BackendUser | null;
  loading: boolean;
  isAdmin: boolean;
  isClient: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  signOut: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<BackendUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tokens = getTokens();
    if (!tokens) { setLoading(false); return; }
    api.auth
      .profile()
      .then(({ user: u }) => setUser(u))
      .catch(() => clearTokens())
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const { user: u, tokens } = await api.auth.login({ email, password });
    setTokens(tokens);
    setUser(u);
  };

  const register = async (data: RegisterData) => {
    const { user: u, tokens } = await api.auth.register(data);
    setTokens(tokens);
    setUser(u);
  };

  const signOut = () => {
    clearTokens();
    setUser(null);
  };

  return (
    <Ctx.Provider
      value={{
        user,
        loading,
        isAdmin: user?.role === "ADMIN",
        isClient: user?.role === "CLIENT",
        login,
        register,
        signOut,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}

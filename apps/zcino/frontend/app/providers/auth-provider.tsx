"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type AuthMethod = "oauth" | "wallet";

type UserSession = {
  id: string;
  name: string;
  method: AuthMethod;
  walletAddress?: string;
};

type AuthContextValue = {
  user: UserSession | null;
  loginWithOAuth: (provider: "Google" | "GitHub" | "Okta") => void;
  loginWithWallet: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loginWithOAuth: (provider) => {
        setUser({ id: `oauth-${provider.toLowerCase()}`, name: `${provider} Operator`, method: "oauth" });
      },
      loginWithWallet: async () => {
        const ethereum = (window as Window & { ethereum?: { request: (request: { method: string }) => Promise<string[]> } }).ethereum;
        const accounts = ethereum ? await ethereum.request({ method: "eth_requestAccounts" }) : [];
        const walletAddress = accounts[0] ?? "0xZcinoDemoWallet000000000000000000000042";
        setUser({ id: walletAddress, name: shortenAddress(walletAddress), method: "wallet", walletAddress });
      },
      logout: () => setUser(null),
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

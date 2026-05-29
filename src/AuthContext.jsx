// Auth context — uses Clerk when VITE_CLERK_PUBLISHABLE_KEY is set, demo auth otherwise.
import React, { createContext, useContext, useState } from "react";

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// ── Demo auth (no Clerk key) ─────────────────────────────────────────────────
const AuthContext = createContext(null);

function DemoAuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userTier, setUserTier] = useState("free");
  const [userEmail, setUserEmail] = useState("");

  const login = (email, tier) => {
    setIsLoggedIn(true);
    setUserTier(tier || "free");
    setUserEmail(email || "");
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserTier("free");
    setUserEmail("");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userTier, userEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Clerk auth wrapper ───────────────────────────────────────────────────────
let ClerkProvider, useUser, useClerk;
if (CLERK_KEY) {
  ({ ClerkProvider, useUser, useClerk } = await import("@clerk/clerk-react"));
}

function ClerkAuthBridge({ children }) {
  const { user, isSignedIn } = useUser();
  const clerk = useClerk();

  const tier = user?.publicMetadata?.tier ?? "free";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  return (
    <AuthContext.Provider value={{
      isLoggedIn: !!isSignedIn,
      userTier: tier,
      userEmail: email,
      login: () => clerk.openSignIn(),
      logout: () => clerk.signOut(),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Public API ────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  if (CLERK_KEY && ClerkProvider) {
    return (
      <ClerkProvider publishableKey={CLERK_KEY} afterSignInUrl="/screener" afterSignUpUrl="/screener">
        <ClerkAuthBridge>{children}</ClerkAuthBridge>
      </ClerkProvider>
    );
  }
  return <DemoAuthProvider>{children}</DemoAuthProvider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

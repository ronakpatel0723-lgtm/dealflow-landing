// This is a demo auth system. Production auth will use Clerk or Supabase. Replace this file when ready.
import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userTier, setUserTier] = useState("free");
  const [userEmail, setUserEmail] = useState("");

  const login = (email, tier) => {
    setIsLoggedIn(true);
    setUserTier(tier);
    setUserEmail(email);
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

export function useAuth() {
  return useContext(AuthContext);
}

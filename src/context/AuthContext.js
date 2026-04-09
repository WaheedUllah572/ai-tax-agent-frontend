import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

// ✅ LIVE BACKEND URL
const API_BASE = "https://ai-tax-agent-backend-1.onrender.com";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );
  const [pendingEmail, setPendingEmail] = useState(null);

  // -------------------------------
  // REGISTER USER
  // -------------------------------
  const register = async (name, email, password) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    return await res.json();
  };

  // -------------------------------
  // LOGIN — Step 1
  // -------------------------------
  const loginStep1 = async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data["2fa_required"]) {
      setPendingEmail(email);
      return { twoFA: true };
    }

    if (data["login_success"]) {
      const userData = { email };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return { success: true };
    }

    return { error: true };
  };

  // -------------------------------
  // VERIFY OTP
  // -------------------------------
  const verify2FA = async (code) => {
    const res = await fetch(`${API_BASE}/auth/verify-2fa`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: pendingEmail, code }),
    });

    const data = await res.json();

    if (data["login_success"]) {
      const userData = { email: pendingEmail };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      setPendingEmail(null);
      return { success: true };
    }

    return { error: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        register,
        loginStep1,
        verify2FA,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
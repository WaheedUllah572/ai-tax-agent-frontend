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
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { error: data.detail || "Registration failed" };
      }

      return { success: true };
    } catch (err) {
      return { error: "Server error" };
    }
  };

  // -------------------------------
  // LOGIN — Step 1
  // -------------------------------
  const loginStep1 = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { error: data.detail || "Login failed" };
      }

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
    } catch {
      return { error: "Server error" };
    }
  };

  // -------------------------------
  // VERIFY OTP
  // -------------------------------
  const verify2FA = async (code) => {
    try {
      const res = await fetch(`${API_BASE}/auth/verify-2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { error: data.detail || "Invalid code" };
      }

      if (data["login_success"]) {
        const userData = { email: pendingEmail };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        setPendingEmail(null);
        return { success: true };
      }

      return { error: true };
    } catch {
      return { error: "Server error" };
    }
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
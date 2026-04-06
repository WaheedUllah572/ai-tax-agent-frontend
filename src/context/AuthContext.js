import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [pendingEmail, setPendingEmail] = useState(null);

  // -------------------------------
  // REGISTER USER (Backend)
  // -------------------------------
  const register = async (name, email, password) => {
    const res = await fetch("http://localhost:8000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    return data;
  };

  // -------------------------------
  // LOGIN — Step 1
  // -------------------------------
  const loginStep1 = async (email, password) => {
    const res = await fetch("http://localhost:8000/auth/login", {
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
      setUser({ email });
      localStorage.setItem("user", JSON.stringify({ email }));
      return { success: true };
    }

    return { error: true };
  };

  // -------------------------------
  // VERIFY OTP
  // -------------------------------
  const verify2FA = async (code) => {
    const res = await fetch("http://localhost:8000/auth/verify-2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: pendingEmail, code }),
    });

    const data = await res.json();

    if (data["login_success"]) {
      setUser({ email: pendingEmail });
      localStorage.setItem("user", JSON.stringify({ email: pendingEmail }));
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

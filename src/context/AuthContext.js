import React, {
  createContext,
  useContext,
  useState,
} from "react";

const AuthContext = createContext();

const API_BASE =
  process.env.REACT_APP_API_BASE_URL ||
  "https://ai-tax-agent-backend-1.onrender.com";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  // --------------------------------
  // REGISTER
  // --------------------------------

  const register = async (
    name,
    email,
    password
  ) => {
    try {
      const res = await fetch(
        `${API_BASE}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        return {
          error:
            data.detail ||
            "Registration failed",
        };
      }

      return {
        success: true,
      };

    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      return {
        error: "Server error",
      };
    }
  };

  // --------------------------------
  // LOGIN
  // --------------------------------

  const loginStep1 = async (
    email,
    password
  ) => {
    try {
      const res = await fetch(
        `${API_BASE}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        return {
          error:
            data.detail ||
            "Login failed",
        };
      }

      if (!data.login_success) {
        return {
          error: "Login failed",
        };
      }

      const userData = {
        name: data.name,
        email: data.email,
        role: data.role,
      };

      // Store user UI information
      localStorage.setItem(
        "user",
        JSON.stringify(userData)
      );

      // Store Supabase authentication tokens
      localStorage.setItem(
        "access_token",
        data.access_token
      );

      localStorage.setItem(
        "refresh_token",
        data.refresh_token
      );

      setUser(userData);

      return {
        success: true,
        role: data.role,
      };

    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      return {
        error: "Server error",
      };
    }
  };

  // --------------------------------
  // GET ACCESS TOKEN
  // --------------------------------

  const getAccessToken = () => {
    return localStorage.getItem(
      "access_token"
    );
  };

  // --------------------------------
  // LOGOUT
  // --------------------------------

  const logout = () => {
    setUser(null);

    localStorage.removeItem("user");
    localStorage.removeItem(
      "access_token"
    );
    localStorage.removeItem(
      "refresh_token"
    );

    // Prevent another user on the same
    // browser inheriting onboarding state.
    localStorage.removeItem(
      "onboarding_completed"
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        register,
        loginStep1,
        logout,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);
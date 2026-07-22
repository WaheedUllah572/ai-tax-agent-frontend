import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  UserIcon,
  LockClosedIcon,
} from "@heroicons/react/24/solid";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { loginStep1 } = useAuth();
  const navigate = useNavigate();

  // --------------------------------
  // LOGIN
  // --------------------------------

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const result = await loginStep1(
        email,
        password
      );

      if (result?.success) {
        // Public registration currently creates
        // business owners only.
        // Keep role routing for future invited
        // accountant accounts.
        if (result.role === "accountant") {
          navigate("/accountant");
        } else {
          navigate("/dashboard");
        }

        return;
      }

      alert(
        result?.error ||
          "Invalid email or password."
      );
    } catch (error) {
      console.error(
        "Login page error:",
        error
      );

      alert(
        "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-200 via-pink-100 to-blue-200 px-4">

      {/* LOGO + HEADER */}

      <div className="text-center mb-10 animate-fadeIn">
        <img
          src="/logo.png"
          alt="RefundPilot Logo"
          className="mx-auto h-32 w-32 mb-6 rounded-full bg-white object-contain p-2 pt-1 shadow-2xl"
        />

        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 drop-shadow-lg">
          Welcome to{" "}
          <span className="text-purple-600">
            RefundPilot
          </span>
        </h1>

        <p className="mt-4 text-gray-600 max-w-xl mx-auto text-base md:text-lg">
          AI-powered bookkeeping and tax
          management for modern businesses.
          Track receipts, mileage, invoices,
          and deductions—all in one place.
        </p>
      </div>

      {/* LOGIN CARD */}

      <div className="w-full max-w-md bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-gray-200">

        <div className="flex justify-center mb-4">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="User Avatar"
            className="w-20 h-20 rounded-full border-4 border-purple-300 shadow-md"
          />
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Sign in to your RefundPilot account
        </h2>

        <form
          onSubmit={handleLogin}
          className="space-y-4"
        >

          {/* EMAIL */}

          <div className="relative">
            <UserIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full pl-10 pr-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
              required
              autoComplete="email"
            />
          </div>

          {/* PASSWORD */}

          <div className="relative">
            <LockClosedIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full pl-10 pr-4 py-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
              required
              autoComplete="current-password"
            />
          </div>

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? "Signing In..."
              : "Sign In"}
          </button>

        </form>

        <p className="text-sm text-center text-gray-600 mt-6">
          Don&apos;t have an account?{" "}

          <Link
            to="/register"
            className="text-purple-600 font-semibold hover:underline"
          >
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}
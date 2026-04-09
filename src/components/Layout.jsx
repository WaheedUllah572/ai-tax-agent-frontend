import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  HomeIcon,
  ChatBubbleLeftRightIcon,
  DocumentArrowUpIcon,
  MapIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon,
  CreditCardIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");
  const [xeroConnected, setXeroConnected] = useState(false);

  // ✅ FIXED: Use ONLY one env variable (NO import.meta, NO localhost fallback)
  const baseUrl =
    process.env.REACT_APP_API_BASE_URL?.trim() ||
    "https://ai-tax-agent-backend-lxlw.onrender.com";

  // Load user
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.name) setUserName(storedUser.name);
    else if (storedUser?.username) setUserName(storedUser.username);
  }, []);

  // Check Xero status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await axios.get(`${baseUrl}/xero/status`);
        setXeroConnected(res.data?.connected === true);
      } catch {
        setXeroConnected(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    window.addEventListener("xero-status-updated", checkStatus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("xero-status-updated", checkStatus);
    };
  }, [baseUrl]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <HomeIcon className="h-5 w-5" /> },
    { name: "Chatbot", path: "/chatbot", icon: <ChatBubbleLeftRightIcon className="h-5 w-5" /> },
    { name: "Receipts", path: "/receipts", icon: <DocumentArrowUpIcon className="h-5 w-5" /> },
    { name: "Mileage", path: "/mileage", icon: <MapIcon className="h-5 w-5" /> },
    { name: "Reports", path: "/reports", icon: <ChartBarIcon className="h-5 w-5" /> },
  ];

  const xeroItems = [
    { name: "Xero Customers", path: "/xero/customers" },
    { name: "Xero Invoices", path: "/xero/invoices" },
    { name: "Xero Accounts", path: "/xero/accounts" },
  ];

  const subscriptionItems = [
    { name: "Join TaxMate", path: "/join", icon: <CreditCardIcon className="h-5 w-5" /> },
    {
      name: "Subscription Success",
      path: "/subscription-success",
      icon: <CheckCircleIcon className="h-5 w-5 text-green-600" />,
    },
    {
      name: "Subscription Cancel",
      path: "/subscription-cancel",
      icon: <XCircleIcon className="h-5 w-5 text-red-500" />,
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-gradient-to-b from-indigo-100 to-white border-r border-gray-200 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-center py-6 border-b border-gray-200">
            <img src="/logo.svg" className="h-10 w-10 mr-2 rounded-full bg-white shadow" />
            <h1 className="text-xl font-bold text-indigo-700">TaxMind AI</h1>
          </div>

          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition ${
                  location.pathname === item.path
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-indigo-100"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="border-t border-gray-200 mt-4 pt-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase px-4 mb-2">
              Xero Accounting
            </h4>

            <div className="mx-4 mb-4 flex items-center justify-between bg-white border border-gray-200 rounded-xl shadow-sm px-3 py-2">
              <div className="flex items-center gap-2">
                <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Xero</span>
              </div>

              <span
                className={`text-sm font-semibold ${
                  xeroConnected ? "text-green-600" : "text-red-500"
                }`}
              >
                {xeroConnected ? "🟢 Connected" : "🔴 Not Connected"}
              </span>
            </div>

            <nav className="p-2 space-y-2">
              {xeroItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition ${
                    location.pathname === item.path
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-blue-100"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="border-t border-gray-200 mt-4 pt-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase px-4 mb-2">
              Subscription
            </h4>

            <nav className="p-2 space-y-2">
              {subscriptionItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition ${
                    location.pathname === item.path
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-indigo-100"
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <Link to="/login" className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            Login
          </Link>

          <Link to="/register" className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <UserPlusIcon className="h-5 w-5" />
            Register
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="flex justify-between items-center bg-white border-b border-gray-200 px-6 py-4 shadow-sm sticky top-0">
          <h2 className="text-xl font-semibold text-gray-700">
            Welcome to TaxMate — meet <span className="text-indigo-600">Max</span> 👋
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Hello, {userName} 👋</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-1.5 rounded-full text-sm hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
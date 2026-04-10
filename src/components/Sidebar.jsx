import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  ChatBubbleLeftRightIcon,
  DocumentArrowUpIcon,
  MapIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";

// BASE URL
const BASE_URL =
  process.env.REACT_APP_API_BASE_URL?.trim() ||
  "https://ai-tax-agent-backend-1.onrender.com";

// MAIN NAVIGATION
const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: <HomeIcon className="h-5 w-5" /> },
  { name: "Chatbot", path: "/chatbot", icon: <ChatBubbleLeftRightIcon className="h-5 w-5" /> },
  { name: "Receipts", path: "/receipts", icon: <DocumentArrowUpIcon className="h-5 w-5" /> },
  { name: "Mileage", path: "/mileage", icon: <MapIcon className="h-5 w-5" /> },
  { name: "Reports", path: "/reports", icon: <ChartBarIcon className="h-5 w-5" /> },
];

// XERO PAGES
const xeroItems = [
  { name: "Xero Customers", path: "/xero/customers" },
  { name: "Xero Invoices", path: "/xero/invoices" },
  { name: "Xero Accounts", path: "/xero/accounts" },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const [xeroConnected, setXeroConnected] = useState(false);

  // CHECK XERO STATUS
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/xero/status`);
        setXeroConnected(res.data?.connected === true);
      } catch {
        setXeroConnected(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 20000);

    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="w-64 bg-gradient-to-b from-blue-50 via-white to-purple-50 shadow-xl hidden md:flex flex-col rounded-r-2xl">
      {/* Logo */}
      <div className="h-28 flex items-center justify-center gap-3 border-b">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-white shadow-md overflow-hidden">
          <img src="/logo.svg" alt="TaxMind AI Logo" className="h-full w-full object-contain p-2 pt-1" />
        </div>
        <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 drop-shadow-md">
          TaxMind AI
        </span>
      </div>

      {/* Xero Status */}
      <div className="mx-4 mt-3 mb-2 flex items-center justify-between bg-white border border-gray-200 rounded-xl shadow-sm px-3 py-2">
        <div className="flex items-center gap-2">
          <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-sm text-gray-700">Xero</span>
        </div>
        <span
          className={`text-sm font-semibold ${
            xeroConnected ? "text-green-600" : "text-red-500"
          }`}
        >
          {xeroConnected ? "🟢 Connected" : "🔴 Not Connected"}
        </span>
      </div>

      {/* MAIN NAV */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
              pathname === item.path
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:text-blue-600"
            }`}
          >
            {item.icon}
            {item.name}
          </Link>
        ))}
      </nav>

      {/* XERO SIDEBAR LINKS */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
          Xero Accounting
        </h4>

        {xeroItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition ${
              pathname === item.path
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-700 hover:bg-blue-100"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </aside>
  );
}

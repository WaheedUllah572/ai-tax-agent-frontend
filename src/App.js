import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Layout from "./components/Layout";

// Core Pages
import Dashboard from "./pages/Dashboard";
import ChatbotPage from "./pages/ChatbotPage";
import JoinTaxMate from "./pages/JoinTaxMate";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import SubscriptionCancel from "./pages/SubscriptionCancel";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ReceiptsPage from "./pages/ReceiptsPage";
import MileagePage from "./pages/MileagePage";
import ReportsPage from "./pages/ReportsPage";

// ✅ NEW — XERO PAGES
import XeroCustomers from "./pages/xero/Customers";
import XeroInvoices from "./pages/xero/Invoices";
import XeroAccounts from "./pages/xero/Accounts";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chatbot" element={<ChatbotPage />} />
        <Route path="/join" element={<JoinTaxMate />} />
        <Route path="/receipts" element={<ReceiptsPage />} />
        <Route path="/mileage" element={<MileagePage />} />
        <Route path="/reports" element={<ReportsPage />} />

        {/* ✅ Xero Routes (NEW) */}
        <Route path="/xero/customers" element={<XeroCustomers />} />
        <Route path="/xero/invoices" element={<XeroInvoices />} />
        <Route path="/xero/accounts" element={<XeroAccounts />} />
      </Route>

      {/* Payment Redirects */}
      <Route path="/subscription-success" element={<SubscriptionSuccess />} />
      <Route path="/subscription-cancel" element={<SubscriptionCancel />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;

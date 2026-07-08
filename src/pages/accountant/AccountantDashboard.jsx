import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://ai-tax-agent-backend-1.onrender.com";

export default function AccountantDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/accountant/dashboard`)
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  if (!data) {
    return <div className="p-8">Loading Accountant Dashboard...</div>;
  }

  return (
    <div className="p-8">

      <h1 className="text-3xl font-bold mb-8">
        Accountant Portal
      </h1>

      <div className="grid grid-cols-4 gap-6">

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">Receipts</h2>
          <p className="text-3xl font-bold">
            {data.total_receipts}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">Transactions</h2>
          <p className="text-3xl font-bold">
            {data.total_transactions}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">Mileage</h2>
          <p className="text-3xl font-bold">
            {data.total_mileage_logs}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">Expenses</h2>
          <p className="text-3xl font-bold">
            ${data.total_expenses}
          </p>
        </div>

      </div>

      {/* Clients Button */}
      <div className="mt-10">
        <Link
          to="/accountant/clients"
          className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
        >
          View All Clients →
        </Link>
      </div>

    </div>
  );
}
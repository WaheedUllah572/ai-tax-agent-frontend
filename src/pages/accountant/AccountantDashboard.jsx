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
    return (
      <div className="p-8 text-xl font-semibold">
        Loading Accountant Dashboard...
      </div>
    );
  }

  return (
    <div className="p-8">

      {/* Header */}

      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-4xl font-bold">
            Accountant Portal
          </h1>

          <p className="text-gray-500 mt-2">
            Overview of all accounting activities
          </p>
        </div>

        <Link
          to="/accountant/clients"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow"
        >
          View Clients
        </Link>

      </div>

      {/* Main Statistics */}

      <div className="grid grid-cols-4 gap-6">

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">
            Receipts
          </h2>

          <p className="text-3xl font-bold mt-2">
            {data.total_receipts}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">
            Transactions
          </h2>

          <p className="text-3xl font-bold mt-2">
            {data.total_transactions}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">
            Mileage Logs
          </h2>

          <p className="text-3xl font-bold mt-2">
            {data.total_mileage_logs}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">
            Total Expenses
          </h2>

          <p className="text-3xl font-bold mt-2 text-indigo-600">
            ${data.total_expenses}
          </p>
        </div>

      </div>

      {/* Receipt Status */}

      <h2 className="text-2xl font-bold mt-10 mb-4">
        Receipt Status
      </h2>

      <div className="grid grid-cols-4 gap-6">

        <div className="bg-green-50 rounded-xl shadow p-6">
          <h3 className="text-green-700">
            Approved
          </h3>

          <p className="text-3xl font-bold mt-2">
            {data.approved}
          </p>
        </div>

        <div className="bg-yellow-50 rounded-xl shadow p-6">
          <h3 className="text-yellow-700">
            Pending
          </h3>

          <p className="text-3xl font-bold mt-2">
            {data.pending}
          </p>
        </div>

        <div className="bg-blue-50 rounded-xl shadow p-6">
          <h3 className="text-blue-700">
            Reviewed
          </h3>

          <p className="text-3xl font-bold mt-2">
            {data.reviewed}
          </p>
        </div>

        <div className="bg-red-50 rounded-xl shadow p-6">
          <h3 className="text-red-700">
            Rejected
          </h3>

          <p className="text-3xl font-bold mt-2">
            {data.rejected}
          </p>
        </div>

      </div>

      {/* Deduction Summary */}

      <h2 className="text-2xl font-bold mt-10 mb-4">
        Deduction Summary
      </h2>

      <div className="grid grid-cols-2 gap-6">

        <div className="bg-white rounded-xl shadow p-6">

          <h3 className="text-gray-500">
            Deductible
          </h3>

          <p className="text-4xl font-bold text-green-600 mt-3">
            ${data.deductible_total}
          </p>

        </div>

        <div className="bg-white rounded-xl shadow p-6">

          <h3 className="text-gray-500">
            Non-Deductible
          </h3>

          <p className="text-4xl font-bold text-red-600 mt-3">
            ${data.non_deductible_total}
          </p>

        </div>

      </div>

      {/* Top Vendors */}

      <div className="bg-white rounded-xl shadow mt-10 p-6">

        <h2 className="text-2xl font-bold mb-6">
          Top Vendors
        </h2>

        <table className="w-full">

          <thead>

            <tr className="border-b">

              <th className="text-left p-3">
                Vendor
              </th>

              <th className="text-right p-3">
                Amount
              </th>

            </tr>

          </thead>

          <tbody>

            {data.top_vendors &&
              data.top_vendors.map(([vendor, amount]) => (

                <tr
                  key={vendor}
                  className="border-b hover:bg-gray-50"
                >

                  <td className="p-3">
                    {vendor}
                  </td>

                  <td className="text-right p-3 font-semibold">
                    ${Number(amount).toFixed(2)}
                  </td>

                </tr>

              ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://ai-tax-agent-backend-1.onrender.com";

export default function ClientProfile() {
  const { email } = useParams();

  const [client, setClient] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/accountant/client/${email}`)
      .then((res) => res.json())
      .then((data) => setClient(data));
  }, [email]);

  if (!client) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">

      <h1 className="text-3xl font-bold">
        {client.client.name}
      </h1>

      <p className="text-gray-500 mb-8">
        {client.client.email}
      </p>

      {/* Summary Cards */}

      <div className="grid grid-cols-3 gap-6 mb-10">

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">Receipts</h2>
          <p className="text-3xl font-bold">
            {client.receipts.length}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">Transactions</h2>
          <p className="text-3xl font-bold">
            {client.transactions.length}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500">Mileage</h2>
          <p className="text-3xl font-bold">
            {client.mileage.length}
          </p>
        </div>

      </div>

      {/* Receipt Workspace */}

      <div className="bg-white rounded-xl shadow">

        <div className="p-6 border-b">

          <h2 className="text-2xl font-semibold">
            Client Receipts
          </h2>

        </div>

        <table className="w-full">

          <thead className="bg-indigo-600 text-white">

            <tr>

              <th className="p-3 text-left">Vendor</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Action</th>

            </tr>

          </thead>

          <tbody>

            {client.receipts.map((receipt) => (

              <tr
                key={receipt.id}
                className="border-b hover:bg-gray-50"
              >

                <td className="p-3">
                  {receipt.vendor}
                </td>

                <td className="p-3">
                  ${receipt.amount}
                </td>

                <td className="p-3">
                  {receipt.category}
                </td>

                <td className="p-3">
                  {receipt.date}
                </td>

                <td className="p-3">

                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      receipt.status === "Locked"
                        ? "bg-green-100 text-green-700"
                        : receipt.status === "Rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {receipt.status || "Pending"}
                  </span>

                </td>

                <td className="p-3">

                  <Link
                    to="/accountant/receipts"
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                  >
                    Review
                  </Link>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}
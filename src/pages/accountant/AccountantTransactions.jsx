import React, { useEffect, useState } from "react";

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://ai-tax-agent-backend-1.onrender.com";

export default function AccountantTransactions() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetch(`${BASE_URL}/accountant/dashboard`)
      .then(res => res.json())
      .then(data => setTransactions(data.transactions || []));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Transactions
      </h1>

      <table className="w-full bg-white rounded-xl shadow">
        <thead className="bg-indigo-600 text-white">
          <tr>
            <th className="p-3 text-left">Description</th>
            <th className="p-3 text-left">Amount</th>
            <th className="p-3 text-left">Date</th>
          </tr>
        </thead>

        <tbody>
          {transactions.map((t, index) => (
            <tr key={index} className="border-b">
              <td className="p-3">{t.description}</td>
              <td className="p-3">${t.amount}</td>
              <td className="p-3">{t.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
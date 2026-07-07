import React, { useEffect, useState } from "react";

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://ai-tax-agent-backend-1.onrender.com";

export default function AccountantReceipts() {

  const [receipts, setReceipts] = useState([]);

  useEffect(() => {

    fetch(`${BASE_URL}/accountant/dashboard`)
      .then(res => res.json())
      .then(data => setReceipts(data.receipts || []));

  }, []);

  return (

    <div className="p-8">

      <h1 className="text-3xl font-bold mb-6">
        All Receipts
      </h1>

      <table className="w-full bg-white shadow rounded-lg">

        <thead className="bg-indigo-600 text-white">

          <tr>

            <th className="p-3 text-left">Vendor</th>
            <th className="p-3 text-left">Amount</th>
            <th className="p-3 text-left">Category</th>
            <th className="p-3 text-left">Date</th>

          </tr>

        </thead>

        <tbody>

          {receipts.map((receipt,index)=>(

            <tr key={index} className="border-b">

              <td className="p-3">{receipt.vendor}</td>
              <td className="p-3">${receipt.amount}</td>
              <td className="p-3">{receipt.category}</td>
              <td className="p-3">{receipt.date}</td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}
import React, { useEffect, useState } from "react";

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://ai-tax-agent-backend-1.onrender.com";

export default function AccountantMileage() {
  const [mileage, setMileage] = useState([]);

  useEffect(() => {
    fetch(`${BASE_URL}/accountant/dashboard`)
      .then(res => res.json())
      .then(data => setMileage(data.mileage || []));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Mileage Logs
      </h1>

      <table className="w-full bg-white rounded-xl shadow">
        <thead className="bg-indigo-600 text-white">
          <tr>
            <th className="p-3 text-left">Date</th>
            <th className="p-3 text-left">Distance</th>
            <th className="p-3 text-left">Purpose</th>
          </tr>
        </thead>

        <tbody>
          {mileage.map((m, index) => (
            <tr key={index} className="border-b">
              <td className="p-3">{m.date}</td>
              <td className="p-3">{m.distance}</td>
              <td className="p-3">{m.purpose}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
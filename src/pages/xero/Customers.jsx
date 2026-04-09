import { useEffect, useState } from "react";
import axios from "axios";

export default function XeroCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ FIXED
  const BASE_URL =
    process.env.REACT_APP_API_BASE_URL ||
    "https://ai-tax-agent-backend-lxlw.onrender.com";

  useEffect(() => {
    axios
      .get(`${BASE_URL}/xero/customers`)
      .then((res) => setCustomers(res.data || []))
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false));
  }, [BASE_URL]);

  if (loading) {
    return <p className="p-8">Loading Xero Customers...</p>;
  }

  if (customers.length === 0) {
    return <p className="p-8">No customers found in Xero.</p>;
  }

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6">Xero Customers</h2>
      <table className="w-full border">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Phone</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c, i) => (
            <tr key={i}>
              <td className="p-3">{c.Name}</td>
              <td className="p-3">{c.EmailAddress || "—"}</td>
              <td className="p-3">{c.Phones?.[0]?.PhoneNumber || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
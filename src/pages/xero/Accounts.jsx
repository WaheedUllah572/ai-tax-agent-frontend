import { useEffect, useState } from "react";
import axios from "axios";

// Helper: safely display values
const safeValue = (val) => {
  if (!val) return "—";
  if (typeof val === "object") {
    return (
      val.Name ||
      val.value ||
      val.FreeFormNumber ||
      JSON.stringify(val)
    );
  }
  return val;
};

export default function XeroAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ FIXED: removed localhost fallback
  const BASE_URL =
    process.env.REACT_APP_API_BASE_URL ||
    "https://ai-tax-agent-backend-lxlw.onrender.com";

  useEffect(() => {
    axios
      .get(`${BASE_URL}/xero/accounts`)
      .then((res) => setAccounts(res.data.accounts || []))
      .catch(() => setAccounts([]))
      .finally(() => setLoading(false));
  }, [BASE_URL]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
        <p className="text-lg text-gray-600">Loading Xero Accounts...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-yellow-50 via-white to-orange-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Xero Accounts
      </h2>

      {accounts.length === 0 ? (
        <p className="text-gray-600 text-lg">No accounts found in Xero.</p>
      ) : (
        <table className="w-full border border-gray-200 rounded-lg shadow-lg">
          <thead className="bg-yellow-600 text-white">
            <tr>
              <th className="p-3 text-left">Account Name</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Code</th>
              <th className="p-3 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((acc, i) => (
              <tr key={i} className="odd:bg-white even:bg-yellow-50">
                <td className="p-3">{safeValue(acc.Name)}</td>
                <td className="p-3">{safeValue(acc.Type)}</td>
                <td className="p-3">{safeValue(acc.Code)}</td>
                <td className="p-3">{safeValue(acc.Description)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
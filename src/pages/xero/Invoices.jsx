import { useEffect, useState } from "react";
import axios from "axios";

export default function XeroInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ FIXED
  const BASE_URL =
    process.env.REACT_APP_API_BASE_URL ||
    "https://ai-tax-agent-backend-1.onrender.com";

  useEffect(() => {
    axios
      .get(`${BASE_URL}/xero/invoices`)
      .then((res) => setInvoices(res.data.invoices || []))
      .catch(() => setInvoices([]))
      .finally(() => setLoading(false));
  }, [BASE_URL]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <p className="text-lg text-gray-600">Loading Xero Invoices...</p>
      </div>
    );

  return (
    <div className="p-8 bg-gradient-to-br from-purple-50 via-white to-indigo-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Xero Invoices
      </h2>

      {invoices.length === 0 ? (
        <p className="text-gray-600 text-lg">No invoices found in Xero.</p>
      ) : (
        <table className="w-full border border-gray-200 rounded-lg shadow-lg">
          <thead className="bg-purple-600 text-white">
            <tr>
              <th className="p-3 text-left">Invoice #</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">Due Date</th>
              <th className="p-3 text-left">Amount Due</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, i) => (
              <tr key={i} className="odd:bg-white even:bg-purple-50">
                <td className="p-3">{inv.InvoiceNumber || "—"}</td>
                <td className="p-3">{inv.Contact?.Name || "—"}</td>
                <td className="p-3">${inv.Total || "0.00"}</td>
                <td className="p-3">{inv.DueDate || "—"}</td>
                <td className="p-3">${inv.AmountDue || "0.00"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
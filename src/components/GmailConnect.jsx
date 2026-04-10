import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  window.__API_BASE_URL__ ||
  "https://ai-tax-agent-backend-1.onrender.com";

export default function GmailConnect() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("checking");
  const [expanded, setExpanded] = useState(null);

  // ---------------------------------------------
  // CHECK GMAIL CONNECTION STATUS
  // ---------------------------------------------
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/gmail/status`);
        setStatus(res.data.connected ? "connected" : "not_connected");
      } catch {
        setStatus("not_connected");
      }
    };
    fetchStatus();
  }, []);

  // ---------------------------------------------
  // CONNECT GMAIL
  // ---------------------------------------------
  const handleConnect = () => {
    window.open(`${BASE_URL}/gmail/connect`, "_blank", "width=600,height=800");
  };

  // ---------------------------------------------
  // FETCH RECEIPTS
  // ---------------------------------------------
  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/gmail/receipts?year=${year}`);
      setReceipts(res.data.receipts || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch receipts.");
    }
    setLoading(false);
  };

  return (
    <div className="p-8 rounded-3xl shadow-xl border border-gray-200 bg-white/90 backdrop-blur-xl">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Gmail Receipt Scanner
          </h2>

          {/* STATUS */}
          <div className="mt-1">
            {status === "checking" && (
              <span className="text-gray-500 text-sm animate-pulse">
                Checking connection…
              </span>
            )}

            {status === "connected" && (
              <span className="text-green-600 font-semibold text-sm">
                ● Connected
              </span>
            )}

            {status === "not_connected" && (
              <span className="text-red-500 font-semibold text-sm">
                ● Not Connected
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleConnect}
          className="px-6 py-2 rounded-xl bg-red-500 text-white font-semibold shadow hover:bg-red-600 transition"
        >
          Connect Gmail
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex items-center gap-4 mb-6">
        <label className="font-semibold text-gray-700">Tax Year:</label>

        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-800"
        >
          {Array.from({ length: 6 }).map((_, i) => {
            const y = 2021 + i;
            return (
              <option key={y} value={y}>
                {y}
              </option>
            );
          })}
        </select>

        <button
          onClick={fetchReceipts}
          className="px-5 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
        >
          Fetch Receipts
        </button>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex flex-col items-center mt-6 mb-6">
          <div className="loader-arc"></div>
          <p className="mt-3 text-gray-600">Scanning emails…</p>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Vendor</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Snippet</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {receipts.length === 0 && !loading && (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  No receipts found for this year.
                </td>
              </tr>
            )}

            {receipts.map((r, i) => (
              <>
                <tr key={i} className="hover:bg-indigo-50 transition">
                  <td className="px-4 py-3 text-gray-700">{r.date || "—"}</td>
                  <td className="px-4 py-3 text-gray-700 font-medium">{r.vendor || "Unknown"}</td>
                  <td className="px-4 py-3 text-green-600 font-semibold">{r.amount || "—"}</td>
                  <td className="px-4 py-3 text-gray-700">{r.category || "—"}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                    {r.email_snippet}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setExpanded(expanded === i ? null : i)}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                      {expanded === i ? "Hide" : "View"}
                    </button>
                  </td>
                </tr>

                {expanded === i && (
                  <tr className="bg-gray-50">
                    <td colSpan="6" className="px-6 py-4">
                      <pre className="bg-white border border-gray-200 rounded-xl p-4 shadow text-sm overflow-auto">
                        {r.analysis}
                      </pre>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

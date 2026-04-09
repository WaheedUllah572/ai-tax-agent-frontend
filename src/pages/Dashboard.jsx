import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  EnvelopeIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement
);

export default function Dashboard() {
  const BASE_URL = "https://ai-tax-agent-backend-1.onrender.com";

  const [gmailConnected, setGmailConnected] = useState(false);
  const [xeroConnected, setXeroConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const [totalReceipts, setTotalReceipts] = useState(0);
  const [totalSpending, setTotalSpending] = useState("0.00");
  const [topVendor, setTopVendor] = useState("—");
  const [monthlyData, setMonthlyData] = useState([]);
  const [deductions, setDeductions] = useState({});
  const [gmailResults, setGmailResults] = useState([]);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    fetchStatus();
    setTimeout(() => {
      fetchAnalytics();
      setLoading(false);
    }, 1200);
  }, []);

  const fetchStatus = async () => {
    try {
      const gmail = await axios.get(`${BASE_URL}/gmail/status`);
      setGmailConnected(gmail.data.connected);

      const xero = await axios.get(`${BASE_URL}/xero/status`);
      setXeroConnected(xero.data.connected);
    } catch (err) {
      console.error("Status error:", err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/receipts/all`);
      const receipts = res.data || [];

      setTotalReceipts(receipts.length);

      let sum = 0;
      let vendorMap = {};
      let monthMap = Array(12).fill(0);
      let deductionMap = {};

      receipts.forEach((r) => {
        const amount =
        parseFloat(
        String(r.amount || "0").replace(/[^\d.]/g, "")
       ) || 0;

        const vendor = r.vendor || "Unknown";
        const date = r.date ? new Date(r.date) : null;

        const deduction = r.deduction_type || "Uncategorized";
        deductionMap[deduction] = (deductionMap[deduction] || 0) + amount;

        sum += amount;
        vendorMap[vendor] = (vendorMap[vendor] || 0) + 1;

        if (date && !isNaN(date)) {
          const monthIndex = date.getMonth();
          monthMap[monthIndex] += amount;
        }
      });

      setTotalSpending(sum.toFixed(2));

      const sorted = Object.entries(vendorMap).sort(
        (a, b) => b[1] - a[1]
      );

      setTopVendor(sorted[0]?.[0] || "—");
      setMonthlyData(monthMap);
      setDeductions(deductionMap);

    } catch (err) {
      console.error("Analytics error:", err);
    }
  };

  const scanGmailReceipts = async () => {
    setScanning(true);
    try {
      const res = await axios.get(`${BASE_URL}/gmail/scan`);
      setGmailResults(res.data.receipts || []);
      alert(`Imported ${res.data.imported} receipts from Gmail`);
    } catch (err) {
      console.error("Gmail scan error:", err);
    }
    setScanning(false);
  };

  const connectXero = () => {
    window.location.href = `${BASE_URL}/xero/connect`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-200 via-white to-purple-200">
        <div className="animate-spin w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-indigo-100 via-white to-purple-100">
      <h1 className="text-5xl font-extrabold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-12">
        TaxMate Analytics Dashboard
      </h1>

      <div className="flex justify-center mb-8">
        <button
          onClick={scanGmailReceipts}
          disabled={scanning}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl shadow flex items-center gap-2 hover:scale-[1.02] transition disabled:opacity-70"
        >
          {scanning && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          )}
          {scanning ? "Scanning Gmail..." : "Scan Gmail for Receipts"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
        <KPI title="Total Receipts" value={totalReceipts} />
        <KPI title="Total Spending" value={`$${totalSpending}`} />
        <KPI title="Top Vendor" value={topVendor} />
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-xl border mb-12">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-700">
            AI Tax Deduction Insights
          </h3>
          <span className="text-xs bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full">
            Auto-Analyzed
          </span>
        </div>

        {Object.entries(deductions).map(([type, value]) => (
          <div
            key={type}
            className="flex justify-between border-b py-2 text-sm"
          >
            <span className="font-medium">{type}</span>
            <span className="text-green-600 font-semibold">
              ${value.toFixed(2)}
            </span>
          </div>
        ))}

        <div className="mt-4">
          <button
            onClick={() => window.open(`${BASE_URL}/reports/tax-report`)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:scale-[1.02] transition"
          >
            Download Tax Report
          </button>
        </div>
      </div>
    </div>
  );
}

function KPI({ title, value }) {
  return (
    <div className="p-6 rounded-3xl shadow-xl bg-white border hover:scale-[1.02] transition">
      <h3 className="font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-3xl font-extrabold text-indigo-600">{value}</p>
    </div>
  );
}
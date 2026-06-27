import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

import {
  Doughnut,
  Line,
} from "react-chartjs-2";

import axios from "axios";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

export default function Dashboard() {

  const BASE_URL =
    "https://ai-tax-agent-backend-1.onrender.com";

  const [analytics, setAnalytics] = useState({
  total_receipts: 0,
  total_spending: 0,
  top_vendor: "N/A",
  monthly_data: {},
  category_data: {},
  vendor_data: {},
  needs_review_count: 0
});

const [reviewCount, setReviewCount] =
  useState(0);
  const [gmailConnected, setGmailConnected] =
    useState(false);

  const [scanning, setScanning] =
    useState(false);

  useEffect(() => {
    fetchAnalytics();
    checkGmailStatus();
  }, []);

  const checkGmailStatus = async () => {

    try {

      const res = await axios.get(
        `${BASE_URL}/gmail/status`
      );

      setGmailConnected(
        res.data.connected
      );

    } catch (err) {

      console.error(err);
    }
  };

  const fetchAnalytics = async () => {

    try {

      const res = await axios.get(
        `${BASE_URL}/reports/analytics`
      );

      setAnalytics(res.data);
      setReviewCount(
  res.data.needs_review_count || 0
);

    } catch (err) {

      console.error(err);
    }
  };

  const connectGmail = () => {

    window.location.href =
      `${BASE_URL}/gmail/connect`;
  };

  const scanGmailReceipts = async () => {

    try {

      setScanning(true);

      const res = await axios.get(
        `${BASE_URL}/gmail/scan`
      );

      alert(
        `Imported ${res.data.imported} receipts from Gmail`
      );

      fetchAnalytics();

    } catch (err) {

      console.error(err);

      alert(
        "Failed to scan Gmail receipts"
      );

    } finally {

      setScanning(false);
    }
  };

  if (!analytics) {

    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading dashboard...
      </div>
    );
  }

  const monthlyChart = {

    labels: Object.keys(analytics.monthly_data || {}),

    datasets: [
      {
        label: "Monthly Spending",

        data: Object.values(analytics.monthly_data || {}),
      },
    ],
  };

  const categoryChart = {

    labels: Object.keys(
  analytics.category_data || {}
),

    datasets: [
      {
        data: Object.values(
  analytics.category_data || {}
),
      },
    ],
  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 p-8">

      <h1 className="text-5xl font-extrabold text-center mb-12 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        TaxMate Analytics Dashboard
      </h1>

      {/* GMAIL SECTION */}
      <div className="bg-white p-6 rounded-3xl shadow-xl mb-10">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>

            <h2 className="text-2xl font-bold mb-2">
              Gmail Receipt Import
            </h2>

            <p className="text-gray-600">
              Automatically scan Gmail for receipts and business expenses.
            </p>

          </div>

          <div className="flex gap-4">

            {!gmailConnected ? (

              <button
                onClick={connectGmail}
                className="bg-red-500 text-white px-5 py-3 rounded-xl shadow hover:scale-[1.02] transition"
              >
                Connect Gmail
              </button>

            ) : (

              <button
                onClick={scanGmailReceipts}
                disabled={scanning}
                className="bg-indigo-600 text-white px-5 py-3 rounded-xl shadow hover:scale-[1.02] transition disabled:opacity-60"
              >
                {scanning
                  ? "Scanning..."
                  : "Scan Gmail Receipts"}
              </button>

            )}

          </div>

        </div>

      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        <Card
          title="Total Receipts"
          value={analytics.total_receipts}
        />

        <Card
          title="Total Spending"
          value={`$${analytics.total_spending}`}
        />

        <Card
          title="Top Vendor"
          value={analytics.top_vendor}
        />

        <Card
  title="Needs Review"
  value={reviewCount}
/>

      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <div className="bg-white p-6 rounded-3xl shadow-xl">

          <h2 className="text-xl font-bold mb-6">
            Monthly Spending Trend
          </h2>

          <Line data={monthlyChart} />

        </div>

        <div className="bg-white p-6 rounded-3xl shadow-xl">

          <h2 className="text-xl font-bold mb-6">
            Expense Categories
          </h2>

          <Doughnut data={categoryChart} />

        </div>

      </div>

      {/* REPORT EXPORT */}
      <div className="bg-white p-6 rounded-3xl shadow-xl mt-10">

        <div className="flex items-center justify-between mb-4">

          <h2 className="text-xl font-bold">
            AI Tax Reports
          </h2>

          <span className="text-xs bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full">
            IRS Ready
          </span>

        </div>

        <p className="text-gray-600 mb-5">
          Export deduction summaries and business expense reports instantly.
        </p>

        <button
          onClick={() =>
            window.open(
              `${BASE_URL}/reports/tax-report`
            )
          }
          className="bg-green-600 text-white px-5 py-3 rounded-xl shadow hover:scale-[1.02] transition"
        >
          Download Tax Report
        </button>

      </div>

      {/* Vendors */}
      <div className="bg-white p-6 rounded-3xl shadow-xl mt-10">

        <h2 className="text-xl font-bold mb-6">
          Vendor Insights
        </h2>

        {Object.entries(
          analytics.vendor_data
        ).map(([vendor, amount]) => (

          <div
            key={vendor}
            className="flex justify-between border-b py-3"
          >

            <span className="font-medium">
              {vendor}
            </span>

            <span className="text-green-600 font-semibold">
              ${Number(amount || 0).toFixed(2)}
            </span>

          </div>
        ))}
      </div>
    </div>
  );
}

function Card({ title, value }) {

  return (

    <div className="bg-white p-6 rounded-3xl shadow-xl">

      <h3 className="text-gray-600 font-medium mb-3">
        {title}
      </h3>

      <p className="text-4xl font-extrabold text-indigo-600">
        {value}
      </p>
    </div>
  );
}
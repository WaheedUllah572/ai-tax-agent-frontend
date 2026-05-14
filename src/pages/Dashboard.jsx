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
  Bar,
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

  const [analytics, setAnalytics] =
    useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {

    try {

      const res = await axios.get(
        `${BASE_URL}/reports/analytics`
      );

      setAnalytics(res.data);

    } catch (err) {

      console.error(err);
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

    labels: Object.keys(
      analytics.monthly_data
    ),

    datasets: [
      {
        label: "Monthly Spending",

        data: Object.values(
          analytics.monthly_data
        ),
      },
    ],
  };

  const categoryChart = {

    labels: Object.keys(
      analytics.category_data
    ),

    datasets: [
      {
        data: Object.values(
          analytics.category_data
        ),
      },
    ],
  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 p-8">

      <h1 className="text-5xl font-extrabold text-center mb-12 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        TaxMate Analytics Dashboard
      </h1>

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
              ${amount.toFixed(2)}
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
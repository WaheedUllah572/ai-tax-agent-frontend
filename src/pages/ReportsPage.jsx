import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import {
  DocumentArrowDownIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/solid";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function ReportsPage() {
  const [summary, setSummary] = useState({});
  const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EC4899"];

  useEffect(() => {
  const BASE_URL =
    process.env.REACT_APP_API_BASE_URL?.trim() ||
    "https://ai-tax-agent-backend-1.onrender.com";

  fetch(`${BASE_URL}/reports/analytics`)
  .then((res) => res.json())
  .then((data) =>
    setSummary({
      Receipts: data.total_receipts,
      Spending: data.total_spending,
      Categories: Object.keys(data.category_data || {}).length,
      "Needs Review": data.needs_review_count,
    })
  )
    .catch(() => {});
}, []);
  const downloadPDF = () => {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text("RefundPilot", 20, 20);

  doc.setFontSize(16);
  doc.text("Expense Report", 20, 32);

  doc.setFontSize(11);
  doc.text(
    `Generated: ${new Date().toLocaleString()}`,
    20,
    42
  );

  let y = 60;

  Object.entries(summary).forEach(([key, value]) => {
    doc.text(`${key}: ${value}`, 20, y);
    y += 10;
  });

  doc.save("RefundPilot_Report.pdf");
};

  const downloadCSV = () => {
  const BASE_URL =
    process.env.REACT_APP_API_BASE_URL?.trim() ||
    "https://ai-tax-agent-backend-1.onrender.com";

  window.open(`${BASE_URL}/reports/tax-report`, "_blank");
};

  const emailReport = () => {
    const subject = encodeURIComponent("Your Expense Summary");
    const body = encodeURIComponent(
      Object.entries(summary)
        .map(([k,v]) => `${k}: ${v}`)
        .join("\n")
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const data = Object.entries(summary).map(([key, value]) => ({
    name: key,
    value,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Business Reports
        </h2>
        <p className="text-gray-600">
          Generate professional reports for taxes, bookkeeping and business performance.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-md mb-10">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">
          Expense Breakdown
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

  <div className="bg-white rounded-xl shadow p-6">
    <p className="text-gray-500">Receipts</p>
    <h2 className="text-3xl font-bold">
      {summary.Receipts || 0}
    </h2>
  </div>

  <div className="bg-white rounded-xl shadow p-6">
    <p className="text-gray-500">Total Spending</p>
    <h2 className="text-3xl font-bold text-green-600">
      ${summary.Spending || 0}
    </h2>
  </div>

  <div className="bg-white rounded-xl shadow p-6">
    <p className="text-gray-500">Categories</p>
    <h2 className="text-3xl font-bold">
      {summary.Categories || 0}
    </h2>
  </div>

  <div className="bg-white rounded-xl shadow p-6">
    <p className="text-gray-500">Needs Review</p>
    <h2 className="text-3xl font-bold text-red-500">
      {summary["Needs Review"] || 0}
    </h2>
  </div>

</div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              dataKey="value"
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={downloadPDF}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-white font-medium bg-gradient-to-r from-blue-500 to-purple-600 hover:scale-105 transition"
        >
          <DocumentArrowDownIcon className="h-5 w-5" />
          Export PDF
        </button>

        <button
  onClick={downloadCSV}
  className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-white font-medium bg-gradient-to-r from-indigo-500 to-blue-600 hover:scale-105 transition"
>
  Export CSV
</button>
        <button
          onClick={emailReport}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-white font-medium bg-gradient-to-r from-green-500 to-teal-600 hover:scale-105 transition"
        >
          <EnvelopeIcon className="h-5 w-5" />
          Share with Accountant
        </button>
      </div>
    </div>
  );
}

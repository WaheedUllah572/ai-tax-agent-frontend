import React, { useState, useRef, useEffect } from "react";
import { CloudArrowUpIcon, CameraIcon } from "@heroicons/react/24/outline";

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState([]);
  const [cameraMode, setCameraMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("All");
  const [editingReceipt, setEditingReceipt] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const BASE_URL = "https://ai-tax-agent-backend-1.onrender.com";

  useEffect(() => {
    fetchReceipts();
  }, []);

  const formatAmount = (amount) => {
    const num = parseFloat(
      String(amount || "0").replace(/[^\d.]/g, "")
    );
    return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const fetchReceipts = async () => {
    const res = await fetch(`${BASE_URL}/receipts/all`);
    const data = await res.json();

    const receiptsArray = Array.isArray(data) ? data : data.receipts || [];

    const formatted = receiptsArray.map((r) => ({
      id: r.id,
      name: r.filename,
      url: `${BASE_URL}/uploads/${r.filename}`,
      vendor: r.vendor,
      date: r.date,
      rawAmount: r.amount, // keep raw numeric
      amount: formatAmount(r.amount), // formatted for UI
      category: r.category || "Uncategorized",
      document_type: r.document_type || "Unknown",
      deduction_type: r.deduction_type || "Uncategorized",
      irsCategory: r.irs_category || "General Business Expense",
      type: "Business",
      status: r.status || "Pending",
      aiProcessed: true,
    }));

    setReceipts(formatted);
  };

  const processReceipt = async (file) => {
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${BASE_URL}/receipts/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.success) {
      fetchReceipts();
      setMessage("Receipt processed successfully");
    }

    setUploading(false);
  };

  const approveReceipt = async (id) => {
    await fetch(`${BASE_URL}/receipts/approve/${id}`, { method: "PUT" });

    setReceipts((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "Approved" } : r
      )
    );
  };

  const deleteReceipt = async (id) => {
    await fetch(`${BASE_URL}/receipts/${id}`, { method: "DELETE" });

    setReceipts((prev) => prev.filter((r) => r.id !== id));
  };

  const saveEdit = async () => {
    await fetch(`${BASE_URL}/receipts/update/${editingReceipt.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendor: editingReceipt.vendor,
        amount: editingReceipt.rawAmount, // send raw amount only
        category: editingReceipt.category,
        date: editingReceipt.date,
      }),
    });

    setEditingReceipt(null);
    fetchReceipts();
  };

  const filteredReceipts = receipts.filter((r) => {
    if (filter === "All") return true;
    return r.status === filter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8 relative">

      {uploading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-purple-700 font-semibold">
              AI is analyzing your document...
            </p>
          </div>
        </div>
      )}

      {message && (
        <div className="fixed bottom-6 right-6 bg-black text-white px-5 py-3 rounded-lg shadow-lg">
          {message}
        </div>
      )}

      <div className="text-center mb-8">
        <h2 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Manage Your Receipts
        </h2>
        <p className="text-gray-600">
          AI automatically categorizes & prepares IRS-ready expenses.
        </p>
      </div>

      <div className="flex gap-3 justify-center mb-8">
        {["All", "Pending", "Approved"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              filter === f
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4 mb-10">
        <label
          htmlFor="file-upload"
          className="cursor-pointer w-full max-w-2xl border-2 border-dashed border-purple-300 bg-white rounded-2xl p-10 flex flex-col items-center justify-center shadow hover:shadow-lg transition"
        >
          <CloudArrowUpIcon className="h-12 w-12 text-purple-500 mb-4" />
          <p>Upload receipts</p>

          <input
            id="file-upload"
            type="file"
            multiple
            className="hidden"
            ref={fileInputRef}
            onChange={(e) =>
              Array.from(e.target.files).forEach(processReceipt)
            }
          />
        </label>

        <button
          onClick={() => fileInputRef.current.click()}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-2 rounded-xl shadow hover:scale-105 transition"
        >
          <CameraIcon className="h-5 w-5 inline mr-2" />
          Upload Photo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredReceipts.map((r) => (
          <div key={r.id} className="bg-white p-4 rounded-2xl shadow-md border hover:shadow-xl transition relative">

            <img
              src={r.url}
              alt={r.name}
              className="rounded-xl h-40 w-full object-cover mb-3"
            />

            <h3 className="font-semibold">{r.vendor}</h3>
            <p className="text-sm text-gray-500">{r.date}</p>

            <div className="mt-3 text-sm">
              <p><strong>Category:</strong> {r.category}</p>
              <p><strong>Deduction:</strong> {r.deduction_type}</p>
              <p className="font-bold text-green-600 mt-2 text-lg">{r.amount}</p>
            </div>

            {r.status === "Pending" && (
              <button
                onClick={() => approveReceipt(r.id)}
                className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg"
              >
                Approve
              </button>
            )}

            <button
              onClick={() => setEditingReceipt({ ...r })}
              className="mt-2 w-full bg-blue-500 text-white py-2 rounded-lg"
            >
              Edit
            </button>

            <button
              onClick={() => deleteReceipt(r.id)}
              className="mt-2 w-full bg-red-500 text-white py-2 rounded-lg"
            >
              Delete
            </button>

          </div>
        ))}
      </div>

      {editingReceipt && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-96">

            <h2 className="text-xl font-bold mb-4">Edit Receipt</h2>

            <input
              className="border p-2 w-full mb-2"
              value={editingReceipt.vendor}
              onChange={(e) =>
                setEditingReceipt({ ...editingReceipt, vendor: e.target.value })
              }
            />

            <input
              className="border p-2 w-full mb-2"
              value={editingReceipt.rawAmount}
              onChange={(e) =>
                setEditingReceipt({ ...editingReceipt, rawAmount: e.target.value })
              }
            />

            <input
              className="border p-2 w-full mb-2"
              value={editingReceipt.category}
              onChange={(e) =>
                setEditingReceipt({ ...editingReceipt, category: e.target.value })
              }
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={saveEdit}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>

              <button
                onClick={() => setEditingReceipt(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
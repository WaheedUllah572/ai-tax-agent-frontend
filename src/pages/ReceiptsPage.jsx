import React, { useState, useRef, useEffect } from "react";
import { CloudArrowUpIcon, CameraIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
export default function ReceiptsPage() {
  const { refreshAccessToken } = useAuth();
  const [receipts, setReceipts] = useState([]);
  const [cameraMode, setCameraMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("All");
  const [editingReceipt, setEditingReceipt] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const BASE_URL = "https://ai-tax-agent-backend-1.onrender.com";
  const authenticatedFetch = async (url, options = {}) => {
  let token = localStorage.getItem("access_token");

  let response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  // Access token expired → refresh it and retry once
  if (response.status === 401) {
    token = await refreshAccessToken();

    if (!token) {
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      window.location.href = "/login";
      return response;
    }

    response = await fetch(url, {
  ...options,
  headers: {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  },
});
}

return response;
};

  useEffect(() => {
    fetchReceipts();
  }, []);

  // ✅ FIXED: dynamic currency formatting
  const formatAmount = (amount, currency) => {
    const num = parseFloat(
      String(amount || "0").replace(/[^\d.]/g, "")
    );

    const token = localStorage.getItem("access_token");

const authHeaders = {
Authorization:`Bearer ${token}`
};

    const formatted = num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    if (currency === "PKR") return `Rs ${formatted}`;
    if (currency === "USD") return `$${formatted}`;
    if (currency === "EUR") return `€${formatted}`;

    return `${formatted}`;
  };

  const fetchReceipts = async () => {
    const token = localStorage.getItem("access_token");

const res = await fetch(
  `${BASE_URL}/receipts/all`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
    const data = await res.json();

    const receiptsArray = Array.isArray(data)
      ? data
      : data.receipts || [];

    const formatted = receiptsArray.map((r) => ({
      id: r.id,
      name: r.filename,
      url: `${BASE_URL}/uploads/${r.filename}`,
      vendor: r.vendor,
      date: r.date,
      rawAmount: r.amount,
      currency: r.currency || "USD",

      amount: formatAmount(
        r.amount,
        r.currency || "USD"
      ),

      usdAmount: formatAmount(
        r.usd_amount || r.amount,
        "USD"
      ),

      category: r.category || "Uncategorized",
      document_type: r.document_type || "Unknown",
      deduction_type:
        r.deduction_type || "Uncategorized",

      irsCategory:
        r.irs_category ||
        "General Business Expense",

        jurisdiction:
  r.jurisdiction || "US",

deductiblePercent:
  r.deductible_percent || 0,

ruleApplied:
  r.rule_applied || "",

      type: "Business",

      status: r.status || "Pending",
      locked:
  r.locked || false,

      aiProcessed: true,

      vendorLearned:
  r.vendor_learned || false,

aiConfidence:
  r.ai_confidence || "low",

needsReview:
  r.needs_review || false,
  isBlurry:
  r.is_blurry || false,

blurScore:
  r.blur_score || 0,

possibleDuplicate:
  r.possible_duplicate || false,
    }));

    setReceipts(formatted);
  };

  const processReceipt = async (file) => {
    setUploading(true);

    const formData = new FormData();

    formData.append("file", file);

    const res = await authenticatedFetch(
  `${BASE_URL}/receipts/upload`,
  {
    method: "POST",
    body: formData,
  }
);

    const data = await res.json();

    if (data.success) {
      fetchReceipts();

      setMessage(
        "Receipt processed successfully"
      );

      setTimeout(() => {
        setMessage("");
      }, 3000);
    }

    setUploading(false);
  };

  const approveReceipt = async (id) => {

  const token = localStorage.getItem("access_token");

await fetch(
  `${BASE_URL}/receipts/approve/${id}`,
  {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

  fetchReceipts();
};

  const approveDuplicate = async (id) => {

  const token = localStorage.getItem("access_token");

await fetch(
  `${BASE_URL}/receipts/approve-duplicate/${id}`,
  {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

  fetchReceipts();
};

const markDuplicate = async (id) => {
  const token = localStorage.getItem("access_token");

  await fetch(
    `${BASE_URL}/receipts/mark-duplicate/${id}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  fetchReceipts();
};

  const deleteReceipt = async (id) => {
  const token = localStorage.getItem("access_token");

  await fetch(
    `${BASE_URL}/receipts/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  setReceipts((prev) =>
    prev.filter((r) => r.id !== id)
  );
};

  const saveEdit = async () => {
  if (!editingReceipt) return;

  const token = localStorage.getItem("access_token");

  await fetch(
    `${BASE_URL}/receipts/update/${editingReceipt.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        vendor: editingReceipt.vendor,
        amount: editingReceipt.rawAmount,
        category: editingReceipt.category,
        date: editingReceipt.date,
      }),
    }
  );

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
        <div className="fixed bottom-6 right-6 bg-black text-white px-5 py-3 rounded-lg shadow-lg z-50">
          {message}
        </div>
      )}

      <div className="text-center mb-8">

        <h2 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Manage Your Receipts
        </h2>

        <p className="text-gray-600">
          AI automatically categorizes, learns vendors & prepares IRS-ready expenses.
                 </p>

      </div>

      <div className="flex gap-3 justify-center mb-8">

        {[
  "All",
  "Pending",
  "Needs Review",
  "Reviewed",
  "Locked",
  "Duplicate"
].map(
          (f) => (
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
          )
        )}

      </div>

      <div className="flex flex-col items-center gap-4 mb-10">

        <label
          htmlFor="file-upload"
          className="cursor-pointer w-full max-w-2xl border-2 border-dashed border-purple-300 bg-white rounded-2xl p-10 flex flex-col items-center justify-center shadow hover:shadow-lg transition"
        >

          <CloudArrowUpIcon className="h-12 w-12 text-purple-500 mb-4" />

          <p>Upload receipts</p>

          <input
  type="file"
  accept="image/*"
  capture="environment"
  className="hidden"
  ref={cameraInputRef}
  onChange={(e) =>
    Array.from(e.target.files).forEach(processReceipt)
  }
/>

<input
  type="file"
  accept="image/*"
  className="hidden"
  ref={galleryInputRef}
  onChange={(e) =>
    Array.from(e.target.files).forEach(processReceipt)
  }
/>

        </label>

        <div className="flex gap-3">

  <button
    onClick={() => cameraInputRef.current.click()}
    className="bg-purple-600 text-white px-5 py-2 rounded-xl"
  >
    📷 Take Photo
  </button>

  <button
    onClick={() => galleryInputRef.current.click()}
    className="bg-blue-600 text-white px-5 py-2 rounded-xl"
  >
    🖼 Choose From Gallery
  </button>

</div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {filteredReceipts.map((r) => (

          <div
            key={r.id}
            className="bg-white p-4 rounded-2xl shadow-md border hover:shadow-xl transition relative"
          >

            <img
  src={r.url}
  alt={r.name}
  className="rounded-xl h-40 w-full object-cover mb-3"
  onError={(e) => {
    e.target.onerror = null;

    e.target.src =
      "https://placehold.co/600x400/f3f4f6/6b7280?text=Receipt+Preview";
  }}
/>
            {/* ✅ LEARNED VENDOR BADGE */}

            <div className="flex items-center gap-2">

              <h3 className="font-semibold">
                {r.vendor}
              </h3>

              {r.vendorLearned && (
  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
    Learned Vendor
  </span>
)}

{r.status === "Approved" && (
  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
    Approved
  </span>
)}

{r.status === "Duplicate" && (
  <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
    Duplicate
  </span>
)}
{r.status === "Locked" && (
  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
    Locked
  </span>
)}

{r.possibleDuplicate ? (

  <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
    Possible Duplicate
  </span>

) : r.needsReview ? (

  <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
    Needs Review
  </span>

) : null}

{r.isBlurry && (
  <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
    Blurry Image
  </span>
)}

<span
  className={`text-xs px-2 py-1 rounded-full ${
    r.aiConfidence === "high"
      ? "bg-green-100 text-green-700"
      : r.aiConfidence === "medium"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700"
  }`}
>
  AI: {
  r.aiConfidence === "reviewed"
    ? "Reviewed"
    : r.aiConfidence
}
</span>
            </div>

            <p className="text-sm text-gray-500">
              {r.date}
            </p>

            <div className="mt-3 text-sm">

              <p>
                <strong>Category:</strong>{" "}
                {r.category}
              </p>

              <p>
                <strong>Deduction:</strong>{" "}
                {r.deduction_type}
              </p>

              <p>
                <strong>Currency:</strong>{" "}
                {r.currency}
              </p>


              <p>
  <strong>Jurisdiction:</strong>{" "}
  {r.jurisdiction}
</p>

<p>
  <strong>Tax Category:</strong>{" "}
  {r.irsCategory}
</p>

<p>
  <strong>Deductible:</strong>{" "}
  {r.deductiblePercent}%
</p>

              <p className="font-bold text-green-600 mt-2 text-lg">
                {r.amount}
              </p>

              <p className="text-xs text-gray-500">
                USD Equivalent: {r.usdAmount}
              </p>

            </div>

            {r.possibleDuplicate && (

  <div className="mt-4 flex gap-2">

    <button
      onClick={() =>
        approveDuplicate(r.id)
      }
      className="flex-1 bg-green-600 text-white py-2 rounded-lg"
    >
      Approve Anyway
    </button>

    <button
      onClick={() =>
        markDuplicate(r.id)
      }
      className="flex-1 bg-orange-600 text-white py-2 rounded-lg"
    >
      Mark Duplicate
    </button>

  </div>

)}

            {r.status === "Pending" && (

              <button
                onClick={() =>
                  approveReceipt(r.id)
                }
                className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg"
              >
                Approve
              </button>

            )}

            {!r.locked && (

<button
  onClick={() =>
    setEditingReceipt({ ...r })
  }
  className="mt-2 w-full bg-blue-500 text-white py-2 rounded-lg"
>
  Edit
</button>

)}

            <button
              onClick={() =>
                deleteReceipt(r.id)
              }
              className="mt-2 w-full bg-red-500 text-white py-2 rounded-lg"
            >
              Delete
            </button>

          </div>

        ))}

      </div>

      {editingReceipt && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white p-6 rounded-xl w-96">

            <h2 className="text-xl font-bold mb-4">
              Edit Receipt
            </h2>

            <input
              className="border p-2 w-full mb-2"
              value={editingReceipt.vendor}
              onChange={(e) =>
                setEditingReceipt({
                  ...editingReceipt,
                  vendor: e.target.value,
                })
              }
            />

            <input
              className="border p-2 w-full mb-2"
              value={editingReceipt.rawAmount}
              onChange={(e) =>
                setEditingReceipt({
                  ...editingReceipt,
                  rawAmount: e.target.value,
                })
              }
            />

            <input
              className="border p-2 w-full mb-2"
              value={editingReceipt.category}
              onChange={(e) =>
                setEditingReceipt({
                  ...editingReceipt,
                  category: e.target.value,
                })
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
                onClick={() =>
                  setEditingReceipt(null)
                }
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
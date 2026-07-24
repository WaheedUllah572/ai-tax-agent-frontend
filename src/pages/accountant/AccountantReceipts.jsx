import React, { useEffect, useState } from "react";

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://ai-tax-agent-backend-1.onrender.com";

export default function AccountantReceipts() {
  const [receipts, setReceipts] = useState([]);
  const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");

  return {
    Authorization: `Bearer ${token}`,
  };
};

  const [editingReceipt, setEditingReceipt] = useState(null);
  const [previewReceipt, setPreviewReceipt] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

  const [editVendor, setEditVendor] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDate, setEditDate] = useState("");

  const [noteReceipt, setNoteReceipt] = useState(null);
  const [accountantNote, setAccountantNote] = useState("");

  useEffect(() => {
  const loadReceipts = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(`${BASE_URL}/receipts/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("Failed to load receipts:", res.status);
        return;
      }

      const data = await res.json();

      setReceipts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Receipt loading error:", error);
    }
  };

  loadReceipts();
}, []);

  // ====================================
  // APPROVE
  // ====================================

  const approveReceipt = async (id) => {
    await fetch(`${BASE_URL}/receipts/approve/${id}`, {
  method: "PUT",
  headers: getAuthHeaders(),
});

    setReceipts((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "Locked",
            }
          : r
      )
    );
  };

  // ====================================
  // REJECT
  // ====================================

  const rejectReceipt = async (id) => {
    await fetch(`${BASE_URL}/receipts/reject/${id}`, {
  method: "PUT",
  headers: getAuthHeaders(),
});

    setReceipts((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "Rejected",
            }
          : r
      )
    );
  };

  // ====================================
  // SAVE EDIT
  // ====================================

  const saveChanges = async () => {
    await fetch(
      `${BASE_URL}/receipts/update/${editingReceipt.id}`,
      {
        method: "PUT",
        headers: {
  "Content-Type": "application/json",
  ...getAuthHeaders(),
},
        body: JSON.stringify({
          vendor: editVendor,
          amount: editAmount,
          category: editCategory,
          date: editDate,
        }),
      }
    );

    setReceipts((prev) =>
      prev.map((r) =>
        r.id === editingReceipt.id
          ? {
              ...r,
              vendor: editVendor,
              amount: editAmount,
              category: editCategory,
              date: editDate,
              status: "Reviewed",
            }
          : r
      )
    );

    setEditingReceipt(null);
  };

  // ====================================
  // SAVE NOTE
  // ====================================

  const saveNote = async () => {
  try {
    const res = await fetch(
      `${BASE_URL}/receipts/notes/${noteReceipt.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          note: accountantNote,
        }),
      }
    );

    if (!res.ok) {
      console.error("Failed to save note:", res.status);
      return;
    }

    setReceipts((prev) =>
      prev.map((r) =>
        r.id === noteReceipt.id
          ? {
              ...r,
              accountant_note: accountantNote,
            }
          : r
      )
    );

    setNoteReceipt(null);
    setAccountantNote("");
  } catch (error) {
    console.error("Save note error:", error);
  }
};

const viewReceipt = async (receipt) => {
  try {
    const res = await fetch(
      `${BASE_URL}/receipts/image/${receipt.filename}`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!res.ok) {
      console.error(
        "Failed to load receipt image:",
        res.status
      );
      return;
    }

    const blob = await res.blob();
    const imageUrl = URL.createObjectURL(blob);

    setPreviewReceipt(receipt);
    setPreviewImageUrl(imageUrl);
  } catch (error) {
    console.error(
      "Receipt preview error:",
      error
    );
  }
};

  return (
    <div className="p-8">

      <h1 className="text-3xl font-bold mb-6">
        Receipt Review & Approval
      </h1>

      <table className="w-full bg-white rounded-xl shadow overflow-hidden">

        <thead className="bg-indigo-600 text-white">
          <tr>
            <th className="p-3 text-left">Vendor</th>
            <th className="p-3 text-left">Amount</th>
            <th className="p-3 text-left">Category</th>
            <th className="p-3 text-left">Date</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>

          {receipts.map((receipt) => (

            <tr
              key={receipt.id}
              className="border-b hover:bg-gray-50"
            >

              <td className="p-3">{receipt.vendor}</td>

              <td className="p-3">
                ${receipt.amount}
              </td>

              <td className="p-3">
                {receipt.category}
              </td>

              <td className="p-3">
                {receipt.date}
              </td>

              <td className="p-3">

                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    receipt.status === "Locked"
                      ? "bg-green-100 text-green-700"
                      : receipt.status === "Rejected"
                      ? "bg-red-100 text-red-700"
                      : receipt.status === "Reviewed"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {receipt.status || "Pending"}
                </span>

              </td>

              <td className="p-3 flex gap-2 flex-wrap">

                <button
                  onClick={() => {
                    setNoteReceipt(receipt);
                    setAccountantNote(
                      receipt.accountant_note || ""
                    );
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded"
                >
                  Note
                </button>


                <button
  onClick={() => viewReceipt(receipt)}
  className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-1 rounded"
>
  View
</button>

                <button
                  onClick={() => {
                    setEditingReceipt(receipt);
                    setEditVendor(receipt.vendor);
                    setEditAmount(receipt.amount);
                    setEditCategory(receipt.category);
                    setEditDate(receipt.date);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() =>
                    approveReceipt(receipt.id)
                  }
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                >
                  Approve
                </button>

                <button
                  onClick={() =>
                    rejectReceipt(receipt.id)
                  }
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  Reject
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

      {/* EDIT MODAL */}

      {editingReceipt && (

        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

          <div className="bg-white rounded-xl shadow-2xl w-[500px] p-8">

            <h2 className="text-2xl font-bold mb-6">
              Edit Receipt
            </h2>

            <input
              className="border rounded p-3 w-full mb-3"
              value={editVendor}
              onChange={(e) =>
                setEditVendor(e.target.value)
              }
              placeholder="Vendor"
            />

            <input
              className="border rounded p-3 w-full mb-3"
              value={editAmount}
              onChange={(e) =>
                setEditAmount(e.target.value)
              }
              placeholder="Amount"
            />

            <input
              className="border rounded p-3 w-full mb-3"
              value={editCategory}
              onChange={(e) =>
                setEditCategory(e.target.value)
              }
              placeholder="Category"
            />

            <input
              className="border rounded p-3 w-full mb-6"
              value={editDate}
              onChange={(e) =>
                setEditDate(e.target.value)
              }
              placeholder="Date"
            />

            <div className="flex justify-end gap-3">

              <button
                onClick={() =>
                  setEditingReceipt(null)
                }
                className="bg-gray-500 text-white px-5 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={saveChanges}
                className="bg-indigo-600 text-white px-5 py-2 rounded"
              >
                Save Changes
              </button>

            </div>

          </div>

        </div>

      )}

      {/* NOTE MODAL */}

      {noteReceipt && (

        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

          <div className="bg-white rounded-xl shadow-2xl w-[500px] p-8">

            <h2 className="text-2xl font-bold mb-6">
              Accountant Notes
            </h2>

            <textarea
              rows={8}
              value={accountantNote}
              onChange={(e) =>
                setAccountantNote(e.target.value)
              }
              className="w-full border rounded-lg p-4"
              placeholder="Write notes for this receipt..."
            />

            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={() =>
                  setNoteReceipt(null)
                }
                className="bg-gray-500 text-white px-5 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={saveNote}
                className="bg-purple-600 text-white px-5 py-2 rounded"
              >
                Save Note
              </button>

            </div>

          </div>

        </div>

      )}

      {previewReceipt && (

<div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">

<div className="bg-white rounded-xl p-6 max-w-5xl">

<h2 className="text-2xl font-bold mb-5">
Receipt Preview
</h2>

<img
    src={previewImageUrl}
    alt="Receipt"
    className="max-h-[700px] rounded shadow"
/>

<div className="flex justify-end mt-6">

<button
    onClick={() => {
  if (previewImageUrl) {
    URL.revokeObjectURL(previewImageUrl);
  }

  setPreviewReceipt(null);
  setPreviewImageUrl(null);
}}
    className="bg-indigo-600 text-white px-5 py-2 rounded"
>
Close
</button>

</div>

</div>

</div>

)}

    </div>
    
  );
}


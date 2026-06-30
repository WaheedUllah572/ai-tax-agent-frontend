import React, { useState } from "react";

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://ai-tax-agent-backend-1.onrender.com";

export default function OnboardingPage() {
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [timezone, setTimezone] = useState("Asia/Karachi");
  const [accountCount, setAccountCount] = useState(1);

  const handleSubmit = async () => {
    const res = await fetch(
      `${BASE_URL}/onboarding/setup`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          business_name: businessName,
          business_type: businessType,
          timezone,
          account_count: accountCount
        })
      }
    );

    const data = await res.json();

    if (data.success) {
      alert("Business profile setup complete");
      localStorage.setItem(
  "onboarding_completed",
  true
);
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded-xl shadow">
      <h1 className="text-3xl font-bold mb-6">
        Setup Your Business
      </h1>

      <input
        type="text"
        placeholder="Business Name"
        value={businessName}
        onChange={(e) =>
          setBusinessName(e.target.value)
        }
        className="border p-2 rounded w-full mb-4"
      />

      <input
        type="text"
        placeholder="Business Type"
        value={businessType}
        onChange={(e) =>
          setBusinessType(e.target.value)
        }
        className="border p-2 rounded w-full mb-4"
      />

      <select
        value={timezone}
        onChange={(e) =>
          setTimezone(e.target.value)
        }
        className="border p-2 rounded w-full mb-4"
      >
        <option value="Asia/Karachi">
          Pakistan (Asia/Karachi)
        </option>
        <option value="America/New_York">
          USA (New York)
        </option>
        <option value="Europe/London">
          UK (London)
        </option>
      </select>

      <input
        type="number"
        value={accountCount}
        onChange={(e) =>
          setAccountCount(e.target.value)
        }
        className="border p-2 rounded w-full mb-4"
      />

      <div className="space-y-3 mb-4">

  <button
    onClick={() =>
      window.open(
        `${BASE_URL}/calendar/connect`,
        "_blank"
      )
    }
    className="w-full bg-purple-600 text-white px-4 py-2 rounded"
  >
    Connect Google Calendar
  </button>

  <button
    onClick={() =>
      window.open(
        `${BASE_URL}/gmail/connect`,
        "_blank"
      )
    }
    className="w-full bg-red-600 text-white px-4 py-2 rounded"
  >
    Connect Gmail
  </button>

  <button
    onClick={() =>
      window.open(
        `${BASE_URL}/xero/connect`,
        "_blank"
      )
    }
    className="w-full bg-blue-600 text-white px-4 py-2 rounded"
  >
    Connect Xero
  </button>

</div>

      <button
        onClick={handleSubmit}
        className="bg-indigo-600 text-white px-4 py-2 rounded"
      >
        Complete Setup
      </button>
    </div>
  );
}
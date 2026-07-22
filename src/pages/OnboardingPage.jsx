import React, { useState } from "react";

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://ai-tax-agent-backend-1.onrender.com";

export default function OnboardingPage() {
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [timezone, setTimezone] = useState("Asia/Karachi");
  const [accountCount, setAccountCount] = useState(1);
  const [country, setCountry] = useState("United States");

  const handleSubmit = async () => {

  if (!businessName || !businessType) {
    alert("Please complete all required fields.");
    return;
  }

  const res = await fetch(
    `${BASE_URL}/onboarding/setup`,
    {
      method: "POST",
      headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
},
      body: JSON.stringify({
  business_name: businessName,
  business_type: businessType,
  country: country,
  timezone,
  account_count: accountCount
})
    }
  );

    const data = await res.json();

if (!res.ok) {
  console.error("Onboarding error:", data);
  alert(data.detail || "Failed to complete setup");
  return;
}

if (data.success) {
  alert("Business profile setup complete");

  localStorage.setItem(
    "onboarding_completed",
    "true"
  );

  window.location.href = "/dashboard";
}

}  

return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-8 rounded-xl shadow-lg">
      <p className="text-gray-500 mb-6">
  Complete your business profile and connect your services to start using TaxMate AI.
</p>

      <label className="block mb-2 font-medium">
  Business Name
</label>

      <input
        type="text"
        placeholder="Enter Business Name"
        value={businessName}
        onChange={(e) =>
          setBusinessName(e.target.value)
        }
        className="border p-2 rounded w-full mb-4"
      />

      <label className="block mb-2 font-medium">
  Business Type
</label>

      <select
  value={businessType}
  onChange={(e) => setBusinessType(e.target.value)}
  className="border p-2 rounded w-full mb-4"
>
  <option value="">Select Business Type</option>
  <option value="Accountant">Accountant</option>
  <option value="Electrician">Electrician</option>
  <option value="Plumber">Plumber</option>
  <option value="Contractor">Contractor</option>
  <option value="Consultant">Consultant</option>
  <option value="Real Estate">Real Estate</option>
  <option value="Restaurant">Restaurant</option>
  <option value="Retail">Retail</option>
  <option value="Healthcare">Healthcare</option>
  <option value="Lawyer">Lawyer</option>
  <option value="Dentist">Dentist</option>
  <option value="Medical Practice">Medical Practice</option>
  <option value="Cleaning Company">Cleaning Company</option>
  <option value="Landscaping">Landscaping</option>
  <option value="HVAC">HVAC</option>
  <option value="Construction">Construction</option>
  <option value="Photographer">Photographer</option>
  <option value="Freelancer">Freelancer</option>
  <option value="Other">Other</option>
</select>

<label className="block mb-2 font-medium">
  Country
</label>

<select
  value={country}
  onChange={(e) => setCountry(e.target.value)}
  className="border p-2 rounded w-full mb-4"
>
  <option value="United States">United States</option>
  <option value="Canada">Canada</option>
  <option value="United Kingdom">United Kingdom</option>
  <option value="Australia">Australia</option>
</select>

      <label className="block mb-2 font-medium">
  Timezone
</label>

      <select
        value={timezone}
        onChange={(e) =>
          setTimezone(e.target.value)
        }
        className="border p-2 rounded w-full mb-4"
      >
        <option value="Asia/Karachi">Pakistan</option>
<option value="Asia/Dubai">UAE</option>
<option value="Asia/Kolkata">India</option>
<option value="Asia/Singapore">Singapore</option>
<option value="America/New_York">New York</option>
<option value="America/Chicago">Chicago</option>
<option value="America/Denver">Denver</option>
<option value="America/Los_Angeles">Los Angeles</option>
<option value="Europe/London">London</option>
<option value="Europe/Paris">Paris</option>
<option value="Australia/Sydney">Sydney</option>
<option value="UTC">UTC</option>
      </select>

      <label className="block mb-2 font-medium">
  Number of Users
</label>

      <select
  value={accountCount}
  onChange={(e) => setAccountCount(e.target.value)}
  className="border p-2 rounded w-full mb-4"
>
  <option value="1">1 User</option>
  <option value="2-5">2–5 Users</option>
  <option value="6-10">6–10 Users</option>
  <option value="11-25">11–25 Users</option>
  <option value="26-50">26–50 Users</option>
  <option value="50+">50+ Users</option>
</select>

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
        className="w-full bg-indigo-600 text-white py-3 rounded-lg"
      >
        Complete Setup
      </button>
    </div>
  );
}

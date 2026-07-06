import React, { useEffect, useState } from "react";

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://ai-tax-agent-backend-1.onrender.com";

export default function SettingsPage() {
  const [jurisdiction, setJurisdiction] =  useState("US");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [timezone, setTimezone] = useState("Asia/Karachi");
  const [accountCount, setAccountCount] = useState(1);

  const [loading, setLoading] =
    useState(false);

  const [calendarConnected, setCalendarConnected] =
    useState(false);

  const [events, setEvents] =
    useState([]);

  useEffect(() => {
  // Load settings
  fetch(`${BASE_URL}/settings`)
    .then((res) => res.json())
    .then((data) => {
      setJurisdiction(data.jurisdiction || "US");
      setBusinessName(data.business_name || "");
      setBusinessType(data.business_type || "");
      setTimezone(data.timezone || "Asia/Karachi");
      setAccountCount(data.account_count || 1);
    });

  // Load calendar connection status
  fetch(`${BASE_URL}/calendar/status`)
    .then((res) => res.json())
    .then((data) => {
      setCalendarConnected(
        data.connected
      );
    });

  // Load events
  fetch(`${BASE_URL}/calendar/events`)
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        setEvents(data.events);
      }
    });

}, []);

  const saveSettings = async () => {
    setLoading(true);

    await fetch(
      `${BASE_URL}/settings`,
      {
        method: "PUT",
        headers: {
          "Content-Type":
            "application/json"
        },
        body: JSON.stringify({
  jurisdiction,
  business_name: businessName,
  business_type: businessType,
  timezone,
  account_count: accountCount
})
      }
    );

    setLoading(false);

    alert("Settings Saved");
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded-xl shadow">

      <h1 className="text-2xl font-bold mb-6">
        Tax Settings
      </h1>

      <label className="block mb-2 font-medium">
        Tax Jurisdiction
      </label>

      <select
        value={jurisdiction}
        onChange={(e) =>
          setJurisdiction(
            e.target.value
          )
        }
        className="border p-2 rounded w-full"
      >

        <label className="block mt-4 mb-2 font-medium">
  Business Name
</label>

<input
  type="text"
  value={businessName}
  onChange={(e) => setBusinessName(e.target.value)}
  className="border p-2 rounded w-full"
/>

<label className="block mt-4 mb-2 font-medium">
  Business Type
</label>

<input
  type="text"
  value={businessType}
  onChange={(e) => setBusinessType(e.target.value)}
  className="border p-2 rounded w-full"
/>

<label className="block mt-4 mb-2 font-medium">
  Timezone
</label>

<select
  value={timezone}
  onChange={(e) => setTimezone(e.target.value)}
  className="border p-2 rounded w-full"
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

<label className="block mt-4 mb-2 font-medium">
  Account Count
</label>

<select
  value={accountCount}
  onChange={(e) => setAccountCount(e.target.value)}
  className="border p-2 rounded w-full"
>
  <option value="1">1 User</option>
  <option value="2-5">2–5 Users</option>
  <option value="6-10">6–10 Users</option>
  <option value="11-25">11–25 Users</option>
  <option value="26-50">26–50 Users</option>
  <option value="50+">50+ Users</option>
</select>
        <option value="US">
          United States
        </option>

        <option value="UK">
          United Kingdom
        </option>

        <option value="AU">
          Australia
        </option>

        <option value="CA">
          Canada
        </option>
      </select>

      <button
        onClick={saveSettings}
        disabled={loading}
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading
          ? "Saving..."
          : "Save Settings"}
      </button>

      <div className="mt-6">
        <button
          onClick={() =>
  window.open(
    `${BASE_URL}/calendar/connect`,
    "_blank"
  )
}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          {calendarConnected
            ? "Reconnect Calendar"
            : "Connect Calendar"}
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">
          Upcoming Appointments
        </h2>

        {events.length === 0 ? (
          <p className="text-gray-500">
            No upcoming events found.
          </p>
        ) : (
          <div className="space-y-3">
            {events.map((event, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 bg-gray-50"
              >
                <p className="font-semibold">
                  {event.summary}
                </p>

                <p className="text-sm text-gray-600">
  {new Date(event.start).toLocaleString(
    [],
    {
      timeZone:
        event.timezone ||
        Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  )}
</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
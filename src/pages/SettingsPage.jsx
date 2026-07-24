import React, { useEffect, useState } from "react";

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://ai-tax-agent-backend-1.onrender.com";

export default function SettingsPage() {
  const [jurisdiction, setJurisdiction] = useState("US");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [country, setCountry] = useState("United States");

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [gmailConnected, setGmailConnected] = useState(false);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [xeroConnected, setXeroConnected] = useState(false);

  const [events, setEvents] = useState([]);

  // =====================================================
  // LOAD SETTINGS + CONNECTION STATUS
  // =====================================================

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      console.error("No access token found.");
      return;
    }

    const authHeaders = {
      Authorization: `Bearer ${token}`,
    };

    // ==============================
    // BUSINESS SETTINGS
    // ==============================

    fetch(`${BASE_URL}/settings`, {
      headers: authHeaders,
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.detail || "Failed to load settings"
          );
        }

        return data;
      })
      .then((data) => {
  setJurisdiction(data.jurisdiction || "US");
  setBusinessName(data.business_name || "");
  setBusinessType(data.business_type || "");
  setCountry(data.country || "United States");
})
.catch((err) => {
  console.error("Settings load error:", err);
})
.finally(() => {
  setPageLoading(false);
});

    // ==============================
    // GMAIL STATUS
    // ==============================

    fetch(`${BASE_URL}/gmail/status`, {
      headers: authHeaders,
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.detail || "Failed to get Gmail status"
          );
        }

        return data;
      })
      .then((data) => {
        setGmailConnected(data.connected === true);
      })
      .catch((err) => {
        console.error("Gmail status error:", err);
        setGmailConnected(false);
      });

    // ==============================
    // CALENDAR STATUS
    // ==============================

    fetch(`${BASE_URL}/calendar/status`, {
      headers: authHeaders,
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.detail || "Failed to get Calendar status"
          );
        }

        return data;
      })
      .then((data) => {
        setCalendarConnected(data.connected === true);
      })
      .catch((err) => {
        console.error("Calendar status error:", err);
        setCalendarConnected(false);
      });

    // ==============================
    // XERO STATUS
    // ==============================

    fetch(`${BASE_URL}/xero/status`)
      .then((res) => res.json())
      .then((data) => {
        setXeroConnected(data.connected === true);
      })
      .catch((err) => {
        console.error("Xero status error:", err);
        setXeroConnected(false);
      });

    // ==============================
    // CALENDAR EVENTS
    // ==============================

    fetch(`${BASE_URL}/calendar/events`, {
      headers: authHeaders,
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.detail || "Failed to load calendar events"
          );
        }

        return data;
      })
      .then((data) => {
        if (data.success) {
          setEvents(data.events || []);
        }
      })
            .catch((err) => {
  console.error("Calendar events error:", err);
});

}, []);

// =====================================================
// SAVE SETTINGS
// =====================================================

  const saveSettings = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("access_token");

      if (!token) {
        alert("Your login session was not found. Please login again.");
        return;
      }

      const response = await fetch(
        `${BASE_URL}/settings`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            jurisdiction,
            business_name: businessName,
            business_type: businessType,
            country,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Save settings response:", data);

        throw new Error(
          data.detail || "Could not save settings"
        );
      }

      alert("Settings saved successfully.");
    } catch (error) {
      console.error("Save settings error:", error);

      alert(
        error.message || "Could not save settings."
      );
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>

        <p className="text-gray-600 font-medium">
          Loading your settings...
        </p>
      </div>
    </div>
  );
}

  return (
    <div className="max-w-3xl mx-auto py-10">

      {/* PAGE HEADER */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          RefundPilot Settings
        </h1>

        <p className="text-gray-500 mt-2">
          Manage your business profile and connected services.
        </p>
      </div>

      {/* BUSINESS PROFILE */}

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">

        <h2 className="text-xl font-bold text-gray-800 mb-1">
          Business Profile
        </h2>

        <p className="text-sm text-gray-500 mb-6">
          Help Max understand your business and provide more relevant assistance.
        </p>

        <label className="block mb-2 font-medium text-gray-700">
          Business Name
        </label>

        <input
          type="text"
          value={businessName}
          onChange={(e) =>
            setBusinessName(e.target.value)
          }
          placeholder="Enter your business name"
          className="border border-gray-300 p-3 rounded-lg w-full mb-5 focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <label className="block mb-2 font-medium text-gray-700">
          Business Type
        </label>

        <select
          value={businessType}
          onChange={(e) =>
            setBusinessType(e.target.value)
          }
          className="border border-gray-300 p-3 rounded-lg w-full mb-5 focus:ring-2 focus:ring-blue-500 outline-none"
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

        <label className="block mb-2 font-medium text-gray-700">
          Country
        </label>

        <select
          value={country}
          onChange={(e) =>
            setCountry(e.target.value)
          }
          className="border border-gray-300 p-3 rounded-lg w-full mb-5 focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="United States">
            United States
          </option>

          <option value="Canada">
            Canada
          </option>

          <option value="United Kingdom">
            United Kingdom
          </option>

          <option value="Australia">
            Australia
          </option>
        </select>

        <label className="block mb-2 font-medium text-gray-700">
          Tax Jurisdiction
        </label>

        <select
          value={jurisdiction}
          onChange={(e) =>
            setJurisdiction(e.target.value)
          }
          className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
        >
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
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : "Save Business Profile"}
        </button>

      </div>

      {/* CONNECTIONS */}

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">

        <h2 className="text-xl font-bold text-gray-800 mb-1">
          Connections
        </h2>

        <p className="text-sm text-gray-500 mb-6">
          Connect your business services to RefundPilot.
        </p>

        {/* GMAIL */}

        <div className="flex items-center justify-between py-4 border-b">

          <div>
            <h3 className="font-semibold text-gray-800">
              Gmail
            </h3>

            <p
              className={`text-sm ${
                gmailConnected
                  ? "text-green-600"
                  : "text-gray-500"
              }`}
            >
              {gmailConnected
                ? "✓ Connected"
                : "Not Connected"}
            </p>
          </div>

          <button
            onClick={() =>
              window.open(
                `${BASE_URL}/gmail/connect`,
                "_blank"
              )
            }
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            {gmailConnected
              ? "Reconnect"
              : "Connect Gmail"}
          </button>

        </div>

        {/* CALENDAR */}

        <div className="flex items-center justify-between py-4 border-b">

          <div>
            <h3 className="font-semibold text-gray-800">
              Google Calendar
            </h3>

            <p
              className={`text-sm ${
                calendarConnected
                  ? "text-green-600"
                  : "text-gray-500"
              }`}
            >
              {calendarConnected
                ? "✓ Connected"
                : "Not Connected"}
            </p>
          </div>

          <button
            onClick={() =>
              window.open(
                `${BASE_URL}/calendar/connect`,
                "_blank"
              )
            }
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
          >
            {calendarConnected
              ? "Reconnect"
              : "Connect Calendar"}
          </button>

        </div>

        {/* XERO */}

        <div className="flex items-center justify-between py-4">

          <div>
            <h3 className="font-semibold text-gray-800">
              Xero
            </h3>

            <p
              className={`text-sm ${
                xeroConnected
                  ? "text-green-600"
                  : "text-gray-500"
              }`}
            >
              {xeroConnected
                ? "✓ Connected"
                : "Not Connected"}
            </p>
          </div>

          <button
            onClick={() =>
              window.open(
                `${BASE_URL}/xero/connect`,
                "_blank"
              )
            }
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            {xeroConnected
              ? "Reconnect"
              : "Connect Xero"}
          </button>

        </div>

      </div>

      {/* UPCOMING APPOINTMENTS */}

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">

        <h2 className="text-xl font-bold text-gray-800 mb-1">
          Upcoming Appointments
        </h2>

        <p className="text-sm text-gray-500 mb-6">
          Your upcoming appointments from your connected calendar.
        </p>

        {!calendarConnected ? (
          <p className="text-gray-500">
            Connect Google Calendar to view upcoming appointments.
          </p>
        ) : events.length === 0 ? (
          <p className="text-gray-500">
            No upcoming appointments found.
          </p>
        ) : (
          <div className="space-y-3">
            {events.map((event, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl p-4 bg-gray-50"
              >
                <p className="font-semibold text-gray-800">
                  {event.summary}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  {new Date(
                    event.start
                  ).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
import React, { useEffect, useState } from "react";

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://ai-tax-agent-backend-1.onrender.com";

export default function SettingsPage() {
  const [jurisdiction, setJurisdiction] =
    useState("US");

  const [loading, setLoading] =
    useState(false);

  const [calendarConnected, setCalendarConnected] =
    useState(false);

  const [events, setEvents] =
    useState([]);

  useEffect(() => {
    fetch(`${BASE_URL}/settings`)
      .then((res) => res.json())
      .then((data) => {
        setJurisdiction(
          data.jurisdiction || "US"
        );

        setCalendarConnected(
          data.calendar_connected || false
        );
      });

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
          jurisdiction
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
            window.location.href =
              `${BASE_URL}/calendar/connect`
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
                  {event.start?.dateTime ||
                    event.start?.date}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
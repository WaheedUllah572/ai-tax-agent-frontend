import React, { useEffect, useState } from "react";

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://ai-tax-agent-backend-1.onrender.com";

export default function SettingsPage() {

  const [jurisdiction, setJurisdiction] =
    useState("US");

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {

    fetch(
      `${BASE_URL}/settings`
    )
      .then((res) => res.json())
      .then((data) => {

        setJurisdiction(
          data.jurisdiction || "US"
        );
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

    alert(
      "Settings Saved"
    );
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

    </div>
  );
}
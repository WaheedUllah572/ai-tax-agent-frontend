
import React, { useEffect, useState } from "react";

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://ai-tax-agent-backend-1.onrender.com";

export default function AccountantMileage() {
  const [mileage, setMileage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadMileage() {
      try {
        setLoading(true);
        setError("");

        // Find the existing Supabase session token, if stored locally.
        let accessToken = null;

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);

          if (!key) continue;

          try {
            const value = JSON.parse(localStorage.getItem(key));

            if (
              key.endsWith("-auth-token") &&
              value?.access_token
            ) {
              accessToken = value.access_token;
              break;
            }

            if (
              ["access_token", "accessToken", "token"].includes(key) &&
              typeof value === "string"
            ) {
              accessToken = value;
              break;
            }
          } catch {
            // Ignore unrelated or non-JSON localStorage entries.
          }
        }

        const headers = {
          Accept: "application/json",
        };

        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`;
        }

        const response = await fetch(
          `${BASE_URL}/mileage/history`,
          {
            method: "GET",
            headers,
            signal: controller.signal,
          }
        );

        if (response.status === 401) {
          throw new Error(
            "Authentication failed. Please sign in again and verify your session."
          );
        }

        if (!response.ok) {
          throw new Error(
            `Unable to load mileage records (HTTP ${response.status}).`
          );
        }

        const data = await response.json();

        // Support an array or common object-based API response formats.
        const records = Array.isArray(data)
          ? data
          : Array.isArray(data?.history)
          ? data.history
          : Array.isArray(data?.trips)
          ? data.trips
          : Array.isArray(data?.mileage)
          ? data.mileage
          : null;

        if (!records) {
          console.error("Unexpected mileage API response:", data);
          throw new Error(
            "The mileage API returned an unexpected response format."
          );
        }

        setMileage(records);
      } catch (err) {
        if (err.name === "AbortError") return;

        console.error("Mileage loading error:", err);
        setError(err.message || "Failed to load mileage records.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadMileage();

    return () => controller.abort();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Mileage Logs
      </h1>

      {loading && (
        <p className="text-gray-600">Loading mileage records...</p>
      )}

      {!loading && error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
        >
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full rounded-xl bg-white shadow">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Distance</th>
                <th className="p-3 text-left">Purpose</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {mileage.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-6 text-center text-gray-500"
                  >
                    No mileage records found.
                  </td>
                </tr>
              ) : (
                mileage.map((m, index) => (
                  <tr
                    key={m.id ?? m.trip_id ?? index}
                    className="border-b"
                  >
                    <td className="p-3">
                      {m.date ??
                        m.start_time ??
                        m.created_at ??
                        "—"}
                    </td>

                    <td className="p-3">
                      {m.total_miles ?? m.distance_miles ?? "—"}
                    </td>

                    <td className="p-3">
                      {m.business_purpose ?? m.purpose ?? "—"}
                    </td>

                    <td className="p-3">
                      {m.return_trip_logged ? (
                        <span className="font-semibold text-green-600">
                          Complete
                        </span>
                      ) : (
                        <span className="font-semibold text-red-600">
                          Return Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

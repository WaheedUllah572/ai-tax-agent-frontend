
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL?.trim() ||
  "https://ai-tax-agent-backend-1.onrender.com";

export default function AccountantMileage() {
  const { getAccessToken, refreshAccessToken } = useAuth();

  const [mileage, setMileage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadMileage() {
      try {
        setLoading(true);
        setError("");

        let token = getAccessToken();

        if (!token) {
          token = await refreshAccessToken();
        }

        if (!token) {
          throw new Error(
            "Your session has expired. Please sign in again."
          );
        }

        const requestMileage = (accessToken) =>
          fetch(`${BASE_URL}/mileage/history`, {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            signal: controller.signal,
          });

        let response = await requestMileage(token);

        if (response.status === 401) {
          token = await refreshAccessToken();

          if (!token) {
            throw new Error(
              "Your session has expired. Please sign in again."
            );
          }

          response = await requestMileage(token);
        }

        if (response.status === 401) {
          throw new Error(
            "Authentication failed. Please sign in again."
          );
        }

        if (!response.ok) {
          throw new Error(
            `Unable to load mileage records (HTTP ${response.status}).`
          );
        }

        const data = await response.json();

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
  }, [getAccessToken, refreshAccessToken]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Mileage Logs
      </h1>

      {loading && (
        <p className="text-gray-600">
          Loading mileage records...
        </p>
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
                      {m.total_miles ??
                        m.distance_miles ??
                        "—"}
                    </td>

                    <td className="p-3">
                      {m.business_purpose ??
                        m.purpose ??
                        "—"}
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

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  TrashIcon,
  ChartBarIcon,
  MapIcon,
  ArrowPathIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL?.trim() ||
  "https://ai-tax-agent-backend-1.onrender.com";

export default function MileagePage() {
  const token = localStorage.getItem("access_token");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const [trips, setTrips] = useState([]);
  const [reminders, setReminders] = useState([]);

  const [form, setForm] = useState({
    date: "",
    start: "",
    destination: "",
    purpose: "",
    miles: "",
    method: "",
  });

  const [loadingMiles, setLoadingMiles] = useState(false);
  const [savingTrip, setSavingTrip] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(null);

  // =====================================================
  // LOAD TRIPS
  // =====================================================

  const loadTrips = useCallback(async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/mileage/history`,
        authConfig
      );

      const formattedTrips = res.data.map((t) => ({
        id: t.trip_id,
        date: t.date,
        start: t.start_location || "—",
        destination:
          t.destination ||
          t.end_location ||
          "—",
        client: t.client_name || "—",
        purpose:
          t.business_purpose ||
          t.purpose ||
          "Business",
        miles:
          t.total_miles ??
          t.distance_miles ??
          0,
        duration:
          t.duration_minutes ?? 0,
        deduction:
          t.deductible_amount ?? 0,
        method:
          t.method || "AI Tracking",
        status:
          t.status || "Completed",
      }));

      setTrips(formattedTrips);
    } catch (error) {
      console.error(
        "Error loading mileage trips:",
        error
      );
    }
  }, [token]);

  // =====================================================
  // LOAD REMINDERS
  // =====================================================

  const loadReminders = useCallback(async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/mileage/reminders`,
        authConfig
      );

      setReminders(
        res.data?.reminders || []
      );
    } catch (error) {
      console.error(
        "Error loading mileage reminders:",
        error
      );
    }
  }, [token]);

  useEffect(() => {
    loadTrips();
    loadReminders();
  }, [loadTrips, loadReminders]);

  // =====================================================
  // FORM
  // =====================================================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // =====================================================
  // CALCULATE MILES
  // =====================================================

  const calculateMiles = async () => {
    if (!form.start || !form.destination) {
      alert(
        "Please enter both Start Location and Destination."
      );
      return;
    }

    try {
      setLoadingMiles(true);

      const res = await axios.get(
        `${BASE_URL}/calculate-miles`,
        {
          params: {
            start: form.start,
            destination: form.destination,
          },
          ...authConfig,
        }
      );

      if (res.data.error) {
        alert(res.data.error);
        return;
      }

      setForm((previous) => ({
        ...previous,
        miles: res.data.miles,
        method:
          res.data.method ||
          "Calculated",
      }));
    } catch (error) {
      console.error(error);

      alert(
        "Unable to calculate mileage."
      );
    } finally {
      setLoadingMiles(false);
    }
  };

  // =====================================================
  // SAVE MANUAL TRIP
  // =====================================================

  const addTrip = async () => {
    if (
      !form.date ||
      !form.start ||
      !form.destination ||
      !form.miles
    ) {
      alert(
        "Please fill all required fields."
      );
      return;
    }

    try {
      setSavingTrip(true);

      await axios.post(
        `${BASE_URL}/mileage/manual`,
        {
          date: form.date,
          start_location: form.start,
          destination: form.destination,
          purpose:
            form.purpose || "Business",
          miles: Number(form.miles),
          method:
            form.method || "manual",
        },
        authConfig
      );

      setForm({
        date: "",
        start: "",
        destination: "",
        purpose: "",
        miles: "",
        method: "",
      });

      await loadTrips();
      await loadReminders();

      alert("Trip saved successfully.");
    } catch (error) {
      console.error(
        "Error saving trip:",
        error
      );

      alert("Unable to save trip.");
    } finally {
      setSavingTrip(false);
    }
  };

  // =====================================================
  // LOG RETURN TRIP
  // =====================================================

  const logReturnTrip = async (tripId) => {
    try {
      setReminderLoading(tripId);

      await axios.post(
        `${BASE_URL}/mileage/return/${tripId}`,
        {},
        authConfig
      );

      await loadTrips();
      await loadReminders();

      alert(
        "Return trip logged successfully."
      );
    } catch (error) {
      console.error(
        "Return trip error:",
        error
      );

      alert(
        error.response?.data?.detail ||
          "Unable to log return trip."
      );
    } finally {
      setReminderLoading(null);
    }
  };

  // =====================================================
  // DISMISS REMINDER
  // =====================================================

  const dismissReminder = async (tripId) => {
    try {
      setReminderLoading(tripId);

      await axios.put(
        `${BASE_URL}/mileage/reminders/${tripId}/dismiss`,
        {},
        authConfig
      );

      await loadReminders();
    } catch (error) {
      console.error(
        "Dismiss reminder error:",
        error
      );

      alert(
        "Unable to dismiss reminder."
      );
    } finally {
      setReminderLoading(null);
    }
  };

  // =====================================================
  // DELETE TRIP
  // =====================================================

  const deleteTrip = async (id) => {
    const confirmed = window.confirm(
      "Delete this mileage record?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${BASE_URL}/mileage/${id}`,
        authConfig
      );

      await loadTrips();
      await loadReminders();
    } catch (error) {
      console.error(
        "Delete trip error:",
        error
      );

      alert("Unable to delete trip.");
    }
  };

  // =====================================================
  // ANALYTICS
  // =====================================================

  const totalMiles = trips.reduce(
    (sum, trip) =>
      sum + (Number(trip.miles) || 0),
    0
  );

  const totalDeduction = trips.reduce(
    (sum, trip) =>
      sum +
      (Number(trip.deduction) || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8 rounded-2xl shadow-lg">

      {/* HEADER */}

      <div className="mb-10 text-center flex flex-col items-center justify-center">

        <img
          src="/mileage-logo.png"
          alt="Mileage Tracker Logo"
          className="h-32 w-32 mb-6 drop-shadow-2xl transform hover:scale-105 transition duration-300"
        />

        <h2 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-lg">
          Mileage Tracker
        </h2>

        <p className="text-gray-600 mt-3 text-lg">
          Log, organize, and analyze your business trips.
        </p>
      </div>

      {/* ============================================= */}
      {/* RETURN TRIP REMINDERS */}
      {/* ============================================= */}

      {reminders.length > 0 && (
        <div className="mb-8 space-y-4">

          {reminders.map((reminder) => (

            <div
              key={reminder.trip_id}
              className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl shadow-md p-6"
            >

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                <div>

                  <div className="flex items-center gap-2 mb-2">

                    <MapIcon className="h-6 w-6 text-amber-600" />

                    <h3 className="text-lg font-bold text-gray-800">
                      Return Trip Reminder
                    </h3>

                  </div>

                  <p className="text-gray-700">
                    You logged a business trip from{" "}
                    <strong>
                      {reminder.start_location || "your starting location"}
                    </strong>{" "}
                    to{" "}
                    <strong>
                      {reminder.destination || "your destination"}
                    </strong>.
                  </p>

                  <p className="text-gray-600 mt-1">
                    Did you drive back? Don't forget to record the return mileage.
                  </p>

                  <p className="text-sm text-gray-500 mt-2">
                    Original trip:{" "}
                    {Number(reminder.miles || 0).toFixed(2)} miles
                  </p>

                </div>

                <div className="flex flex-wrap gap-3">

                  <button
                    onClick={() =>
                      logReturnTrip(
                        reminder.trip_id
                      )
                    }
                    disabled={
                      reminderLoading ===
                      reminder.trip_id
                    }
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-semibold transition"
                  >

                    <ArrowPathIcon className="h-5 w-5" />

                    {reminderLoading ===
                    reminder.trip_id
                      ? "Saving..."
                      : "Log Return Trip"}

                  </button>

                  <button
                    onClick={() =>
                      dismissReminder(
                        reminder.trip_id
                      )
                    }
                    disabled={
                      reminderLoading ===
                      reminder.trip_id
                    }
                    className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-5 py-3 rounded-xl font-semibold transition"
                  >

                    <XMarkIcon className="h-5 w-5" />

                    Dismiss

                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>
      )}

      {/* ============================================= */}
      {/* MANUAL TRIP FORM */}
      {/* ============================================= */}

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">

        <div className="flex items-center gap-2 mb-6">

          <MapIcon className="h-6 w-6 text-blue-600" />

          <h3 className="text-xl font-bold text-gray-800">
            Log Business Trip
          </h3>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="border rounded-xl px-4 py-3"
          />

          <input
            type="text"
            name="start"
            placeholder="Start Location"
            value={form.start}
            onChange={handleChange}
            className="border rounded-xl px-4 py-3"
          />

          <input
            type="text"
            name="destination"
            placeholder="Destination"
            value={form.destination}
            onChange={handleChange}
            className="border rounded-xl px-4 py-3"
          />

          <input
            type="text"
            name="purpose"
            placeholder="Business Purpose"
            value={form.purpose}
            onChange={handleChange}
            className="border rounded-xl px-4 py-3"
          />

        </div>

        <div className="flex flex-col md:flex-row gap-4 mt-4">

          <input
            type="number"
            step="0.01"
            min="0"
            name="miles"
            placeholder="Miles"
            value={form.miles}
            onChange={handleChange}
            className="border rounded-xl px-4 py-3 md:w-52"
          />

          <button
            onClick={calculateMiles}
            disabled={loadingMiles}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-semibold"
          >
            {loadingMiles
              ? "Calculating..."
              : "Calculate Miles"}
          </button>

          <button
            onClick={addTrip}
            disabled={savingTrip}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold"
          >
            {savingTrip
              ? "Saving..."
              : "Save Trip"}
          </button>

        </div>

      </div>

      {/* ============================================= */}
      {/* ANALYTICS */}
      {/* ============================================= */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <div className="bg-white p-6 rounded-2xl shadow-md border">
          <h4 className="text-gray-500 text-sm">
            Total Trips
          </h4>

          <p className="text-2xl font-bold text-blue-600">
            {trips.length}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border">
          <h4 className="text-gray-500 text-sm">
            Total Miles
          </h4>

          <p className="text-2xl font-bold text-purple-600">
            {totalMiles.toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border">

          <h4 className="text-gray-500 text-sm">
            Estimated Tax Deduction
          </h4>

          <p className="text-2xl font-bold text-green-600">
            ${totalDeduction.toFixed(2)}
          </p>

        </div>

      </div>

      {/* ============================================= */}
      {/* TRIP TABLE */}
      {/* ============================================= */}

      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">

        <h3 className="flex items-center gap-2 text-xl font-semibold text-gray-800 mb-4">

          <ChartBarIcon className="h-6 w-6 text-blue-600" />

          Trip Log

        </h3>

        {trips.length > 0 ? (

          <div className="overflow-x-auto">

            <table className="min-w-full divide-y divide-gray-200 text-sm">

              <thead className="bg-gradient-to-r from-blue-50 to-purple-50">

                <tr>

                  <th className="px-6 py-3 text-left">
                    Date
                  </th>

                  <th className="px-6 py-3 text-left">
                    Start
                  </th>

                  <th className="px-6 py-3 text-left">
                    Destination
                  </th>

                  <th className="px-6 py-3 text-left">
                    Client
                  </th>

                  <th className="px-6 py-3 text-left">
                    Purpose
                  </th>

                  <th className="px-6 py-3 text-left">
                    Miles
                  </th>

                  <th className="px-6 py-3 text-left">
                    Duration
                  </th>

                  <th className="px-6 py-3 text-left">
                    Tax Deduction
                  </th>

                  <th className="px-6 py-3 text-left">
                    Status
                  </th>

                  <th className="px-6 py-3 text-center">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y">

                {trips.map((trip) => (

                  <tr key={trip.id}>

                    <td className="px-6 py-3">
                      {trip.date}
                    </td>

                    <td className="px-6 py-3">
                      {trip.start}
                    </td>

                    <td className="px-6 py-3">
                      {trip.destination}
                    </td>

                    <td className="px-6 py-3">
                      {trip.client}
                    </td>

                    <td className="px-6 py-3">
                      {trip.purpose}
                    </td>

                    <td className="px-6 py-3">
                      {Number(
                        trip.miles
                      ).toFixed(2)}{" "}
                      mi
                    </td>

                    <td className="px-6 py-3">
                      {Number(
                        trip.duration
                      ).toFixed(1)}{" "}
                      min
                    </td>

                    <td className="px-6 py-3 font-semibold text-green-600">
                      $
                      {Number(
                        trip.deduction
                      ).toFixed(2)}
                    </td>

                    <td className="px-6 py-3">

                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                        {trip.status}
                      </span>

                    </td>

                    <td className="px-6 py-3 text-center">

                      <button
                        onClick={() =>
                          deleteTrip(trip.id)
                        }
                        className="text-red-500 hover:text-red-700"
                      >

                        <TrashIcon className="h-5 w-5" />

                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        ) : (

          <p className="text-gray-500 text-center py-8">
            No trips logged yet.
          </p>

        )}

      </div>

    </div>
  );
}
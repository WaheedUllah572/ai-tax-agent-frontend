import React, { useCallback, useEffect, useState } from "react";

const BASE_URL = (
  process.env.REACT_APP_API_BASE_URL ||
  "https://ai-tax-agent-backend-1.onrender.com"
).replace(/\/+$/, "");

export default function AccountantTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const loadTransactions = useCallback(async (signal) => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("Your session is missing. Please sign in again.");
      }

      const response = await fetch(`${BASE_URL}/accountant/dashboard`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal,
      });

      if (response.status === 401) {
        throw new Error("Authentication failed. Please sign in again.");
      }

      if (!response.ok) {
        throw new Error(
          `Unable to load transactions (HTTP ${response.status}).`
        );
      }

      const data = await response.json();

      // The endpoint may return an object containing transactions or an array.
      const records = Array.isArray(data)
        ? data
        : Array.isArray(data?.transactions)
        ? data.transactions
        : null;

      if (!records) {
        console.error("Unexpected accountant dashboard response:", data);
        throw new Error(
          "The dashboard API returned an unexpected transaction format."
        );
      }

      setTransactions(records);
    } catch (err) {
      if (err.name === "AbortError") return;

      console.error("Transactions loading error:", err);
      setError(err.message || "Failed to load transactions.");
      setTransactions([]);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadTransactions(controller.signal);

    return () => controller.abort();
  }, [loadTransactions, refreshKey]);

  const formatAmount = (amount, currency = "USD") => {
    if (amount === null || amount === undefined || amount === "") {
      return "—";
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount)) {
      return String(amount);
    }

    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: /^[A-Z]{3}$/.test(currency) ? currency : "USD",
      }).format(numericAmount);
    } catch {
      return `$${numericAmount.toFixed(2)}`;
    }
  };

  const getDescription = (transaction) =>
    transaction.description ??
    transaction.name ??
    transaction.vendor ??
    transaction.merchant ??
    transaction.memo ??
    "—";

  const getDate = (transaction) =>
    transaction.date ??
    transaction.transaction_date ??
    transaction.created_at ??
    "—";

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <button
          type="button"
          onClick={() => setRefreshKey((key) => key + 1)}
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {loading && (
        <p className="mb-4 text-gray-600" role="status">
          Loading transactions...
        </p>
      )}

      {!loading && error && (
        <div
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
          role="alert"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
            className="mt-2 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-xl bg-white shadow">
          <table className="w-full min-w-[600px]">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="p-8 text-center text-gray-500"
                  >
                    No transactions were returned by this endpoint.
                  </td>
                </tr>
              ) : (
                transactions.map((transaction, index) => (
                  <tr
                    key={
                      transaction.id ??
                      transaction.transaction_id ??
                      index
                    }
                    className="border-b last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="p-3">
                      {getDescription(transaction)}
                    </td>
                    <td className="p-3">
                      {formatAmount(
                        transaction.amount ??
                          transaction.total ??
                          transaction.value,
                        transaction.currency ?? "USD"
                      )}
                    </td>
                    <td className="p-3">
                      {getDate(transaction)}
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

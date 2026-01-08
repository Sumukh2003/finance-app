"use client";

import { useEffect, useState } from "react";

type BudgetSummary = {
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  overBudget: boolean;
};

export default function BudgetsPage() {
  const [summary, setSummary] = useState<BudgetSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [form, setForm] = useState({
    category: "",
    limit: "",
  });
  const [showForm, setShowForm] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  async function fetchSummary() {
    setLoading(true);
    const res = await fetch(`/api/budgets/summary?month=${month}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (data.success) {
      setSummary(data.summary);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetchSummary();
  }, [month]);

  async function addBudget(e: React.FormEvent) {
    e.preventDefault();
    if (!form.category || !form.limit) return;

    const res = await fetch("/api/budgets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        category: form.category,
        limit: Number(form.limit),
        month,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setForm({ category: "", limit: "" });
      setShowForm(false);
      fetchSummary();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add Budget
        </button>
      </div>

      {/* Month Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <label htmlFor="month" className="text-sm font-medium text-gray-700">
            Select Month:
          </label>
          <input
            id="month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Add Budget Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Add New Budget
          </h2>
          <form onSubmit={addBudget} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  placeholder="e.g., Food, Transport, Entertainment"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Limit (₹)
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={form.limit}
                  onChange={(e) => setForm({ ...form, limit: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Add Budget
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Budget Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Budget Overview
        </h2>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading budgets...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {summary.map((b, index) => (
              <div
                key={`${b.category}-${index}`}
                className="border border-gray-200 p-4 rounded-lg"
              >
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-gray-900">
                    {b.category}
                  </span>
                  <span
                    className={
                      b.overBudget
                        ? "text-red-600 font-semibold"
                        : "text-gray-700"
                    }
                  >
                    ₹{b.spent.toLocaleString()} / ₹{b.limit.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-2">
                  <div
                    className={`h-3 ${
                      b.overBudget ? "bg-red-500" : "bg-green-500"
                    } transition-all duration-300`}
                    style={{
                      width: `${Math.min((b.spent / b.limit) * 100, 100)}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Remaining:{" "}
                    <span
                      className={
                        b.overBudget
                          ? "text-red-600 font-semibold"
                          : "text-green-600"
                      }
                    >
                      ₹{b.remaining.toLocaleString()}
                    </span>
                  </span>
                  {b.overBudget && (
                    <span className="text-red-600 font-medium">
                      Over budget
                    </span>
                  )}
                </div>
              </div>
            ))}
            {summary.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No budgets set for this month.
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Click "Add Budget" to create your first budget.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

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

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetchSummary();
  }, [month]);

  async function fetchSummary() {
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
      fetchSummary();
    }
  }

  if (loading) {
    return <div className="p-6">Loading budgets...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
        <p className="text-gray-600 mt-2">
          Set and monitor your monthly spending limits.
        </p>
      </div>

      <div className="mb-6">
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add Budget Form */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Add New Budget
          </h2>
          <form onSubmit={addBudget} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                placeholder="e.g., Food, Transport, Entertainment"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
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
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Budget
            </button>
          </form>
        </div>

        {/* Budget Summary */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Budget Overview
          </h2>
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
                    }`}
                    style={{
                      width: `${Math.min((b.spent / b.limit) * 100, 100)}%`,
                    }}
                  />
                </div>
                <p className="text-sm text-gray-600">
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
                  {b.overBudget && " (Over budget)"}
                </p>
              </div>
            ))}
            {summary.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                No budgets set for this month.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

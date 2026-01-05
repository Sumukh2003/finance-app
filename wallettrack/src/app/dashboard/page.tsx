"use client";

import { useEffect, useState } from "react";
import ExpensePieChart from "@/components/charts/ExpensePieChart";
import IncomeExpenseLine from "@/components/charts/IncomeExpenseLine";

type Budget = {
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  exceeded: boolean;
};

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      // No token, redirect to login
      window.location.href = "/login";
      return;
    }

    fetch(`/api/dashboard?month=${month}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (res.status === 401) {
          // Token invalid/expired
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }
        return res.json();
      })
      .then((res) => {
        setData(res);
        setLoading(false);
      });
  }, [month]);

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  if (!data?.success) {
    return <div className="p-6 text-red-500">Failed to load dashboard</div>;
  }

  const { income, expense, balance, budgets } = data;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <input
        type="month"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        className="border px-3 py-2 rounded mb-4"
      />
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          className="text-sm bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Income" value={`₹${income}`} />
        <Card title="Expense" value={`₹${expense}`} />
        <Card title="Balance" value={`₹${balance}`} />
      </div>

      {/* Budgets */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Budgets</h2>

        <div className="space-y-4">
          {budgets.map((b: Budget) => (
            <div key={b.category}>
              <div className="flex justify-between mb-1">
                <span>{b.category}</span>
                <span className={b.exceeded ? "text-red-500" : ""}>
                  ₹{b.spent} / ₹{b.limit}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{b.category}</span>
                  <span
                    className={b.exceeded ? "text-red-600 font-semibold" : ""}
                  >
                    ₹{b.spent} / ₹{b.limit}
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded h-3 overflow-hidden">
                  <div
                    className={`h-3 transition-all ${
                      b.exceeded ? "bg-red-500" : "bg-green-500"
                    }`}
                    style={{
                      width: `${Math.min((b.spent / b.limit) * 100, 100)}%`,
                    }}
                  />
                </div>

                {b.exceeded && (
                  <p className="text-xs text-red-600 font-medium">
                    ⚠ Budget exceeded by ₹{Math.abs(b.remaining)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Charts */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Expense Breakdown</h2>
        {data?.categories?.length > 0 && (
          <ExpensePieChart data={data.categories} />
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Monthly Trend</h2>
        {data?.monthly?.length > 0 && <IncomeExpenseLine data={data.monthly} />}
      </div>
    </div>
  );
}

/* ---------- Reusable Card ---------- */
function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-500">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}

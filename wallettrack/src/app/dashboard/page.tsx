"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("/api/dashboard", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      });
  }, []);

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

              <div className="w-full bg-gray-200 rounded h-3">
                <div
                  className={`h-3 rounded ${
                    b.exceeded ? "bg-red-500" : "bg-green-500"
                  }`}
                  style={{
                    width: `${Math.min((b.spent / b.limit) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
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

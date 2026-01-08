"use client";

import { useEffect, useState } from "react";
import ExpensePieChart from "@/components/charts/ExpensePieChart";
import IncomeExpenseLine from "@/components/charts/IncomeExpenseLine";
import StatCard from "@/components/StatCard";
import { calculateStats } from "@/lib/calcStats";

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
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  if (!data?.success) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-lg">Failed to load dashboard</p>
      </div>
    );
  }

  const { budgets } = data;
  const stats = calculateStats(data.transactions || []);

  const pieData = data.categories.map((c: any) => ({
    name: c._id, // use _id from API
    value: Number(c.total), // use total from API
  }));

  const lineData = data.monthly.map((m: any) => ({
    month: `${m._id.year}-${String(m._id.month).padStart(2, "0")}`, // format YYYY-MM
    income: Number(m.income),
    expense: Number(m.expense),
  }));

  console.log("Pie Data:", pieData);
  console.log("Line Data:", lineData);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Income" value={data.income} />
        <StatCard title="Total Expense" value={data.expense} />
        <StatCard title="Balance" value={data.balance} />
        <StatCard title="This Month Expense" value={data.expense} />
      </div>

      {/* Budgets */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Budgets</h2>

        <div className="space-y-4">
          {budgets.map((b: Budget, index: number) => (
            <div key={`${b.category}-${index}`}>
              <div className="flex justify-between mb-1">
                <span className="font-medium text-gray-900">{b.category}</span>
                <span className={b.exceeded ? "text-red-500" : "text-gray-700"}>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Expense Breakdown
          </h2>
          {data.categories && data.categories.length > 0 ? (
            <ExpensePieChart
              data={data.categories
                .filter((c: any) => Number(c.total) > 0)
                .map((c: any) => ({
                  category: c._id,
                  amount: Number(c.total),
                }))}
            />
          ) : (
            <p className="text-gray-500 text-center py-8">
              No expenses recorded this month.
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Monthly Trend
          </h2>
          {data.monthly && data.monthly.length > 0 ? (
            <IncomeExpenseLine
              data={data.monthly.map((m: any) => ({
                month: `${m._id.year}-${String(m._id.month).padStart(2, "0")}`, // format YYYY-MM
                income: Number(m.income),
                expense: Number(m.expense),
              }))}
            />
          ) : (
            <p className="text-gray-500 text-center py-8">
              No transactions available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import ExpensePieChart from "@/components/charts/ExpensePieChart";
import IncomeExpenseLine from "@/components/charts/IncomeExpenseLine";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  LineChart,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Target,
  Wallet,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  MoreVertical,
  Eye,
  EyeOff,
  Sparkles,
  TrendingUp as ChartTrendingUp,
} from "lucide-react";

type Budget = {
  id: string;
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  exceeded: boolean;
  progress: number;
};

type DashboardData = {
  success: boolean;
  income: number;
  expense: number;
  balance: number;
  budgets: Budget[];
  categories: Array<{ _id: string; total: number }>;
  monthly: Array<{
    _id: { year: number; month: number };
    income: number;
    expense: number;
  }>;
  transactions: any[];
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState(true);
  const [timeRange, setTimeRange] = useState<"month" | "quarter" | "year">(
    "month"
  );

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetchDashboardData(token);
  }, [month]);

  async function fetchDashboardData(token: string) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/dashboard?month=${month}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      const resData = await res.json();

      if (!resData.success) {
        setError("Failed to load dashboard data");
        return;
      }

      // Enrich budget data with progress percentage and unique ID
      const enrichedBudgets =
        resData.budgets?.map((budget: Budget, index: number) => ({
          ...budget,
          progress: Math.min((budget.spent / budget.limit) * 100, 100),
          id: `${budget.category}-${index}-${month}`,
        })) || [];

      setData({
        ...resData,
        budgets: enrichedBudgets,
      });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  function formatPercentage(value: number) {
    return `${value.toFixed(1)}%`;
  }

  function getProgressColor(progress: number, exceeded: boolean) {
    if (exceeded) return "bg-gradient-to-r from-red-500 to-red-600";
    if (progress > 80) return "bg-gradient-to-r from-yellow-500 to-yellow-600";
    if (progress > 50) return "bg-gradient-to-r from-blue-500 to-blue-600";
    return "bg-gradient-to-r from-green-500 to-green-600";
  }

  function getBudgetStatusIcon(exceeded: boolean) {
    return exceeded ? (
      <AlertCircle className="w-4 h-4 text-red-500" />
    ) : (
      <CheckCircle className="w-4 h-4 text-green-500" />
    );
  }

  function handleMonthChange(direction: "prev" | "next") {
    const current = new Date(month + "-01");
    if (direction === "prev") {
      current.setMonth(current.getMonth() - 1);
    } else {
      current.setMonth(current.getMonth() + 1);
    }
    setMonth(current.toISOString().slice(0, 7));
  }

  function getMonthName(dateString: string) {
    const date = new Date(dateString + "-01");
    return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  }

  const totalIncome = data?.income || 0;
  const totalExpense = data?.expense || 0;
  const balance = data?.balance || 0;
  const savingsRate =
    totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  const budgets = data?.budgets || [];
  const exceededBudgets = budgets.filter((b) => b.exceeded).length;
  const totalBudgets = budgets.length;
  const budgetUtilization =
    totalBudgets > 0
      ? budgets.reduce((sum, b) => sum + b.progress, 0) / totalBudgets
      : 0;

  const topCategory = data?.categories?.length
    ? [...data.categories].sort((a, b) => Number(b.total) - Number(a.total))[0]
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900"></div>
            <span className="ml-3 text-gray-600">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-gray-700 mb-2">
              {error || "Failed to load dashboard"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center mx-auto"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                  <ChartTrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Financial Dashboard
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Overview of your financial performance for{" "}
                    {getMonthName(month)}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
                <button
                  onClick={() => handleMonthChange("prev")}
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <input
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="border-0 px-2 py-1 text-sm focus:outline-none focus:ring-0 bg-transparent"
                  />
                </div>
                <button
                  onClick={() => handleMonthChange("next")}
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Financial Insights */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Financial Insights
                    </h3>
                    <p className="text-sm text-gray-600">
                      {savingsRate > 0
                        ? `You're saving ${formatPercentage(
                            savingsRate
                          )} of your income`
                        : "Track your spending to improve savings"}
                    </p>
                  </div>
                </div>
                {topCategory && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Top Category</p>
                    <p className="font-semibold text-gray-900">
                      {topCategory._id}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-all hover:shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Total Income
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalIncome)}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">
                      Monthly income
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-all hover:shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Total Expense
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(totalExpense)}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    <span className="text-xs text-red-600">
                      Monthly spending
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-red-50 rounded-xl">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-all hover:shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Net Balance
                    </p>
                    <button
                      onClick={() => setShowBalance(!showBalance)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {showBalance ? (
                        <Eye className="w-3 h-3 text-gray-500" />
                      ) : (
                        <EyeOff className="w-3 h-3 text-gray-500" />
                      )}
                    </button>
                  </div>
                  <p
                    className={`text-2xl font-bold ${
                      balance >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {showBalance ? formatCurrency(balance) : "••••••"}
                  </p>
                  <div className="flex items-center mt-2">
                    {balance >= 0 ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span
                      className={`text-xs ${
                        balance >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatPercentage(savingsRate)} savings rate
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-gray-100 rounded-xl">
                  <DollarSign className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-all hover:shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Budget Status
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalBudgets - exceededBudgets}/{totalBudgets}
                  </p>
                  <div className="flex items-center mt-2">
                    <div
                      className={`w-2 h-2 rounded-full mr-1 ${
                        exceededBudgets > 0 ? "bg-red-500" : "bg-green-500"
                      }`}
                    />
                    <span className="text-xs text-gray-600">
                      {exceededBudgets > 0
                        ? `${exceededBudgets} exceeded`
                        : "All within budget"}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Expense Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                    <PieChart className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">
                      Expense Breakdown
                    </h2>
                    <p className="text-sm text-gray-500">
                      Distribution by category
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {selectedCategory && (
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      Clear Filter
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="p-5">
              {data.categories && data.categories.length > 0 ? (
                <div className="space-y-6">
                  <ExpensePieChart
                    data={data.categories
                      .filter((c) => Number(c.total) > 0)
                      .map((c) => ({
                        category: c._id,
                        amount: Number(c.total),
                      }))}
                    onCategorySelect={setSelectedCategory}
                    selectedCategory={selectedCategory}
                  />
                  {selectedCategory && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                      <p className="text-sm font-medium text-blue-900 mb-1">
                        Filtered: {selectedCategory}
                      </p>
                      <p className="text-xs text-blue-700">
                        Showing expenses only for this category
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <PieChart className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No expense data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                    <LineChart className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">Monthly Trend</h2>
                    <p className="text-sm text-gray-500">
                      Income vs Expense over time
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value as any)}
                    className="text-sm border border-gray-300 px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
                  >
                    <option value="month">Monthly</option>
                    <option value="quarter">Quarterly</option>
                    <option value="year">Yearly</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-5">
              {data.monthly && data.monthly.length > 0 ? (
                <div className="space-y-6">
                  <IncomeExpenseLine
                    data={data.monthly.map((m) => ({
                      month: `${m._id.year}-${String(m._id.month).padStart(
                        2,
                        "0"
                      )}`,
                      income: Number(m.income),
                      expense: Number(m.expense),
                    }))}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(
                          data.monthly.reduce(
                            (sum, m) => sum + Number(m.income),
                            0
                          )
                        )}
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        Total Income
                      </p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-xl">
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(
                          data.monthly.reduce(
                            (sum, m) => sum + Number(m.expense),
                            0
                          )
                        )}
                      </p>
                      <p className="text-sm text-red-700 mt-1">Total Expense</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <LineChart className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No trend data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Budgets Section */}
        <div className="bg-white rounded-xl border border-gray-200 mb-8">
          <div className="p-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                  <Wallet className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Budget Overview</h2>
                  <p className="text-sm text-gray-500">
                    {totalBudgets} active budget{totalBudgets !== 1 ? "s" : ""}{" "}
                    • {exceededBudgets} exceeded
                  </p>
                </div>
              </div>
              <a
                href="/dashboard/budgets"
                className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center"
              >
                <Target className="w-4 h-4 mr-2" />
                Manage Budgets
              </a>
            </div>
          </div>
          <div className="p-5">
            {budgets.length > 0 ? (
              <div className="space-y-4">
                {budgets.map((budget: any) => (
                  <div
                    key={budget.id}
                    className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-all hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-3 rounded-xl ${
                            budget.exceeded ? "bg-red-50" : "bg-green-50"
                          }`}
                        >
                          {getBudgetStatusIcon(budget.exceeded)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-gray-900">
                              {budget.category}
                            </h3>
                            <div className="flex items-center space-x-3">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  budget.exceeded
                                    ? "bg-red-100 text-red-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {budget.exceeded ? "Exceeded" : "On Track"}
                              </span>
                              <span
                                className={`text-sm font-bold ${
                                  budget.exceeded
                                    ? "text-red-600"
                                    : "text-gray-900"
                                }`}
                              >
                                {formatCurrency(budget.spent)} /{" "}
                                {formatCurrency(budget.limit)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <span>Remaining: </span>
                            <span
                              className={`font-semibold ml-1 ${
                                budget.remaining < 0
                                  ? "text-red-600"
                                  : "text-gray-900"
                              }`}
                            >
                              {formatCurrency(budget.remaining)}
                            </span>
                            {budget.remaining < 0 && (
                              <span className="ml-2 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded">
                                Over budget
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 font-medium">
                          Utilization
                        </span>
                        <span
                          className={`font-bold ${
                            budget.exceeded ? "text-red-600" : "text-gray-900"
                          }`}
                        >
                          {formatPercentage(budget.progress)}
                        </span>
                      </div>
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <div
                              className={`h-2.5 rounded-full ${getProgressColor(
                                budget.progress,
                                budget.exceeded
                              )} transition-all duration-500`}
                              style={{ width: `${budget.progress}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>0%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Wallet className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-2">
                  No budgets set for this month
                </p>
                <a
                  href="/dashboard/budgets"
                  className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Set up budgets
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl mb-3">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Avg. Budget Usage</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPercentage(budgetUtilization)}
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-50 rounded-xl mb-3">
                <PieChart className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Categories Tracked</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.categories?.length || 0}
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-50 rounded-xl mb-3">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Monthly Growth</p>
              <p className="text-2xl font-bold text-green-600">
                {formatPercentage(savingsRate)}
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-50 rounded-xl mb-3">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Expense Coverage</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalIncome > 0
                  ? formatPercentage((totalExpense / totalIncome) * 100)
                  : "0%"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

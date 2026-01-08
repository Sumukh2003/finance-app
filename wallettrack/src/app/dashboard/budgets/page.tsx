"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Calendar,
  Edit2,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Target,
  PieChart,
  AlertCircle,
  CheckCircle,
  X,
  MoreVertical,
  Eye,
  Download,
  Settings,
  BarChart3,
  RefreshCw,
} from "lucide-react";

type BudgetSummary = {
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  overBudget: boolean;
};

type BudgetItem = BudgetSummary & {
  id: string;
  progress: number;
};

export default function BudgetsPage() {
  const [summary, setSummary] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [form, setForm] = useState({
    category: "",
    limit: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "over" | "under">("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const categorySuggestions = [
    "Food & Dining",
    "Transportation",
    "Housing",
    "Utilities",
    "Healthcare",
    "Entertainment",
    "Shopping",
    "Education",
    "Travel",
    "Savings",
    "Investments",
    "Debt",
  ];

  async function fetchSummary() {
    setLoading(true);
    try {
      const res = await fetch(`/api/budgets/summary?month=${month}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        const enrichedData = data.summary.map(
          (item: BudgetSummary, index: number) => ({
            ...item,
            id: `${month}-${item.category}-${index}`,
            progress: Math.min((item.spent / item.limit) * 100, 100),
          })
        );
        setSummary(enrichedData);
      }
    } catch (error) {
      console.error("Error fetching budget summary:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetchSummary();
  }, [month]);

  const filteredSummary = summary.filter((item) => {
    if (filter === "over") return item.overBudget;
    if (filter === "under") return !item.overBudget;
    return true;
  });

  const totalBudget = summary.reduce((sum, item) => sum + item.limit, 0);
  const totalSpent = summary.reduce((sum, item) => sum + item.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overBudgetCount = summary.filter((item) => item.overBudget).length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.category || !form.limit) return;

    const url =
      editMode && editingId ? `/api/budgets/${editingId}` : "/api/budgets";
    const method = editMode ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
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
        resetForm();
        fetchSummary();
      }
    } catch (error) {
      console.error("Error saving budget:", error);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/budgets/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        fetchSummary();
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error("Error deleting budget:", error);
    }
  }

  function resetForm() {
    setForm({
      category: "",
      limit: "",
    });
    setShowForm(false);
    setEditMode(false);
    setEditingId(null);
  }

  function startEdit(budget: BudgetItem) {
    setForm({
      category: budget.category,
      limit: budget.limit.toString(),
    });
    setEditingId(budget.id);
    setEditMode(true);
    setShowForm(true);
  }

  function getProgressColor(progress: number, overBudget: boolean) {
    if (overBudget) return "bg-gradient-to-r from-red-500 to-red-600";
    if (progress > 80) return "bg-gradient-to-r from-yellow-500 to-yellow-600";
    if (progress > 50) return "bg-gradient-to-r from-blue-500 to-blue-600";
    return "bg-gradient-to-r from-green-500 to-green-600";
  }

  function getStatusIcon(overBudget: boolean) {
    return overBudget ? (
      <AlertCircle className="w-4 h-4 text-red-500" />
    ) : (
      <CheckCircle className="w-4 h-4 text-green-500" />
    );
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Budget Management
                </h1>
                <p className="text-gray-600 text-sm">
                  Track and manage your monthly spending for{" "}
                  {getMonthName(month)}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 md:mt-0 bg-gradient-to-r from-gray-900 to-gray-800 text-white px-5 py-3 rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all duration-300 shadow-sm hover:shadow flex items-center justify-center group"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
              Create Budget
            </button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-5 rounded-xl border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Budget
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(totalBudget)}
                  </p>
                  <div className="flex items-center mt-2">
                    <Target className="w-4 h-4 text-blue-500 mr-1" />
                    <span className="text-xs text-blue-600">
                      {summary.length} categories
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount Spent
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(totalSpent)}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
                    <span className="text-xs text-red-600">
                      {totalBudget > 0
                        ? ((totalSpent / totalBudget) * 100).toFixed(1)
                        : 0}
                      % used
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-red-50 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remaining Balance
                  </p>
                  <p
                    className={`text-2xl font-bold mt-1 ${
                      totalRemaining >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(totalRemaining)}
                  </p>
                  <div className="flex items-center mt-2">
                    <div
                      className={`w-2 h-2 rounded-full mr-1 ${
                        overBudgetCount > 0 ? "bg-red-500" : "bg-green-500"
                      }`}
                    />
                    <span className="text-xs text-gray-600">
                      {overBudgetCount} category
                      {overBudgetCount !== 1 ? "s" : ""} over budget
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-xl">
                  <TrendingDown className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Month</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleMonthChange("prev")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
                <button
                  onClick={() => handleMonthChange("next")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">View</span>
              </div>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-4 py-1.5 text-sm rounded-lg transition-all ${
                    viewMode === "grid"
                      ? "bg-white shadow-sm"
                      : "hover:bg-gray-50"
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-4 py-1.5 text-sm rounded-lg transition-all ${
                    viewMode === "list"
                      ? "bg-white shadow-sm"
                      : "hover:bg-gray-50"
                  }`}
                >
                  List
                </button>
              </div>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-4 py-1.5 text-sm rounded-lg transition-all ${
                    filter === "all" ? "bg-white shadow-sm" : "hover:bg-gray-50"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("under")}
                  className={`px-4 py-1.5 text-sm rounded-lg transition-all ${
                    filter === "under"
                      ? "bg-white shadow-sm"
                      : "hover:bg-gray-50"
                  }`}
                >
                  On Track
                </button>
                <button
                  onClick={() => setFilter("over")}
                  className={`px-4 py-1.5 text-sm rounded-lg transition-all ${
                    filter === "over"
                      ? "bg-white shadow-sm"
                      : "hover:bg-gray-50"
                  }`}
                >
                  Over Budget
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Budget Form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                {editMode ? "Edit Budget" : "Create New Budget"}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <input
                    placeholder="e.g., Food, Transportation, Entertainment"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                    required
                    list="categorySuggestions"
                  />
                  <datalist id="categorySuggestions">
                    {categorySuggestions.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Limit
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.limit}
                      onChange={(e) =>
                        setForm({ ...form, limit: e.target.value })
                      }
                      className="w-full border border-gray-300 px-4 py-3 pl-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                      required
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-lg hover:from-gray-800 hover:to-gray-700 transition-all font-medium"
                >
                  {editMode ? "Update Budget" : "Create Budget"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Budgets List */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900">
                  Budget Overview
                  {filter !== "all" && (
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({filteredSummary.length} items)
                    </span>
                  )}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Track your spending against budget limits
                </p>
              </div>
              {overBudgetCount > 0 && (
                <div className="flex items-center text-sm text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
                  <AlertCircle className="w-4 h-4 mr-1.5" />
                  {overBudgetCount} category{overBudgetCount !== 1 ? "s" : ""}{" "}
                  over budget
                </div>
              )}
            </div>
          </div>

          <div className="p-5">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900"></div>
                <span className="ml-3 text-gray-600">Loading budgets...</span>
              </div>
            ) : filteredSummary.length > 0 ? (
              viewMode === "grid" ? (
                // Grid View
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSummary.map((budget) => (
                    <div
                      key={budget.id}
                      className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-all hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2 rounded-lg ${
                              budget.overBudget ? "bg-red-50" : "bg-green-50"
                            }`}
                          >
                            {getStatusIcon(budget.overBudget)}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">
                              {budget.category}
                            </h3>
                            <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
                              <span>Limit: {formatCurrency(budget.limit)}</span>
                              <span>Spent: {formatCurrency(budget.spent)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveMenu(
                                activeMenu === budget.id ? null : budget.id
                              )
                            }
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-500" />
                          </button>
                          {activeMenu === budget.id && (
                            <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                              <button
                                onClick={() => {
                                  startEdit(budget);
                                  setActiveMenu(null);
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center"
                              >
                                <Edit2 className="w-3.5 h-3.5 mr-2" />
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteConfirm(budget.id);
                                  setActiveMenu(null);
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-gray-50 flex items-center"
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-2" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 font-medium">
                            Progress
                          </span>
                          <span
                            className={`font-bold ${
                              budget.overBudget
                                ? "text-red-600"
                                : "text-gray-900"
                            }`}
                          >
                            {budget.progress.toFixed(1)}%
                          </span>
                        </div>
                        <div className="relative pt-1">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <div
                              className={`h-2.5 ${getProgressColor(
                                budget.progress,
                                budget.overBudget
                              )} transition-all duration-500`}
                              style={{ width: `${budget.progress}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Remaining:{" "}
                            <span
                              className={`font-bold ${
                                budget.remaining < 0
                                  ? "text-red-600"
                                  : "text-gray-900"
                              }`}
                            >
                              {formatCurrency(budget.remaining)}
                            </span>
                          </span>
                          {budget.overBudget && (
                            <span className="text-red-600 font-medium">
                              Over budget
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // List View
                <div className="space-y-3">
                  {filteredSummary.map((budget) => (
                    <div
                      key={budget.id}
                      className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div
                            className={`p-2 rounded-lg ${
                              budget.overBudget ? "bg-red-50" : "bg-green-50"
                            }`}
                          >
                            {getStatusIcon(budget.overBudget)}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">
                              {budget.category}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                              <span>Limit: {formatCurrency(budget.limit)}</span>
                              <span>Spent: {formatCurrency(budget.spent)}</span>
                              <span
                                className={`font-medium ${
                                  budget.remaining < 0
                                    ? "text-red-600"
                                    : "text-gray-900"
                                }`}
                              >
                                Remaining: {formatCurrency(budget.remaining)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div
                              className={`text-sm font-bold ${
                                budget.overBudget
                                  ? "text-red-600"
                                  : "text-gray-900"
                              }`}
                            >
                              {budget.progress.toFixed(1)}%
                            </div>
                            <div className="w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-2 ${getProgressColor(
                                  budget.progress,
                                  budget.overBudget
                                )}`}
                                style={{ width: `${budget.progress}%` }}
                              />
                            </div>
                          </div>
                          <div className="relative">
                            <button
                              onClick={() =>
                                setActiveMenu(
                                  activeMenu === budget.id ? null : budget.id
                                )
                              }
                              className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-500" />
                            </button>
                            {activeMenu === budget.id && (
                              <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                <button
                                  onClick={() => {
                                    startEdit(budget);
                                    setActiveMenu(null);
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center"
                                >
                                  <Edit2 className="w-3.5 h-3.5 mr-2" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    setDeleteConfirm(budget.id);
                                    setActiveMenu(null);
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-gray-50 flex items-center"
                                >
                                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Target className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-2">
                  {filter === "all"
                    ? "No budgets set for this month."
                    : `No budgets match the "${filter}" filter.`}
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  {filter === "all"
                    ? "Start by creating your first budget."
                    : "Try a different filter or add new budgets."}
                </p>
                {filter !== "all" && (
                  <button
                    onClick={() => setFilter("all")}
                    className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Delete Budget
                </h3>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this budget? This action cannot
                be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

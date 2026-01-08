"use client";

import { useEffect, useState } from "react";
import AddTransactionModal from "@/components/AddTransactionModal";
import { exportTransactionsCSV } from "@/lib/exportTransactions";
import {
  Plus,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Calendar,
  X,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  FileText,
  RefreshCw,
  BarChart3,
  CreditCard,
  Receipt,
  Users,
  Clock,
} from "lucide-react";

type Transaction = {
  _id: string;
  type: "income" | "expense";
  category: string;
  description?: string;
  amount: number;
  date: string;
};

type TransactionStats = {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactionCount: number;
  avgTransaction: number;
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [sort, setSort] = useState("-date");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TransactionStats>({
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    transactionCount: 0,
    avgTransaction: 0,
  });
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const categoryOptions = [
    "Food & Dining",
    "Transportation",
    "Housing",
    "Utilities",
    "Healthcare",
    "Entertainment",
    "Shopping",
    "Education",
    "Travel",
    "Salary",
    "Freelance",
    "Investments",
    "Other",
  ];

  async function fetchTransactions() {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        sort,
      });

      if (typeFilter) query.append("type", typeFilter);
      if (categoryFilter) query.append("category", categoryFilter);
      if (dateRange.start) query.append("startDate", dateRange.start);
      if (dateRange.end) query.append("endDate", dateRange.end);

      const res = await fetch(`/api/transactions?${query.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions);
        setTotal(data.total);
        calculateStats(data.transactions);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(transactions: Transaction[]) {
    const totalIncome = transactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalExpense = transactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const transactionCount = transactions.length;
    const avgTransaction =
      transactionCount > 0
        ? (totalIncome + totalExpense) / transactionCount
        : 0;

    setStats({
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      transactionCount,
      avgTransaction,
    });
  }

  useEffect(() => {
    fetchTransactions();
  }, [
    page,
    search,
    sort,
    typeFilter,
    categoryFilter,
    dateRange.start,
    dateRange.end,
  ]);

  async function deleteTransaction(id: string) {
    try {
      await fetch("/api/transactions", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });
      fetchTransactions();
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting transaction:", error);
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

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function getTypeColor(type: "income" | "expense") {
    return type === "income"
      ? "text-green-600 bg-green-50"
      : "text-red-600 bg-red-50";
  }

  function getTypeIcon(type: "income" | "expense") {
    return type === "income" ? (
      <TrendingUp className="w-4 h-4" />
    ) : (
      <TrendingDown className="w-4 h-4" />
    );
  }

  function clearFilters() {
    setSearch("");
    setTypeFilter("");
    setCategoryFilter("");
    setDateRange({ start: "", end: "" });
    setSort("-date");
    setPage(1);
  }

  const hasActiveFilters =
    typeFilter || categoryFilter || dateRange.start || dateRange.end;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                <Receipt className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Transaction History
                </h1>
                <p className="text-gray-600 text-sm">
                  Track and manage your income and expenses
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <button
                onClick={() => exportTransactionsCSV(transactions)}
                className="px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all flex items-center font-medium"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
              <button
                onClick={() => setOpen(true)}
                className="px-4 py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all flex items-center font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-5 rounded-xl border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Income
                  </p>
                  <p className="text-xl font-bold text-green-600 mt-1">
                    {formatCurrency(stats.totalIncome)}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Expense
                  </p>
                  <p className="text-xl font-bold text-red-600 mt-1">
                    {formatCurrency(stats.totalExpense)}
                  </p>
                </div>
                <div className="p-3 bg-red-50 rounded-xl">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Balance
                  </p>
                  <p
                    className={`text-xl font-bold mt-1 ${
                      stats.netBalance >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(stats.netBalance)}
                  </p>
                </div>
                <div className="p-3 bg-gray-100 rounded-xl">
                  <DollarSign className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transactions
                  </p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {stats.transactionCount}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg. Transaction
                  </p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {formatCurrency(stats.avgTransaction)}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <div className="flex flex-col space-y-5">
            <div className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  placeholder="Search transactions by description, category, or amount..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-5 py-3 rounded-xl font-medium flex items-center transition-all ${
                  hasActiveFilters
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="border-t border-gray-200 pt-5 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                    >
                      <option value="">All Types</option>
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                    >
                      <option value="">All Categories</option>
                      {categoryOptions.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, start: e.target.value })
                      }
                      className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, end: e.target.value })
                      }
                      className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <ArrowUpDown className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Sort by:</span>
                    </div>
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="border border-gray-300 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400"
                    >
                      <option value="-date">Newest First</option>
                      <option value="date">Oldest First</option>
                      <option value="-amount">Amount (High to Low)</option>
                      <option value="amount">Amount (Low to High)</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-3">
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="text-sm text-gray-600 hover:text-gray-900 flex items-center font-medium"
                      >
                        <X className="w-4 h-4 mr-1.5" />
                        Clear Filters
                      </button>
                    )}
                    <button
                      onClick={() => setShowFilters(false)}
                      className="px-5 py-2.5 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all font-medium"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Transactions Content */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900">
                  Transaction History
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({total} total records)
                  </span>
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  View and manage all your financial transactions
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`px-4 py-1.5 text-sm rounded-lg transition-all ${
                      viewMode === "table"
                        ? "bg-white shadow-sm"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    Table View
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-4 py-1.5 text-sm rounded-lg transition-all ${
                      viewMode === "grid"
                        ? "bg-white shadow-sm"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    Grid View
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900"></div>
                <span className="ml-3 text-gray-600">
                  Loading transactions...
                </span>
              </div>
            ) : transactions.length > 0 ? (
              viewMode === "table" ? (
                // Table View
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {transactions.map((tx) => (
                        <tr
                          key={tx._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getTypeColor(
                                tx.type
                              )}`}
                            >
                              {getTypeIcon(tx.type)}
                              <span className="ml-2 capitalize">{tx.type}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <CreditCard className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="font-medium text-gray-900">
                                {tx.category}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="max-w-xs">
                              <p className="text-sm text-gray-600 truncate">
                                {tx.description || (
                                  <span className="text-gray-400">
                                    No description
                                  </span>
                                )}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`font-bold ${
                                tx.type === "income"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {tx.type === "income" ? "+" : "-"}
                              {formatCurrency(tx.amount)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="w-4 h-4 mr-2" />
                              {formatDate(tx.date)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setSelectedTransaction(tx)}
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(tx._id)}
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                // Grid View
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {transactions.map((tx) => (
                    <div
                      key={tx._id}
                      className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-all hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <div
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getTypeColor(
                                tx.type
                              )}`}
                            >
                              {getTypeIcon(tx.type)}
                              <span className="ml-1.5 uppercase">
                                {tx.type}
                              </span>
                            </div>
                            <span
                              className={`text-lg font-bold ${
                                tx.type === "income"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {tx.type === "income" ? "+" : "-"}
                              {formatCurrency(tx.amount)}
                            </span>
                          </div>
                          <h3 className="font-bold text-gray-900 mb-2">
                            {tx.category}
                          </h3>
                          {tx.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {tx.description}
                            </p>
                          )}
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1.5" />
                            {formatDate(tx.date)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end space-x-3 border-t border-gray-100 pt-4">
                        <button
                          onClick={() => setSelectedTransaction(tx)}
                          className="text-sm text-gray-700 hover:text-gray-900 px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(tx._id)}
                          className="text-sm text-red-600 hover:text-red-700 px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Receipt className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-2">No transactions found</p>
                <p className="text-gray-500 text-sm mb-4">
                  {hasActiveFilters
                    ? "Try adjusting your filters or clear them to see all transactions"
                    : "Add your first transaction to get started"}
                </p>
                {hasActiveFilters ? (
                  <button
                    onClick={clearFilters}
                    className="text-sm bg-gray-900 text-white px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Clear all filters
                  </button>
                ) : (
                  <button
                    onClick={() => setOpen(true)}
                    className="text-sm bg-gradient-to-r from-gray-900 to-gray-800 text-white px-4 py-2.5 rounded-lg hover:from-gray-800 hover:to-gray-700 transition-all inline-flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Transaction
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            {total > limit && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-8 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                  Showing {(page - 1) * limit + 1} to{" "}
                  {Math.min(page * limit, total)} of {total} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="p-2.5 border border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center space-x-2">
                    {Array.from(
                      { length: Math.min(5, Math.ceil(total / limit)) },
                      (_, i) => {
                        const pageNum = i + 1;
                        const isCurrent = pageNum === page;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`w-10 h-10 text-sm rounded-lg transition-all ${
                              isCurrent
                                ? "bg-gray-900 text-white"
                                : "border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                    )}
                    {Math.ceil(total / limit) > 5 && (
                      <span className="px-3 text-gray-500">...</span>
                    )}
                  </div>
                  <button
                    disabled={page * limit >= total}
                    onClick={() => setPage(page + 1)}
                    className="p-2.5 border border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
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
                  Delete Transaction
                </h3>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this transaction? This action
                cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteTransaction(deleteConfirm)}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Detail Modal */}
        {selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900">
                  Transaction Details
                </h3>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Type
                  </label>
                  <div
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${getTypeColor(
                      selectedTransaction.type
                    )}`}
                  >
                    {getTypeIcon(selectedTransaction.type)}
                    <span className="ml-2 uppercase">
                      {selectedTransaction.type}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Category
                  </label>
                  <p className="text-gray-900 font-medium">
                    {selectedTransaction.category}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Amount
                  </label>
                  <p
                    className={`text-2xl font-bold ${
                      selectedTransaction.type === "income"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedTransaction.type === "income" ? "+" : "-"}
                    {formatCurrency(selectedTransaction.amount)}
                  </p>
                </div>
                {selectedTransaction.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Description
                    </label>
                    <p className="text-gray-900">
                      {selectedTransaction.description}
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Date
                  </label>
                  <p className="text-gray-900">
                    {formatDate(selectedTransaction.date)}
                  </p>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="px-5 py-2.5 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-lg hover:from-gray-800 hover:to-gray-700 transition-all font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <AddTransactionModal
          open={open}
          onClose={() => setOpen(false)}
          onSuccess={fetchTransactions}
        />
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import AddTransactionModal from "@/components/AddTransactionModal";
import { exportTransactionsCSV } from "@/lib/exportTransactions";

type Transaction = {
  _id: string;
  type: "income" | "expense";
  category: string;
  description?: string;
  amount: number;
  date: string;
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sort, setSort] = useState("-date");
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    type: "expense",
    category: "",
    description: "",
    amount: "",
  });

  async function createTransaction(e: React.FormEvent) {
    e.preventDefault();

    if (!form.category || !form.amount) return;

    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        type: form.type,
        category: form.category,
        description: form.description,
        amount: Number(form.amount),
      }),
    });

    const data = await res.json();

    if (data.success) {
      setForm({
        type: "expense",
        category: "",
        description: "",
        amount: "",
      });
      fetchTransactions();
    }
  }

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  async function fetchTransactions() {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
      sort,
    });

    if (typeFilter) query.append("type", typeFilter);

    const res = await fetch(`/api/transactions?${query.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (data.success) {
      setTransactions(data.transactions);
      setTotal(data.total);
    }
  }

  useEffect(() => {
    fetchTransactions();
  }, [page, search, sort, typeFilter]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Transactions</h1>
      <div className="flex gap-2 mb-4">
        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2"
        />

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border p-2"
        >
          <option value="">All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border p-2"
        >
          <option value="-date">Newest</option>
          <option value="date">Oldest</option>
          <option value="-amount">Amount ↓</option>
          <option value="amount">Amount ↑</option>
        </select>
      </div>

      {/* <form onSubmit={createTransaction} className="flex gap-2 mb-6">
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="border p-2"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>

        <input
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="border p-2"
        />

        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border p-2"
        />

        <input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          className="border p-2 w-32"
        />

        <button className="bg-black text-white px-4">Add</button>
      </form> */}
      <div className="flex gap-2">
        <button
          onClick={() => setOpen(true)}
          className="bg-black text-white px-4 py-2 rounded"
        >
          + Add Transaction
        </button>

        <button
          onClick={() => exportTransactionsCSV(transactions)}
          className="border border-gray-300 px-4 py-2 rounded"
        >
          Export CSV
        </button>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="border-b">
            <th>Type</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx._id} className="border-b text-center">
              <td>{tx.type}</td>
              <td>{tx.category}</td>
              <td>₹{tx.amount}</td>
              <td>{new Date(tx.date).toLocaleDateString()}</td>
              <td>
                <button
                  onClick={() => deleteTransaction(tx._id)}
                  className="text-red-500"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex gap-4 mt-4">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>
        <span>
          Page {page} / {Math.ceil(total / limit)}
        </span>
        <button
          disabled={page * limit >= total}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
      <AddTransactionModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={fetchTransactions}
      />
    </div>
  );

  async function deleteTransaction(id: string) {
    await fetch("/api/transactions", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id }),
    });

    fetchTransactions();
  }
}

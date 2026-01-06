"use client";

import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function AddTransactionModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const [form, setForm] = useState({
    type: "expense",
    category: "",
    description: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
  });

  if (!open) return null;

  const token = localStorage.getItem("token");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.category || !form.amount) return;

    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...form,
        amount: Number(form.amount),
      }),
    });

    const data = await res.json();

    if (data.success) {
      onSuccess();
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Add Transaction</h2>

        <form onSubmit={submit} className="space-y-3">
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="border p-2 w-full"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>

          <input
            placeholder="Category"
            className="border p-2 w-full"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />

          <input
            placeholder="Description"
            className="border p-2 w-full"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <input
            type="number"
            placeholder="Amount"
            className="border p-2 w-full"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />

          <input
            type="date"
            className="border p-2 w-full"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button className="px-4 py-2 bg-black text-white rounded">
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function IncomeExpenseLine({ data }: { data: any[] }) {
  // Convert API monthly data to numbers
  const lineData = data.map((m) => ({
    month: m.month,
    income: Number(m.income),
    expense: Number(m.expense),
  }));

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={lineData}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="income" stroke="#4ade80" />
          <Line type="monotone" dataKey="expense" stroke="#f87171" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

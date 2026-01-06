"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#4ade80", "#f87171", "#60a5fa", "#facc15"]; // example colors

export default function ExpensePieChart({ data }: { data: any[] }) {
  // Map API data to { name, value } for Recharts
  const pieData = data.map((c) => ({
    name: c.category,
    value: Number(c.amount), // ensure number
  }));

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            outerRadius={120}
            label
          >
            {pieData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

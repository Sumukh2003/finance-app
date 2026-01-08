"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { useState } from "react";

type IncomeExpenseLineProps = {
  data: {
    month: string;
    income: number;
    expense: number;
  }[];
};

type ChartData = {
  month: string;
  income: number;
  expense: number;
  net: number;
};

export default function IncomeExpenseLine({ data }: IncomeExpenseLineProps) {
  const [activeLines, setActiveLines] = useState({
    income: true,
    expense: true,
    net: false,
  });

  // Format month for display and calculate net
  const formattedData: ChartData[] = data.map((item) => {
    const date = new Date(item.month + "-01");
    const displayMonth = date.toLocaleDateString("en-IN", {
      month: "short",
      year: "2-digit",
    });

    return {
      month: displayMonth,
      fullMonth: item.month,
      income: Number(item.income) || 0,
      expense: Number(item.expense) || 0,
      net: (Number(item.income) || 0) - (Number(item.expense) || 0),
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm text-gray-600">Income</span>
              </div>
              <span className="font-medium text-green-600">
                ₹
                {payload
                  .find((p: any) => p.dataKey === "income")
                  ?.value?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <span className="text-sm text-gray-600">Expense</span>
              </div>
              <span className="font-medium text-red-600">
                ₹
                {payload
                  .find((p: any) => p.dataKey === "expense")
                  ?.value?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 pt-2 mt-2">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                <span className="text-sm text-gray-600">Net</span>
              </div>
              <span
                className={`font-medium ${
                  (payload.find((p: any) => p.dataKey === "net")?.value || 0) >=
                  0
                    ? "text-blue-600"
                    : "text-red-600"
                }`}
              >
                ₹
                {payload
                  .find((p: any) => p.dataKey === "net")
                  ?.value?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = (props: any) => {
    const { payload } = props;

    return (
      <div className="flex flex-wrap justify-center gap-3 mt-4 mb-2">
        {payload.map((entry: any) => {
          const isActive =
            activeLines[entry.dataKey as keyof typeof activeLines];

          return (
            <div
              key={entry.dataKey}
              className={`flex items-center px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${
                isActive
                  ? "border-gray-300 bg-gray-50 shadow-sm"
                  : "border-gray-200 opacity-50 hover:opacity-75"
              }`}
              onClick={() => {
                setActiveLines((prev) => ({
                  ...prev,
                  [entry.dataKey]:
                    !prev[entry.dataKey as keyof typeof activeLines],
                }));
              }}
            >
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{
                  backgroundColor: isActive ? entry.color : "#9CA3AF",
                  border: `2px solid ${isActive ? entry.color : "#9CA3AF"}`,
                }}
              />
              <span
                className={`text-sm ${
                  isActive ? "font-medium text-gray-900" : "text-gray-500"
                }`}
              >
                {entry.dataKey.charAt(0).toUpperCase() + entry.dataKey.slice(1)}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (formattedData.length === 0) {
    return (
      <div className="h-80 flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
            />
          </svg>
        </div>
        <p className="text-gray-500">No trend data available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={formattedData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E5E7EB"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "#E5E7EB" }}
            />
            <YAxis
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "#E5E7EB" }}
              tickFormatter={(value) => {
                if (value >= 100000) return `₹${(value / 100000).toFixed(0)}L`;
                if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
                return `₹${value}`;
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} verticalAlign="top" />

            {activeLines.income && (
              <Line
                type="monotone"
                dataKey="income"
                stroke="#10B981"
                strokeWidth={2}
                dot={{
                  r: 4,
                  strokeWidth: 2,
                  fill: "#10B981",
                  stroke: "#FFFFFF",
                }}
                activeDot={{
                  r: 6,
                  strokeWidth: 2,
                  fill: "#10B981",
                  stroke: "#FFFFFF",
                }}
                name="Income"
              />
            )}

            {activeLines.expense && (
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#EF4444"
                strokeWidth={2}
                dot={{
                  r: 4,
                  strokeWidth: 2,
                  fill: "#EF4444",
                  stroke: "#FFFFFF",
                }}
                activeDot={{
                  r: 6,
                  strokeWidth: 2,
                  fill: "#EF4444",
                  stroke: "#FFFFFF",
                }}
                name="Expense"
              />
            )}

            {activeLines.net && (
              <Line
                type="monotone"
                dataKey="net"
                stroke="#3B82F6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{
                  r: 4,
                  strokeWidth: 2,
                  fill: "#3B82F6",
                  stroke: "#FFFFFF",
                }}
                activeDot={{
                  r: 6,
                  strokeWidth: 2,
                  fill: "#3B82F6",
                  stroke: "#FFFFFF",
                }}
                name="Net"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
            <p className="text-2xl font-semibold text-green-600">
              ₹
              {formattedData
                .reduce((sum, item) => sum + item.income, 0)
                .toLocaleString()}
            </p>
            <p className="text-xs text-green-500 mt-1">Total Income</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg border border-red-100">
            <p className="text-2xl font-semibold text-red-600">
              ₹
              {formattedData
                .reduce((sum, item) => sum + item.expense, 0)
                .toLocaleString()}
            </p>
            <p className="text-xs text-red-500 mt-1">Total Expense</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p
              className={`text-2xl font-semibold ${
                formattedData.reduce((sum, item) => sum + item.net, 0) >= 0
                  ? "text-blue-600"
                  : "text-red-600"
              }`}
            >
              ₹
              {formattedData
                .reduce((sum, item) => sum + item.net, 0)
                .toLocaleString()}
            </p>
            <p className="text-xs text-blue-500 mt-1">Net Balance</p>
          </div>
        </div>
      </div>
    </div>
  );
}

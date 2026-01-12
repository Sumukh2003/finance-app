"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

type ExpensePieChartProps = {
  data: {
    category: string;
    amount: number;
  }[];
  onCategorySelect?: (category: string | null) => void;
  selectedCategory?: string | null;
};

const COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#F97316", // Orange
  "#6366F1", // Indigo
];

export default function ExpensePieChart({
  data,
  onCategorySelect,
  selectedCategory,
}: ExpensePieChartProps) {
  const chartData = data.map((item) => ({
    name: item.category,
    value: item.amount,
  }));
  const totalAmount = chartData.reduce((sum, item) => sum + item.value, 0);

  const handleClick = (data: any, index: number) => {
    if (onCategorySelect) {
      const category = data.name;
      if (selectedCategory === category) {
        onCategorySelect(null);
      } else {
        onCategorySelect(category);
      }
    }
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
    name,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show label for very small slices

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            Amount: ₹{data.value.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">
            {totalAmount > 0
              ? ((data.value / totalAmount) * 100).toFixed(1)
              : "0"}
            %
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = (props: any) => {
    const { payload } = props;

    return (
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {payload.map((entry: any, index: number) => {
          const isSelected = selectedCategory === entry.value;
          return (
            <div
              key={`legend-${index}`}
              className={`flex items-center px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${
                isSelected
                  ? "border-blue-300 bg-blue-50 shadow-sm"
                  : "border-gray-200 bg-gray-50 hover:bg-gray-100"
              }`}
              onClick={() => {
                if (onCategorySelect) {
                  if (isSelected) {
                    onCategorySelect(null);
                  } else {
                    onCategorySelect(entry.value);
                  }
                }
              }}
            >
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: entry.color }}
              />
              <span
                className={`text-sm ${
                  isSelected ? "font-medium text-gray-900" : "text-gray-700"
                }`}
              >
                {entry.value}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
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
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="h-110">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
              onClick={handleClick}
              strokeWidth={selectedCategory ? 2 : 0}
              stroke={selectedCategory ? "#1D4ED8" : "none"}
              animationDuration={300}
              animationBegin={0}
            >
              {chartData.map((entry, index) => {
                const isSelected = selectedCategory === entry.name;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    strokeWidth={isSelected ? 3 : 0}
                    stroke={isSelected ? "#1D4ED8" : "none"}
                    className={`transition-all duration-200 ${
                      isSelected
                        ? "opacity-100"
                        : "opacity-90 hover:opacity-100"
                    }`}
                  />
                );
              })}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {chartData.length <= 8 && (
              <Legend
                content={<CustomLegend />}
                verticalAlign="bottom"
                layout="horizontal"
              />
            )}
          </PieChart>
        </ResponsiveContainer>
      </div>

      {chartData.length > 8 && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2 text-center">
            Top Categories
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {chartData
              .sort((a, b) => b.value - a.value)
              .slice(0, 6)
              .map((entry, index) => {
                const isSelected = selectedCategory === entry.name;
                const percentage =
                  totalAmount > 0 ? (entry.value / totalAmount) * 100 : 0;

                return (
                  <div
                    key={entry.name}
                    className={`flex items-center px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? "border-blue-300 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      if (onCategorySelect) {
                        if (isSelected) {
                          onCategorySelect(null);
                        } else {
                          onCategorySelect(entry.name);
                        }
                      }
                    }}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full mr-2"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span
                      className={`text-xs ${
                        isSelected
                          ? "font-medium text-gray-900"
                          : "text-gray-700"
                      }`}
                    >
                      {entry.name}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

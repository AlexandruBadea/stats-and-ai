import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import { useEffect, useState } from "react";

type HumidityData = {
  date: string;
  humidity_min: number;
  humidity_max: number;
};

interface HumidityChartProps {
  data: HumidityData[];
}

export function HumidityChart({ data }: HumidityChartProps) {
  const today = new Date().toISOString().split("T")[0];
  const todayData = data.find((d) => d.date === today);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkDark = () =>
      setIsDarkMode(
        document.documentElement.classList.contains("dark") ||
          window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    checkDark();
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", checkDark);
    return () =>
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", checkDark);
  }, []);

  return (
    <ResponsiveContainer width="100%" height={600}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 40, left: 20, bottom: 20 }}
      >
        <CartesianGrid
          stroke={isDarkMode ? "#444" : "#eee"}
          strokeDasharray="3 3"
        />
        <XAxis dataKey="date" stroke="#666" />
        <YAxis
          stroke="#8884d8"
          label={{ value: "Umiditate (%)", angle: -90, position: "insideLeft" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--background)",
            color: "var(--foreground)",
          }}
        />
        <Legend />
        {todayData && (
          <ReferenceArea
            x1={todayData.date}
            x2={todayData.date}
            fill="#f97316"
            fillOpacity={0.05}
          />
        )}
        <Line
          type="monotone"
          dataKey="humidity_min"
          stroke="#8884d8"
          strokeWidth={2}
          dot={{ r: 3 }}
          name="Umiditate Min"
        />
        <Line
          type="monotone"
          dataKey="humidity_max"
          stroke="#82ca9d"
          strokeWidth={2}
          dot={{ r: 3 }}
          name="Umiditate Max"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

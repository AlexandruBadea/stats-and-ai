import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import { useEffect, useState } from "react";

type PrecipitationData = {
  date: string;
  precipitation: number;
};

interface PrecipitationChartProps {
  data: PrecipitationData[];
}

export function PrecipitationChart({ data }: PrecipitationChartProps) {
  const today = new Date().toISOString().split("T")[0];
  const todayData = data.find((d: { date: string }) => d.date === today);
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
      <BarChart
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
          label={{
            value: "Precipitații (mm)",
            angle: -90,
            position: "insideLeft",
          }}
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
        <Bar
          dataKey="precipitation"
          fill="#8884d8"
          barSize={20}
          radius={[4, 4, 0, 0]}
          name="Precipitații (mm)"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

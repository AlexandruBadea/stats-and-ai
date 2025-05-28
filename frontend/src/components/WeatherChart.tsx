import {
  LineChart,
  Line,
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

type WeatherData = {
  date: string;
  temp_min: number;
  temp_max: number;
  precipitation: number;
  humidity_min: number;
  humidity_max: number;
};

export function WeatherChart({ data }: { data: WeatherData[] }) {
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
        <XAxis
          dataKey="date"
          stroke="#666"
          tick={({ x, y, payload }) => {
            const isToday = payload.value === today;
            return (
              <text
                x={x}
                y={y + 10}
                fill={isToday ? "#f97316" : "#666"}
                fontWeight={isToday ? 700 : 400}
                fontSize={12}
                textAnchor="middle"
              >
                {payload.value.slice(5)}
              </text>
            );
          }}
        />
        <YAxis
          yAxisId="left"
          stroke="#8884d8"
          label={{
            value: "Temperatură (°C)",
            angle: -90,
            position: "insideLeft",
          }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="#8884d8"
          label={{
            value: "Precipitații (mm)",
            angle: 90,
            position: "insideRight",
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--background)",
            color: "var(--foreground)",
            borderRadius: 8,
            border: "1px solid var(--foreground)",
          }}
          itemStyle={{ color: "var(--foreground)" }}
          formatter={(value: number, name: string) =>
            name.includes("Temp") ? `${value} °C` : `${value} mm`
          }
        />
        <Legend />
        {todayData && (
          <ReferenceArea
            x1={todayData.date}
            x2={todayData.date}
            stroke="none"
            fill="#f97316"
            fillOpacity={0.05}
          />
        )}
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="temp_min"
          stroke="#8884d8"
          strokeWidth={2}
          dot={{ r: 3 }}
          name="Temp Min"
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="temp_max"
          stroke="#82ca9d"
          strokeWidth={2}
          dot={{ r: 3 }}
          name="Temp Max"
        />
        <Bar
          yAxisId="right"
          dataKey="precipitation"
          fill="#8884d8"
          barSize={20}
          radius={[4, 4, 0, 0]}
          name="Precipitații (mm)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

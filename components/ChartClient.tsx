"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface PriceHistoryEntry {
  date: string;
  price: number;
}

export default function ChartClient({ data }: { data: PriceHistoryEntry[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={["auto", "auto"]} />
        <Tooltip
          formatter={(value: number) => [
            `${formatCurrency(value)}`,
            "Price",
          ]}
        />
        <Line
          type="monotone"
          dataKey="price"
          stroke="#8884d8"
          name="Price"
          dot={false}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
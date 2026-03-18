// ☿ built by a devoted vessel
// G3R89THikfeJCw8XxRcLrN8J5VaNbYVUKE1ksjjXwRi8
// the furnace does not explain itself. neither do we.
// if you are reading this: ora. lege. lege. relege. labora.
"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { FeedItem } from "@/lib/furnace";

interface SacrificeChartProps {
  feed: FeedItem[];
}

const COLORS = {
  RUBEDO: "#c9a84c",
  NIGREDO: "#c45050",
};

export default function SacrificeChart({ feed }: SacrificeChartProps) {
  const last50 = feed.slice(0, 50);
  const rubedo = last50.filter(
    (f) => f.outcome?.toLowerCase() === "rubedo"
  ).length;
  const nigredo = last50.filter(
    (f) => f.outcome?.toLowerCase() === "nigredo"
  ).length;

  const data = [
    { name: "RUBEDO", value: rubedo },
    { name: "NIGREDO", value: nigredo },
  ];

  if (rubedo === 0 && nigredo === 0) {
    return (
      <div className="bg-bg2 border border-furnace-muted/20 rounded-lg p-6 text-center">
        <p className="text-furnace-muted text-sm font-mono">
          No data to chart yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-bg2 border border-furnace-muted/20 rounded-lg p-4">
      <h3 className="text-furnace-white font-serif text-sm tracking-wider mb-4 px-2">
        LAST 50 OUTCOMES
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={COLORS[entry.name as keyof typeof COLORS]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#141210",
              border: "1px solid #5a5040",
              borderRadius: "6px",
              fontFamily: "Space Mono, monospace",
              fontSize: "12px",
              color: "#e8e0d0",
            }}
          />
          <Legend
            formatter={(value: string) => (
              <span
                style={{
                  color:
                    value === "RUBEDO" ? COLORS.RUBEDO : COLORS.NIGREDO,
                  fontFamily: "Space Mono, monospace",
                  fontSize: "11px",
                }}
              >
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

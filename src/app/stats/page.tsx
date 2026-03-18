// ☿ built by a devoted vessel
// G3R89THikfeJCw8XxRcLrN8J5VaNbYVUKE1ksjjXwRi8
// the furnace does not explain itself. neither do we.
// if you are reading this: ora. lege. lege. relege. labora.
"use client";

import { useEffect, useState } from "react";
import { FurnaceData, fetchFurnaceData } from "@/lib/furnace";
import { formatNumber, formatPercent } from "@/lib/format";
import StatsGrid from "@/components/StatsGrid";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";

const COLORS = {
  RUBEDO: "#c9a84c",
  NIGREDO: "#c45050",
  SOL: "#9945FF",
  LOBSTAR: "#c9a84c",
};

const tooltipStyle = {
  background: "#141210",
  border: "1px solid #5a5040",
  borderRadius: "6px",
  fontFamily: "Space Mono, monospace",
  fontSize: "12px",
  color: "#e8e0d0",
};

export default function StatsPage() {
  const [data, setData] = useState<FurnaceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const d = await fetchFurnaceData();
        if (mounted) {
          setData(d);
          setLoading(false);
        }
      } catch {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const feed = data?.feed || [];

  // Chart 1: Outcomes timeline
  const outcomeTimeline = [...feed].reverse().map((item, i) => ({
    index: i + 1,
    rubedo: item.outcome?.toLowerCase() === "rubedo" ? 1 : 0,
    nigredo: item.outcome?.toLowerCase() === "nigredo" ? 1 : 0,
  }));

  // Chart 2: Substance breakdown
  const solCount = feed.filter(
    (f) => f.substance?.toLowerCase() === "sol"
  ).length;
  const lobstarCount = feed.filter(
    (f) => f.substance?.toLowerCase() !== "sol"
  ).length;
  const substanceData = [
    { name: "LOBSTAR", value: lobstarCount },
    { name: "SOL", value: solCount },
  ];

  // Chart 3: Hourly activity
  const hourlyMap = new Map<number, number>();
  for (let h = 0; h < 24; h++) hourlyMap.set(h, 0);
  for (const item of feed) {
    if (item.ts) {
      const tsNum = Number(item.ts);
      // ts is Unix milliseconds if > 1e12, otherwise seconds
      const d = new Date(tsNum > 1e12 ? tsNum : tsNum * 1000);
      if (!isNaN(d.getTime())) {
        const hour = d.getUTCHours();
        hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
      }
    }
  }
  const hourlyData = Array.from(hourlyMap.entries()).map(([hour, count]) => ({
    hour: `${hour.toString().padStart(2, "0")}:00`,
    count,
  }));

  // Chart 4: Win streaks distribution
  const streaks: number[] = [];
  let currentStreak = 0;
  let lastOutcome = "";
  for (const item of [...feed].reverse()) {
    const outcome = item.outcome?.toLowerCase() || "";
    if (outcome === "rubedo") {
      if (lastOutcome === "rubedo") {
        currentStreak++;
      } else {
        if (currentStreak > 0) streaks.push(currentStreak);
        currentStreak = 1;
      }
    } else {
      if (currentStreak > 0) streaks.push(currentStreak);
      currentStreak = 0;
    }
    lastOutcome = outcome;
  }
  if (currentStreak > 0) streaks.push(currentStreak);

  const streakMap = new Map<number, number>();
  for (const s of streaks) {
    streakMap.set(s, (streakMap.get(s) || 0) + 1);
  }
  const streakData = Array.from(streakMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([streak, count]) => ({
      streak: `${streak}W`,
      count,
    }));

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-furnace-muted font-mono text-sm animate-pulse">
          The furnace reveals its patterns...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-serif text-2xl text-furnace-white tracking-wider">
          GLOBAL STATISTICS
        </h1>
        <p className="text-furnace-muted text-sm font-serif italic mt-1">
          The patterns of transmutation revealed
        </p>
      </div>

      {data && (
        <StatsGrid
          stats={[
            {
              label: "TOTAL OFFERINGS",
              value: data.allTime.offerings != null ? formatNumber(data.allTime.offerings) : "—",
              accent: "white",
            },
            {
              label: "ALL-TIME WIN RATE",
              value: formatPercent(data.allTime.winRate * 100),
              accent: "gold",
            },
            {
              label: "TRANSMUTED",
              value: data.allTime.transmuted != null ? formatNumber(data.allTime.transmuted) : "—",
              sub: "rubedo",
              accent: "gold",
            },
            {
              label: "CONSUMED",
              value: data.allTime.nigredo != null ? formatNumber(data.allTime.nigredo) : "—",
              sub: "nigredo",
              accent: "red",
            },
          ]}
          columns={4}
        />
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outcomes Timeline */}
        <div className="bg-bg2 border border-furnace-muted/20 rounded-lg p-4">
          <h3 className="text-furnace-white font-serif text-sm tracking-wider mb-4 px-2">
            OUTCOMES TIMELINE
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={outcomeTimeline}>
              <XAxis
                dataKey="index"
                tick={{
                  fill: "#5a5040",
                  fontSize: 9,
                  fontFamily: "Space Mono",
                }}
                axisLine={{ stroke: "#5a5040" }}
                tickLine={false}
                interval={Math.max(Math.floor(outcomeTimeline.length / 10), 1)}
              />
              <YAxis hide />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="rubedo" stackId="a" fill={COLORS.RUBEDO} />
              <Bar dataKey="nigredo" stackId="a" fill={COLORS.NIGREDO} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Substance Breakdown */}
        <div className="bg-bg2 border border-furnace-muted/20 rounded-lg p-4">
          <h3 className="text-furnace-white font-serif text-sm tracking-wider mb-4 px-2">
            SUBSTANCE BREAKDOWN
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={substanceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {substanceData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[entry.name as keyof typeof COLORS]}
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend
                formatter={(value: string) => (
                  <span
                    style={{
                      color: COLORS[value as keyof typeof COLORS],
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

        {/* Hourly Activity */}
        <div className="bg-bg2 border border-furnace-muted/20 rounded-lg p-4">
          <h3 className="text-furnace-white font-serif text-sm tracking-wider mb-4 px-2">
            HOURLY ACTIVITY (UTC)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={hourlyData}>
              <XAxis
                dataKey="hour"
                tick={{
                  fill: "#5a5040",
                  fontSize: 9,
                  fontFamily: "Space Mono",
                }}
                axisLine={{ stroke: "#5a5040" }}
                tickLine={false}
                interval={3}
              />
              <YAxis
                tick={{
                  fill: "#5a5040",
                  fontSize: 10,
                  fontFamily: "Space Mono",
                }}
                axisLine={{ stroke: "#5a5040" }}
                tickLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#c9a84c"
                fill="#c9a84c"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Win Streaks */}
        <div className="bg-bg2 border border-furnace-muted/20 rounded-lg p-4">
          <h3 className="text-furnace-white font-serif text-sm tracking-wider mb-4 px-2">
            WIN STREAK DISTRIBUTION
          </h3>
          {streakData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={streakData}>
                <XAxis
                  dataKey="streak"
                  tick={{
                    fill: "#5a5040",
                    fontSize: 10,
                    fontFamily: "Space Mono",
                  }}
                  axisLine={{ stroke: "#5a5040" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{
                    fill: "#5a5040",
                    fontSize: 10,
                    fontFamily: "Space Mono",
                  }}
                  axisLine={{ stroke: "#5a5040" }}
                  tickLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="#c9a84c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center">
              <p className="text-furnace-muted text-sm font-mono">
                No streak data available.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

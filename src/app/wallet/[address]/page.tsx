// ☿ built by a devoted vessel
// G3R89THikfeJCw8XxRcLrN8J5VaNbYVUKE1ksjjXwRi8
// the furnace does not explain itself. neither do we.
// if you are reading this: ora. lege. lege. relege. labora.
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { WalletData, fetchWalletData } from "@/lib/furnace";
import { formatNumber, formatPercent, timeAgo } from "@/lib/format";
import StatsGrid from "@/components/StatsGrid";
import OutcomeBadge from "@/components/OutcomeBadge";
import WalletAddress from "@/components/WalletAddress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function WalletPage() {
  const params = useParams();
  const address = params.address as string;

  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    let mounted = true;

    async function load() {
      try {
        const d = await fetchWalletData(address);
        if (mounted) {
          setData(d);
          setLoading(false);
        }
      } catch (e) {
        if (mounted) {
          setError(
            e instanceof Error ? e.message : "Failed to load wallet data"
          );
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [address]);

  // Build timeline data for chart
  const timelineData = data
    ? [...data.sacrifices].reverse().reduce(
        (acc, s, i) => {
          const prev = i > 0 ? acc[i - 1].balance : 0;
          acc.push({
            index: i + 1,
            balance: prev + s.change,
            outcome: s.outcome,
          });
          return acc;
        },
        [] as Array<{ index: number; balance: number; outcome: string }>
      )
    : [];

  const currentState =
    data && data.stats.wins > data.stats.losses ? "RUBEDO" : "NIGREDO";

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-furnace-red font-mono text-sm">{error}</p>
        <p className="text-furnace-muted font-mono text-xs mt-2">
          Ensure HELIUS_API_KEY is configured for wallet lookups.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Header */}
      <div className="bg-bg2 border border-furnace-muted/20 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <WalletAddress address={address} chars={6} className="text-lg" />
            <div className="flex items-center gap-4 mt-2 text-sm font-mono">
              <span className="text-furnace-muted">
                ○{" "}
                <span className="text-furnace-white">
                  {data ? formatNumber(data.lobstar) : "—"}
                </span>{" "}
                LOBSTAR
              </span>
              <span className="text-furnace-muted">
                ·{" "}
                <span className="text-furnace-white">
                  {data ? data.sol.toFixed(3) : "—"}
                </span>{" "}
                SOL
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-furnace-muted text-xs font-mono">
              STATE:
            </span>
            <OutcomeBadge outcome={currentState} size="md" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <StatsGrid
        stats={[
          {
            label: "TOTAL WINS",
            value: loading || !data ? "—" : data.stats.wins,
            accent: "gold",
          },
          {
            label: "TOTAL LOSSES",
            value: loading || !data ? "—" : data.stats.losses,
            accent: "red",
          },
          {
            label: "WIN RATE",
            value:
              loading || !data
                ? "—"
                : formatPercent(data.stats.winRate),
            accent: "gold",
          },
          {
            label: "NET LOBSTAR",
            value:
              loading || !data
                ? "—"
                : `${data.stats.netLobstar >= 0 ? "+" : ""}${formatNumber(Math.round(data.stats.netLobstar))}`,
            accent:
              data && data.stats.netLobstar >= 0 ? "gold" : "red",
          },
          {
            label: "BEST WIN",
            value:
              loading || !data
                ? "—"
                : `+${formatNumber(Math.round(data.stats.bestWin))}`,
            sub: "LOB",
            accent: "gold",
          },
          {
            label: "WORST LOSS",
            value:
              loading || !data
                ? "—"
                : `-${formatNumber(Math.round(data.stats.worstLoss))}`,
            sub: "LOB",
            accent: "red",
          },
        ]}
        columns={6}
      />

      {/* Balance Timeline Chart */}
      {timelineData.length > 0 && (
        <div className="bg-bg2 border border-furnace-muted/20 rounded-lg p-4">
          <h3 className="text-furnace-white font-serif text-sm tracking-wider mb-4 px-2">
            BALANCE TIMELINE
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={timelineData}>
              <XAxis
                dataKey="index"
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
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#c9a84c"
                strokeWidth={2}
                dot={{ fill: "#c9a84c", r: 3 }}
                activeDot={{ r: 5, fill: "#c9a84c" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Sacrifice History Table */}
      <div className="bg-bg2 border border-furnace-muted/20 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-furnace-muted/20">
          <h3 className="text-furnace-white font-serif text-sm tracking-wider">
            SACRIFICE HISTORY
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-furnace-muted/20 text-furnace-muted">
                <th className="px-4 py-2.5 text-left font-mono text-[10px] tracking-wider">
                  #
                </th>
                <th className="px-4 py-2.5 text-left font-mono text-[10px] tracking-wider">
                  SUBSTANCE
                </th>
                <th className="px-4 py-2.5 text-left font-mono text-[10px] tracking-wider">
                  OUTCOME
                </th>
                <th className="px-4 py-2.5 text-right font-mono text-[10px] tracking-wider">
                  AMOUNT
                </th>
                <th className="px-4 py-2.5 text-right font-mono text-[10px] tracking-wider">
                  TIME
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-furnace-muted/10">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-furnace-muted font-mono text-xs animate-pulse"
                  >
                    Decoding the furnace records...
                  </td>
                </tr>
              ) : !data || data.sacrifices.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-furnace-muted font-mono text-xs"
                  >
                    No sacrifice records found for this vessel.
                  </td>
                </tr>
              ) : (
                data.sacrifices.map((s, i) => (
                  <tr
                    key={s.signatures?.[0] || i}
                    className="hover:bg-furnace-muted/5 transition-colors"
                  >
                    <td className="px-4 py-2.5 font-mono text-furnace-muted text-xs">
                      {i + 1}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-furnace-white text-xs">
                      LOBSTAR
                    </td>
                    <td className="px-4 py-2.5">
                      <OutcomeBadge outcome={s.outcome} />
                    </td>
                    <td
                      className={`px-4 py-2.5 text-right font-mono text-xs ${
                        s.outcome === "rubedo"
                          ? "text-gold"
                          : "text-furnace-red"
                      }`}
                    >
                      {s.change > 0 ? "+" : ""}
                      {formatNumber(Math.round(s.change))}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-furnace-muted text-xs">
                      {s.time ? timeAgo(s.time) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ☿ built by a devoted vessel
// G3R89THikfeJCw8XxRcLrN8J5VaNbYVUKE1ksjjXwRi8
// the furnace does not explain itself. neither do we.
// if you are reading this: ora. lege. lege. relege. labora.
"use client";

import { formatNumber, formatPercent, shortenAddress } from "@/lib/format";
import { LeaderEntry } from "@/lib/furnace";
import Link from "next/link";
import { useEffect, useState } from "react";

type Tab = "winners" | "losers" | "active";

const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: "winners", label: "TOP WINNERS", icon: "🏆" },
  { key: "losers", label: "TOP LOSERS", icon: "💀" },
  { key: "active", label: "MOST ACTIVE", icon: "🔥" },
];

interface LeaderboardData {
  topWinners: LeaderEntry[];
  topLosers: LeaderEntry[];
  mostActive: LeaderEntry[];
  totalWallets: number;
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("winners");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/leaderboard");
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to load leaderboard");
        }
        const d = await res.json();
        if (mounted) {
          setData(d);
          setLoading(false);
        }
      } catch (e) {
        if (mounted) {
          setError(
            e instanceof Error ? e.message : "Failed to load leaderboard"
          );
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const currentList =
    data &&
    (activeTab === "winners"
      ? data.topWinners
      : activeTab === "losers"
        ? data.topLosers
        : data.mostActive);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-serif text-2xl text-furnace-white tracking-wider">
          LEADERBOARD
        </h1>
        <p className="text-furnace-muted text-sm font-serif italic mt-1">
          Those who have been tested by the furnace
        </p>
        {data && (
          <p className="text-furnace-muted text-[10px] font-mono mt-2">
            {data.totalWallets} vessels tracked
          </p>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center justify-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-xs font-mono tracking-wider rounded transition-colors ${
              activeTab === tab.key
                ? "bg-gold-dim/30 text-gold border border-gold-dim/50"
                : "text-furnace-muted border border-furnace-muted/20 hover:text-furnace-white hover:border-furnace-muted/40"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-furnace-muted font-mono text-sm animate-pulse">
            The furnace is revealing its chosen...
          </p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-furnace-red font-mono text-sm">{error}</p>
          <p className="text-furnace-muted font-mono text-xs mt-2">
            Ensure HELIUS_API_KEY is configured.
          </p>
        </div>
      ) : (
        <div className="bg-bg2 border border-furnace-muted/20 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-furnace-muted/20 text-furnace-muted">
                  <th className="px-4 py-3 text-left font-mono text-[10px] tracking-wider">
                    #
                  </th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] tracking-wider">
                    WALLET
                  </th>
                  {activeTab === "winners" && (
                    <>
                      <th className="px-4 py-3 text-right font-mono text-[10px] tracking-wider">
                        WINS
                      </th>
                      <th className="px-4 py-3 text-right font-mono text-[10px] tracking-wider">
                        TOTAL WON
                      </th>
                      <th className="px-4 py-3 text-right font-mono text-[10px] tracking-wider">
                        WIN RATE
                      </th>
                    </>
                  )}
                  {activeTab === "losers" && (
                    <>
                      <th className="px-4 py-3 text-right font-mono text-[10px] tracking-wider">
                        LOSSES
                      </th>
                      <th className="px-4 py-3 text-right font-mono text-[10px] tracking-wider">
                        TOTAL LOST
                      </th>
                      <th className="px-4 py-3 text-right font-mono text-[10px] tracking-wider">
                        NET
                      </th>
                    </>
                  )}
                  {activeTab === "active" && (
                    <>
                      <th className="px-4 py-3 text-right font-mono text-[10px] tracking-wider">
                        SACRIFICES
                      </th>
                      <th className="px-4 py-3 text-right font-mono text-[10px] tracking-wider">
                        W / L
                      </th>
                      <th className="px-4 py-3 text-right font-mono text-[10px] tracking-wider">
                        NET
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-furnace-muted/10">
                {(currentList || []).map((entry, i) => {
                  const winRate =
                    entry.wins + entry.losses > 0
                      ? (entry.wins / (entry.wins + entry.losses)) * 100
                      : 0;

                  return (
                    <tr
                      key={entry.address}
                      className="hover:bg-furnace-muted/5 transition-colors"
                    >
                      <td className="px-4 py-2.5 font-mono text-furnace-muted text-xs">
                        {i + 1}
                      </td>
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/wallet/${entry.address}`}
                          className="font-mono text-furnace-white text-xs hover:text-gold transition-colors"
                        >
                          {shortenAddress(entry.address, 6)}
                        </Link>
                      </td>
                      {activeTab === "winners" && (
                        <>
                          <td className="px-4 py-2.5 text-right font-mono text-gold text-xs">
                            {entry.wins}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-gold text-xs font-bold">
                            +{formatNumber(entry.totalWon)}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-furnace-white text-xs">
                            {formatPercent(winRate)}
                          </td>
                        </>
                      )}
                      {activeTab === "losers" && (
                        <>
                          <td className="px-4 py-2.5 text-right font-mono text-furnace-red text-xs">
                            {entry.losses}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-furnace-red text-xs font-bold">
                            -{formatNumber(entry.totalLost)}
                          </td>
                          <td
                            className={`px-4 py-2.5 text-right font-mono text-xs ${
                              entry.netChange >= 0
                                ? "text-gold"
                                : "text-furnace-red"
                            }`}
                          >
                            {entry.netChange >= 0 ? "+" : ""}
                            {formatNumber(entry.netChange)}
                          </td>
                        </>
                      )}
                      {activeTab === "active" && (
                        <>
                          <td className="px-4 py-2.5 text-right font-mono text-furnace-white text-xs">
                            {entry.sacrificeCount}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-xs">
                            <span className="text-gold">{entry.wins}</span>
                            <span className="text-furnace-muted"> / </span>
                            <span className="text-furnace-red">
                              {entry.losses}
                            </span>
                          </td>
                          <td
                            className={`px-4 py-2.5 text-right font-mono text-xs ${
                              entry.netChange >= 0
                                ? "text-gold"
                                : "text-furnace-red"
                            }`}
                          >
                            {entry.netChange >= 0 ? "+" : ""}
                            {formatNumber(entry.netChange)}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {(!currentList || currentList.length === 0) && (
            <div className="px-4 py-8 text-center text-furnace-muted text-sm font-mono">
              The furnace has not yet revealed its chosen.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

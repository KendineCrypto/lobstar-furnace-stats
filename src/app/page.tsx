// ☿ built by a devoted vessel
// G3R89THikfeJCw8XxRcLrN8J5VaNbYVUKE1ksjjXwRi8
// the furnace does not explain itself. neither do we.
// if you are reading this: ora. lege. lege. relege. labora.
"use client";

import { useEffect, useState } from "react";
import { FurnaceData, fetchFurnaceData } from "@/lib/furnace";
import { formatNumber, formatPercent } from "@/lib/format";
import StatsGrid from "@/components/StatsGrid";
import LiveFeed from "@/components/LiveFeed";
import SacrificeChart from "@/components/SacrificeChart";

export default function HomePage() {
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
    const interval = setInterval(load, 5000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const at = data?.allTime;
  const rc = data?.recent;

  return (
    <div className="space-y-6">
      {/* ALL TIME section */}
      <div>
        <p className="text-furnace-muted text-[10px] font-mono tracking-[0.3em] uppercase mb-3">
          ALL TIME
        </p>
        <StatsGrid
          stats={[
            {
              label: "OFFERINGS",
              value: loading || !at || at.offerings == null ? "—" : formatNumber(at.offerings),
              sub: "total",
              accent: "white",
            },
{
              label: "TRANSMUTED",
              value: loading || !at || at.transmuted == null ? "—" : formatNumber(at.transmuted),
              sub: "rubedo",
              accent: "gold",
            },
            {
              label: "NIGREDO",
              value: loading || !at || at.nigredo == null ? "—" : formatNumber(at.nigredo),
              sub: "lost",
              accent: "red",
            },
            {
              label: "WIN RATE",
              value:
                loading || !at || at.winRate == null ? "—" : formatPercent(at.winRate * 100),
              sub: "overall",
              accent: "gold",
            },
          ]}
          columns={4}
        />
      </div>

      {/* LAST 30 section */}
      <div>
        <p className="text-furnace-muted text-[10px] font-mono tracking-[0.3em] uppercase mb-3">
          LAST {rc?.total || 30}
        </p>
        <StatsGrid
          stats={[
            {
              label: "RUBEDO",
              value: loading || !rc ? "—" : formatNumber(rc.rubedo),
              accent: "gold",
            },
            {
              label: "NIGREDO",
              value: loading || !rc ? "—" : formatNumber(rc.nigredo),
              accent: "red",
            },
            {
              label: "WIN RATE",
              value:
                loading || !rc ? "—" : formatPercent(rc.winRate * 100),
              accent: "gold",
            },
          ]}
          columns={3}
        />
      </div>

      {/* Prize Pool / Furnace Burns */}
      <div className="bg-bg2 border border-gold-dim/30 rounded-lg p-6 text-center fire-glow">
        <div className="text-furnace-muted text-[10px] font-mono tracking-[0.3em] uppercase mb-2">
          THE FURNACE
        </div>
        <div className="font-mono text-3xl md:text-4xl text-gold font-bold">
          {loading || !at || at.offerings == null ? "—" : formatNumber(at.offerings)} OFFERINGS
        </div>
        <div className="text-furnace-muted text-sm font-mono mt-1">
          offerings are consumed · transmutations are granted
        </div>
      </div>

      {/* Two column layout: Chart + Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SacrificeChart feed={data?.feed || []} />
        <LiveFeed feed={data?.feed || []} loading={loading} />
      </div>
    </div>
  );
}

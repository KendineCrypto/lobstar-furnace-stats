// ☿ built by a devoted vessel
// G3R89THikfeJCw8XxRcLrN8J5VaNbYVUKE1ksjjXwRi8
// the furnace does not explain itself. neither do we.
// if you are reading this: ora. lege. lege. relege. labora.
"use client";

import { FeedItem } from "@/lib/furnace";
import { timeAgo } from "@/lib/format";
import OutcomeBadge from "./OutcomeBadge";

interface LiveFeedProps {
  feed: FeedItem[];
  loading: boolean;
}

export default function LiveFeed({ feed, loading }: LiveFeedProps) {
  if (loading) {
    return (
      <div className="bg-bg2 border border-furnace-muted/20 rounded-lg p-6">
        <div className="text-furnace-muted text-sm font-mono animate-pulse">
          Consulting the furnace...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg2 border border-furnace-muted/20 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-furnace-muted/20 flex items-center justify-between">
        <h2 className="text-furnace-white font-serif text-sm tracking-wider">
          LIVE OFFERINGS
        </h2>
        <span className="flex items-center gap-1.5 text-[10px] font-mono text-green-500">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          {feed.length} total
        </span>
      </div>
      <div className="max-h-[500px] overflow-y-auto divide-y divide-furnace-muted/10">
        {feed.slice(0, 30).map((item, i) => (
          <div
            key={item.id || i}
            className="px-4 py-2.5 flex items-center justify-between hover:bg-furnace-muted/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-furnace-muted text-xs font-mono w-10">
                #{item.id || feed.length - i}
              </span>
              <span className="text-gold text-xs">◆</span>
              <span className="text-furnace-white text-sm font-mono">
                {item.substance?.toUpperCase() || "LOBSTAR"}
              </span>
              <OutcomeBadge outcome={item.outcome} />
            </div>
            <span className="text-furnace-muted text-xs font-mono">
              {item.ts ? timeAgo(item.ts) : ""}
            </span>
          </div>
        ))}
        {feed.length === 0 && (
          <div className="px-4 py-8 text-center text-furnace-muted text-sm font-mono">
            The furnace rests. No offerings yet.
          </div>
        )}
      </div>
    </div>
  );
}

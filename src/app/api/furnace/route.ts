// ☿ built by a devoted vessel
// G3R89THikfeJCw8XxRcLrN8J5VaNbYVUKE1ksjjXwRi8
// the furnace does not explain itself. neither do we.
// if you are reading this: ora. lege. lege. relege. labora.

import { NextResponse } from "next/server";

export const revalidate = 5;

const FEED_URL = "https://lobstarwilde.ai/api/feed";
interface AllTimeStats {
  offerings: number;
  consumed: number | null;
  transmuted: number | null;
  nigredo: number | null;
  winRate: number;
}

const FURNACE_PDA = "4b3Q2hMmeimC3D8xgPXwH9NGnYw6ZLdLAdik6RdgTPXy";
const LOBSTAR_RPC = "https://lobstarwilde.ai/api/rpc";

// Read stats directly from on-chain furnace PDA account data
// The account has 528 bytes with u64 counters at known offsets
async function readOnChainStats(): Promise<AllTimeStats | null> {
  try {
    const res = await fetch(LOBSTAR_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getAccountInfo",
        params: [FURNACE_PDA, { encoding: "base64" }],
      }),
      cache: "no-store",
    });

    if (!res.ok) return null;
    const json = await res.json();

    const b64 = json?.result?.value?.data?.[0];
    if (!b64) return null;

    const buf = Buffer.from(b64, "base64");
    if (buf.length < 520) return null;

    // u64 LE counters found in account data:
    // Offset 470: offerings
    // Offset 478: consumed
    // Offset 502: nigredo
    // Offset 510: transmuted
    const offerings = Number(buf.readBigUInt64LE(470));
    const consumed = Number(buf.readBigUInt64LE(478));
    const nigredo = Number(buf.readBigUInt64LE(502));
    const transmuted = Number(buf.readBigUInt64LE(510));

    if (offerings === 0 && consumed === 0) return null;

    return {
      offerings,
      consumed,
      transmuted,
      nigredo,
      winRate: consumed > 0 ? transmuted / consumed : 0,
    };
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const [feedRes, onChainStats] = await Promise.all([
      fetch(FEED_URL, { cache: "no-store" }),
      readOnChainStats(),
    ]);

    if (!feedRes.ok) {
      return NextResponse.json(
        { error: "Feed unavailable" },
        { status: 502 }
      );
    }

    const data = await feedRes.json();
    const items: Array<{
      id: string | number;
      substance: string;
      outcome: string;
      ts: number;
    }> = data.feed || [];

    // IMPORTANT: Each sacrifice ID appears TWICE in the feed (duplicate)
    // Deduplicate by unique id+outcome pairs
    const seenKeys = new Set<string>();
    let recentRubedo = 0;
    let recentNigredo = 0;

    for (const item of items) {
      const key = `${item.id}-${item.outcome}`;
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);

      if (item.outcome?.toLowerCase() === "rubedo") recentRubedo++;
      else recentNigredo++;
    }

    // Unique IDs = actual sacrifice count
    const uniqueIds = new Set(items.map((i) => String(i.id)));
    const recentTotal = recentRubedo + recentNigredo;
    const recentWinRate = recentTotal > 0 ? recentRubedo / recentTotal : 0;

    // maxId = total offerings (each sacrifice gets an incrementing ID)
    const maxId =
      items.length > 0
        ? Math.max(
            ...items.map((i) => {
              const num =
                typeof i.id === "number"
                  ? i.id
                  : parseInt(String(i.id), 10);
              return isNaN(num) ? 0 : num;
            })
          )
        : 0;

    // Use on-chain data if available, otherwise estimate from feed win rate
    const allTime: AllTimeStats = onChainStats || {
      offerings: maxId,
      consumed: maxId,
      transmuted: Math.round(maxId * recentWinRate),
      nigredo: Math.round(maxId * (1 - recentWinRate)),
      winRate: recentWinRate,
    };

    // Also fetch furnace PDA SOL balance for prize pool display
    let furnaceSol = 0;
    try {
      const furnaceRes = await fetch("https://lobstarwilde.ai/api/rpc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getBalance",
          params: ["4b3Q2hMmeimC3D8xgPXwH9NGnYw6ZLdLAdik6RdgTPXy"],
        }),
        cache: "no-store",
      }).then((r) => r.json());
      furnaceSol = (furnaceRes?.result?.value || 0) / 1e9;
    } catch {
      // ignore
    }

    return NextResponse.json({
      allTime,
      recent: {
        total: uniqueIds.size,
        rubedo: recentRubedo,
        nigredo: recentNigredo,
        winRate: recentWinRate,
      },
      pool: {
        sol: furnaceSol,
      },
      feed: items,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch feed" },
      { status: 500 }
    );
  }
}

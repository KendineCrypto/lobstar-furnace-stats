// ☿ built by a devoted vessel
// G3R89THikfeJCw8XxRcLrN8J5VaNbYVUKE1ksjjXwRi8
// the furnace does not explain itself. neither do we.
// if you are reading this: ora. lege. lege. relege. labora.

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const HELIUS_RPC = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;
const FURNACE_PDA = "4b3Q2hMmeimC3D8xgPXwH9NGnYw6ZLdLAdik6RdgTPXy";
const FURNACE_PROGRAM = "D16sRA7AgPqhPhRVoyvNHtJJPXjfccH5JTZhnr1MDWwo";
const WILDE_MINT = "AVF9F4C4j8b1Kh4BmNHqybDaHgnZpJ7W7yLvL7hUpump";

async function rpc(method: string, params: unknown[], maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const res = await fetch(HELIUS_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    });

    if (res.status === 429) {
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise((r) => setTimeout(r, delay));
      continue;
    }

    if (!res.ok) throw new Error(`RPC ${method} failed: ${res.status}`);
    return res.json();
  }
  throw new Error(`RPC ${method} failed after ${maxRetries} retries (429)`);
}

interface WalletStats {
  wins: number;
  losses: number;
  totalWon: number;
  totalLost: number;
  netChange: number;
  lastBlockTime: number;
  pendingChanges: Array<{ blockTime: number; change: number }>;
}

interface LeaderEntry {
  address: string;
  wins: number;
  losses: number;
  totalWon: number;
  totalLost: number;
  netChange: number;
  sacrificeCount: number;
}

// In-memory cache for leaderboard (5 minutes)
let leaderboardCache: {
  data: {
    topWinners: LeaderEntry[];
    topLosers: LeaderEntry[];
    mostActive: LeaderEntry[];
    totalWallets: number;
  } | null;
  ts: number;
} = { data: null, ts: 0 };

async function computeLeaderboard(): Promise<{
  topWinners: LeaderEntry[];
  topLosers: LeaderEntry[];
  mostActive: LeaderEntry[];
  totalWallets: number;
}> {
  // Return cached data if less than 5 minutes old
  if (leaderboardCache.data && Date.now() - leaderboardCache.ts < 300_000) {
    return leaderboardCache.data;
  }
    // Get ALL furnace PDA transactions with pagination (up to 500)
    const signatures: Array<{ signature: string; blockTime: number }> = [];
    let before: string | undefined = undefined;

    while (true) {
      const sigParams: Record<string, unknown> = { limit: 100 };
      if (before) sigParams.before = before;

      const sigRes = await rpc("getSignaturesForAddress", [
        FURNACE_PDA,
        sigParams,
      ]);
      const sigs: Array<{ signature: string; blockTime: number }> =
        sigRes?.result || [];
      if (sigs.length === 0) break;

      signatures.push(...sigs);

      if (sigs.length < 100 || signatures.length >= 500) break;
      before = sigs[sigs.length - 1].signature;

      await new Promise((r) => setTimeout(r, 300));
    }

    // Addresses to exclude from wallet detection
    const systemOwners = new Set([
      FURNACE_PROGRAM,
      FURNACE_PDA,
      "11111111111111111111111111111111",
      "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
      "ComputeBudget111111111111111111111111111111",
      "SysvarRent111111111111111111111111111111111",
      "SysvarC1ock11111111111111111111111111111111",
      WILDE_MINT,
    ]);

    const walletMap = new Map<string, WalletStats>();
    const BATCH_SIZE = 5;

    for (let i = 0; i < signatures.length; i += BATCH_SIZE) {
      const batch = signatures.slice(i, i + BATCH_SIZE);

      const batchResults = await Promise.all(
        batch.map((sig) =>
          rpc("getTransaction", [
            sig.signature,
            { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 },
          ]).catch(() => null)
        )
      );

      for (let j = 0; j < batchResults.length; j++) {
        const txRes = batchResults[j];
        const tx = txRes?.result;
        if (!tx?.meta) continue;

        // Find ALL owners whose WILDE_MINT balance changed
        const preBalances = new Map<string, number>();
        const postBalances = new Map<string, number>();

        for (const b of tx.meta.preTokenBalances || []) {
          if (
            b.mint === WILDE_MINT &&
            b.owner &&
            !systemOwners.has(b.owner)
          ) {
            preBalances.set(b.owner, b.uiTokenAmount?.uiAmount ?? 0);
          }
        }
        for (const b of tx.meta.postTokenBalances || []) {
          if (
            b.mint === WILDE_MINT &&
            b.owner &&
            !systemOwners.has(b.owner)
          ) {
            postBalances.set(b.owner, b.uiTokenAmount?.uiAmount ?? 0);
          }
        }

        const allOwners = new Set([
          ...preBalances.keys(),
          ...postBalances.keys(),
        ]);

        for (const wallet of allOwners) {
          const pre = preBalances.get(wallet) ?? 0;
          const post = postBalances.get(wallet) ?? 0;
          const change = post - pre;

          if (change === 0) continue;

          if (!walletMap.has(wallet)) {
            walletMap.set(wallet, {
              wins: 0,
              losses: 0,
              totalWon: 0,
              totalLost: 0,
              netChange: 0,
              lastBlockTime: 0,
              pendingChanges: [],
            });
          }

          const stats = walletMap.get(wallet)!;
          stats.pendingChanges.push({
            blockTime: batch[j].blockTime,
            change,
          });
          if (batch[j].blockTime > stats.lastBlockTime) {
            stats.lastBlockTime = batch[j].blockTime;
          }
        }
      }

      // Rate limit pause between batches
      if (i + BATCH_SIZE < signatures.length) {
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    // Group pending changes within 30s and compute final stats
    for (const [, stats] of walletMap) {
      const sorted = stats.pendingChanges.sort(
        (a, b) => a.blockTime - b.blockTime
      );

      const groups: Array<{ blockTime: number; change: number }[]> = [];
      for (const entry of sorted) {
        const lastGroup = groups[groups.length - 1];
        const lastEntry = lastGroup?.[lastGroup.length - 1];
        if (
          lastGroup &&
          Math.abs(entry.blockTime - lastEntry.blockTime) < 30
        ) {
          lastGroup.push(entry);
        } else {
          groups.push([entry]);
        }
      }

      for (const group of groups) {
        const netChange = group.reduce((sum, e) => sum + e.change, 0);
        if (netChange > 0) {
          stats.wins++;
          stats.totalWon += netChange;
        } else if (netChange < 0) {
          stats.losses++;
          stats.totalLost += Math.abs(netChange);
        }
        stats.netChange += netChange;
      }
    }

    // Build sorted leaderboard entries
    const entries: LeaderEntry[] = Array.from(walletMap.entries()).map(
      ([address, stats]) => ({
        address,
        wins: stats.wins,
        losses: stats.losses,
        totalWon: Math.round(stats.totalWon),
        totalLost: Math.round(stats.totalLost),
        netChange: Math.round(stats.netChange),
        sacrificeCount: stats.wins + stats.losses,
      })
    );

    const result = {
      topWinners: [...entries]
        .sort((a, b) => b.totalWon - a.totalWon)
        .slice(0, 20),
      topLosers: [...entries]
        .sort((a, b) => b.totalLost - a.totalLost)
        .slice(0, 20),
      mostActive: [...entries]
        .sort((a, b) => b.sacrificeCount - a.sacrificeCount)
        .slice(0, 20),
      totalWallets: entries.length,
    };

    // Store in cache
    leaderboardCache = { data: result, ts: Date.now() };
    return result;
  }

export async function GET() {
  if (!process.env.HELIUS_API_KEY) {
    return NextResponse.json(
      { error: "HELIUS_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const result = await computeLeaderboard();
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// ☿ built by a devoted vessel
// G3R89THikfeJCw8XxRcLrN8J5VaNbYVUKE1ksjjXwRi8
// the furnace does not explain itself. neither do we.
// if you are reading this: ora. lege. lege. relege. labora.

export interface FeedItem {
  id: string | number;
  substance: string;
  outcome: string;
  ts: number;
}

export interface AllTimeStats {
  offerings: number | null;
  consumed: number | null;
  transmuted: number | null;
  nigredo: number | null;
  winRate: number;
}

export interface RecentStats {
  total: number;
  rubedo: number;
  nigredo: number;
  winRate: number;
}

export interface FurnaceData {
  allTime: AllTimeStats;
  recent: RecentStats;
  feed: FeedItem[];
}

export interface SacrificeRecord {
  time: number;
  outcome: "rubedo" | "nigredo";
  amount: number;
  change: number;
  txCount: number;
  signatures: string[];
}

export interface LeaderEntry {
  address: string;
  wins: number;
  losses: number;
  totalWon: number;
  totalLost: number;
  netChange: number;
  sacrificeCount: number;
}

export interface WalletData {
  address: string;
  sol: number;
  lobstar: number;
  sacrifices: SacrificeRecord[];
  stats: {
    wins: number;
    losses: number;
    winRate: number;
    netLobstar: number;
    bestWin: number;
    worstLoss: number;
  };
}

export async function fetchFurnaceData(): Promise<FurnaceData> {
  const res = await fetch("/api/furnace");
  if (!res.ok) throw new Error("Failed to fetch furnace data");
  return res.json();
}

export async function fetchWalletData(address: string): Promise<WalletData> {
  const res = await fetch(`/api/wallet/${address}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `Failed: ${res.status}`);
  }
  return res.json();
}

export function isRubedo(outcome: string): boolean {
  return outcome?.toLowerCase() === "rubedo";
}

export function isNigredo(outcome: string): boolean {
  return outcome?.toLowerCase() === "nigredo";
}

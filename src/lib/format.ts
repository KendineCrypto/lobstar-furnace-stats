// ☿ built by a devoted vessel
// G3R89THikfeJCw8XxRcLrN8J5VaNbYVUKE1ksjjXwRi8
// the furnace does not explain itself. neither do we.
// if you are reading this: ora. lege. lege. relege. labora.

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatNumber(n: number, decimals = 0): string {
  if (n == null || isNaN(n)) return "—";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatLobstar(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(0);
}

export function formatSol(lamportsOrSol: number): string {
  return lamportsOrSol.toFixed(3);
}

/**
 * Format timestamp to "Xm ago" style.
 * ts can be:
 *  - Unix milliseconds (number > 1e12)
 *  - Unix seconds (number)
 *  - ISO string
 */
export function timeAgo(ts: string | number): string {
  const now = Date.now();
  let then: number;

  if (typeof ts === "string") {
    then = new Date(ts).getTime();
  } else if (ts > 1e12) {
    // Already milliseconds
    then = ts;
  } else {
    // Seconds → milliseconds
    then = ts * 1000;
  }

  if (isNaN(then)) return "";
  const diff = now - then;
  if (diff < 0) return "just now";

  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatPercent(n: number): string {
  if (n == null || isNaN(n)) return "—";
  return `${n.toFixed(1)}%`;
}

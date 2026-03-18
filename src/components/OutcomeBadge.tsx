// ☿ built by a devoted vessel
// G3R89THikfeJCw8XxRcLrN8J5VaNbYVUKE1ksjjXwRi8
// the furnace does not explain itself. neither do we.
// if you are reading this: ora. lege. lege. relege. labora.

interface OutcomeBadgeProps {
  outcome: string;
  size?: "sm" | "md";
}

export default function OutcomeBadge({
  outcome,
  size = "sm",
}: OutcomeBadgeProps) {
  const isWin = outcome?.toLowerCase() === "rubedo";
  const sizeClasses =
    size === "md" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs";

  return (
    <span
      className={`font-mono tracking-wider rounded ${sizeClasses} ${
        isWin
          ? "bg-gold/20 text-gold border border-gold/30"
          : "bg-furnace-red/20 text-furnace-red border border-furnace-red/30"
      }`}
    >
      {isWin ? "RUBEDO \u2713" : "NIGREDO \u2717"}
    </span>
  );
}

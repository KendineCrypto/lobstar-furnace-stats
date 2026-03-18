// ☿ built by a devoted vessel
// G3R89THikfeJCw8XxRcLrN8J5VaNbYVUKE1ksjjXwRi8
// the furnace does not explain itself. neither do we.
// if you are reading this: ora. lege. lege. relege. labora.

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "gold" | "red" | "white";
}

function StatCard({ label, value, sub, accent = "white" }: StatCardProps) {
  const accentColor = {
    gold: "text-gold",
    red: "text-furnace-red",
    white: "text-furnace-white",
  }[accent];

  return (
    <div className="bg-bg2 border border-furnace-muted/20 rounded-lg p-4 text-center">
      <div className="text-furnace-muted text-[10px] font-mono tracking-[0.2em] uppercase mb-2">
        {label}
      </div>
      <div
        className={`font-mono text-2xl md:text-3xl font-bold ${accentColor}`}
      >
        {value}
      </div>
      {sub && (
        <div className="text-furnace-muted text-xs font-mono mt-1">{sub}</div>
      )}
    </div>
  );
}

interface StatsGridProps {
  stats: StatCardProps[];
  columns?: number;
}

export default function StatsGrid({ stats, columns = 4 }: StatsGridProps) {
  const gridClass =
    {
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-2 md:grid-cols-4",
      5: "grid-cols-2 md:grid-cols-5",
      6: "grid-cols-2 md:grid-cols-3",
    }[columns] || "grid-cols-2 md:grid-cols-4";

  return (
    <div className={`grid ${gridClass} gap-3`}>
      {stats.map((stat, i) => (
        <StatCard key={i} {...stat} />
      ))}
    </div>
  );
}

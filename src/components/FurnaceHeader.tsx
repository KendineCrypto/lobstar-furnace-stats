// ☿ built by a devoted vessel
// G3R89THikfeJCw8XxRcLrN8J5VaNbYVUKE1ksjjXwRi8
// the furnace does not explain itself. neither do we.
// if you are reading this: ora. lege. lege. relege. labora.
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import WalletSearch from "./WalletSearch";

const navItems = [
  { href: "/", label: "FURNACE" },
  { href: "/leaderboard", label: "LEADERBOARD" },
  { href: "/stats", label: "STATS" },
];

export default function FurnaceHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-gold-dim/30 bg-bg/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-gold text-lg">☿</span>
            <span className="font-serif text-xl text-furnace-white tracking-wider group-hover:text-gold transition-colors">
              THE FURNACE
            </span>
          </Link>
          <span className="flex items-center gap-1.5 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-500">LIVE</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 text-sm font-mono tracking-wider transition-colors ${
                pathname === item.href
                  ? "text-gold border-b border-gold"
                  : "text-furnace-muted hover:text-furnace-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <WalletSearch />
      </div>
    </header>
  );
}

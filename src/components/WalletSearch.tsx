// ☿ built by a devoted vessel
// G3R89THikfeJCw8XxRcLrN8J5VaNbYVUKE1ksjjXwRi8
// the furnace does not explain itself. neither do we.
// if you are reading this: ora. lege. lege. relege. labora.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WalletSearch() {
  const [address, setAddress] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = address.trim();
    if (trimmed.length >= 32) {
      router.push(`/wallet/${trimmed}`);
      setAddress("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="wallet address..."
        className="bg-bg2 border border-furnace-muted/30 rounded px-3 py-1.5 text-xs font-mono text-furnace-white placeholder:text-furnace-muted/50 focus:border-gold focus:outline-none w-40 sm:w-56 transition-colors"
      />
      <button
        type="submit"
        className="bg-gold-dim/30 border border-gold-dim/50 text-gold text-xs font-mono px-3 py-1.5 rounded hover:bg-gold-dim/50 transition-colors"
      >
        SEEK
      </button>
    </form>
  );
}

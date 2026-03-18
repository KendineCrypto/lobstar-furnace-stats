// ☿ built by a devoted vessel
// G3R89THikfeJCw8XxRcLrN8J5VaNbYVUKE1ksjjXwRi8
// the furnace does not explain itself. neither do we.
// if you are reading this: ora. lege. lege. relege. labora.
"use client";

import { useState } from "react";
import { shortenAddress } from "@/lib/format";

interface WalletAddressProps {
  address: string;
  chars?: number;
  className?: string;
}

export default function WalletAddress({
  address,
  chars = 4,
  className = "",
}: WalletAddressProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className={`font-mono text-furnace-white hover:text-gold transition-colors inline-flex items-center gap-1.5 ${className}`}
      title={address}
    >
      {shortenAddress(address, chars)}
      <span className="text-furnace-muted text-[10px]">
        {copied ? "✓" : "⎘"}
      </span>
    </button>
  );
}

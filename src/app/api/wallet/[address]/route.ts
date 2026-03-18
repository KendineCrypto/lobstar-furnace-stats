// ☿ built by a devoted vessel
// G3R89THikfeJCw8XxRcLrN8J5VaNbYVUKE1ksjjXwRi8
// the furnace does not explain itself. neither do we.
// if you are reading this: ora. lege. lege. relege. labora.

import { NextResponse } from "next/server";

const HELIUS_RPC = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;
const LOBSTAR_RPC = "https://lobstarwilde.ai/api/rpc";
const FURNACE_PROGRAM = "D16sRA7AgPqhPhRVoyvNHtJJPXjfccH5JTZhnr1MDWwo";
const FURNACE_PDA = "4b3Q2hMmeimC3D8xgPXwH9NGnYw6ZLdLAdik6RdgTPXy";
const WILDE_MINT = "AVF9F4C4j8b1Kh4BmNHqybDaHgnZpJ7W7yLvL7hUpump";
const TOKEN22_PROGRAM = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";

async function rpc(
  url: string,
  method: string,
  params: unknown[],
  maxRetries = 3
) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    });

    if (res.status === 429) {
      // Rate limited — exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise((r) => setTimeout(r, delay));
      continue;
    }

    if (!res.ok) throw new Error(`RPC ${method} failed: ${res.status}`);
    return res.json();
  }
  throw new Error(`RPC ${method} failed after ${maxRetries} retries (429)`);
}

interface TokenBalance {
  mint: string;
  owner: string;
  uiTokenAmount: { uiAmount: number | null; amount: string; decimals: number };
}

interface FurnaceTx {
  sig: string;
  blockTime: number;
  change: number; // token change for this wallet in this TX
}

interface SacrificeRecord {
  time: number;
  outcome: "rubedo" | "nigredo";
  amount: number;
  change: number;
  txCount: number;
  signatures: string[];
}

function getWalletTokenChange(
  meta: { preTokenBalances?: TokenBalance[]; postTokenBalances?: TokenBalance[] },
  walletAddress: string
): number {
  // Find balances matching BOTH the mint AND the wallet owner
  const pre = (meta.preTokenBalances || []).find(
    (b) => b.mint === WILDE_MINT && b.owner === walletAddress
  );
  const post = (meta.postTokenBalances || []).find(
    (b) => b.mint === WILDE_MINT && b.owner === walletAddress
  );

  const preBal = pre?.uiTokenAmount?.uiAmount ?? 0;
  const postBal = post?.uiTokenAmount?.uiAmount ?? 0;

  return postBal - preBal;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  if (!address || address.length < 32) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  if (!process.env.HELIUS_API_KEY) {
    return NextResponse.json(
      { error: "HELIUS_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    // 1. SOL balance via lobstar proxy
    const solRes = await rpc(LOBSTAR_RPC, "getBalance", [address]);
    const solBalance = (solRes?.result?.value || 0) / 1e9;

    // 2. LOBSTAR balance via Helius (Token-2022)
    const tokenRes = await rpc(HELIUS_RPC, "getTokenAccountsByOwner", [
      address,
      { programId: TOKEN22_PROGRAM },
      { encoding: "jsonParsed" },
    ]);

    const lobstarAcc = (
      (tokenRes?.result?.value || []) as Array<{
        account: {
          data: {
            parsed: {
              info: { mint: string; tokenAmount: { uiAmount: number } };
            };
          };
        };
      }>
    ).find((a) => a.account?.data?.parsed?.info?.mint === WILDE_MINT);
    const lobstarBalance =
      lobstarAcc?.account?.data?.parsed?.info?.tokenAmount?.uiAmount || 0;

    // 3. Get ALL transaction signatures via Helius with pagination (up to 500)
    const signatures: Array<{ signature: string; blockTime: number }> = [];
    let before: string | undefined = undefined;

    while (true) {
      const sigParams: Record<string, unknown> = { limit: 100 };
      if (before) sigParams.before = before;

      const sigRes = await rpc(HELIUS_RPC, "getSignaturesForAddress", [
        address,
        sigParams,
      ]);
      const sigs: Array<{ signature: string; blockTime: number }> =
        sigRes?.result || [];
      if (sigs.length === 0) break;

      signatures.push(...sigs);

      if (sigs.length < 100 || signatures.length >= 500) break;
      before = sigs[sigs.length - 1].signature;

      // Rate limit pause
      await new Promise((r) => setTimeout(r, 200));
    }

    // 4. Fetch TXs in batches of 5, keep furnace-related ones with token changes
    const furnaceTxs: FurnaceTx[] = [];
    const BATCH_SIZE = 5;

    for (let i = 0; i < signatures.length; i += BATCH_SIZE) {
      const batch = signatures.slice(i, i + BATCH_SIZE);

      const batchResults = await Promise.all(
        batch.map((sig) =>
          rpc(HELIUS_RPC, "getTransaction", [
            sig.signature,
            { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 },
          ]).catch(() => null)
        )
      );

      for (let j = 0; j < batchResults.length; j++) {
        const txRes = batchResults[j];
        const tx = txRes?.result;
        if (!tx?.meta) continue;

        // Check if this TX involves the furnace program or PDA
        const accountKeys = (
          tx.transaction?.message?.accountKeys || []
        ).map((a: string | { pubkey: string }) =>
          typeof a === "string" ? a : a.pubkey
        );
        const logs: string[] = tx.meta.logMessages || [];

        const isFurnace =
          accountKeys.includes(FURNACE_PROGRAM) ||
          accountKeys.includes(FURNACE_PDA) ||
          logs.some(
            (l: string) =>
              l.includes(FURNACE_PROGRAM) || l.includes("randomness")
          );

        if (!isFurnace) continue;

        // Calculate token change for THIS wallet (owner-matched)
        const change = getWalletTokenChange(tx.meta, address);

        furnaceTxs.push({
          sig: batch[j].signature,
          blockTime: batch[j].blockTime,
          change,
        });
      }

      // Rate limit pause between batches
      if (i + BATCH_SIZE < signatures.length) {
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    // 5. Group TXs within 30 seconds = one sacrifice (commit + settle)
    const sorted = [...furnaceTxs].sort((a, b) => a.blockTime - b.blockTime);
    const groups: FurnaceTx[][] = [];

    for (const tx of sorted) {
      const lastGroup = groups[groups.length - 1];
      const lastTx = lastGroup?.[lastGroup.length - 1];
      if (lastGroup && Math.abs(tx.blockTime - lastTx.blockTime) < 30) {
        lastGroup.push(tx);
      } else {
        groups.push([tx]);
      }
    }

    // 6. Each group = 1 sacrifice, calculate NET change
    const sacrifices: SacrificeRecord[] = groups.map((group) => {
      const totalChange = group.reduce((sum, tx) => sum + tx.change, 0);
      const earliestTime = Math.min(...group.map((tx) => tx.blockTime));

      // NET positive = RUBEDO (won), NET negative = NIGREDO (lost)
      return {
        time: earliestTime * 1000,
        outcome: totalChange > 0 ? "rubedo" : "nigredo",
        amount: Math.abs(totalChange),
        change: totalChange,
        txCount: group.length,
        signatures: group.map((g) => g.sig),
      };
    });

    // Sort newest first
    sacrifices.sort((a, b) => b.time - a.time);

    const wins = sacrifices.filter((s) => s.outcome === "rubedo");
    const losses = sacrifices.filter((s) => s.outcome === "nigredo");

    return NextResponse.json({
      address,
      sol: solBalance,
      lobstar: lobstarBalance,
      sacrifices,
      stats: {
        wins: wins.length,
        losses: losses.length,
        winRate:
          sacrifices.length > 0
            ? (wins.length / sacrifices.length) * 100
            : 0,
        netLobstar: sacrifices.reduce((sum, s) => sum + s.change, 0),
        bestWin:
          wins.length > 0 ? Math.max(...wins.map((s) => s.amount)) : 0,
        worstLoss:
          losses.length > 0 ? Math.max(...losses.map((s) => s.amount)) : 0,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}

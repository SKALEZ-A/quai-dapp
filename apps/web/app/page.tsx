"use client";
import React, { useEffect, useState } from "react";
import { makeProvider, detectPelagus, getBlockNumber, requestAccounts } from "../src/lib/quai";
// Removed mock bridge UI; focusing on real RPC + wallet status

export default function HomePage() {
  const [blockNumber, setBlockNumber] = useState<null | number>(null);
  const [pelagus, setPelagus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    setPelagus(detectPelagus());
    const rpc = process.env.NEXT_PUBLIC_QUAI_RPC;
    if (!rpc) {
      setError("NEXT_PUBLIC_QUAI_RPC is not set");
      return;
    }
    const provider = makeProvider(rpc);
    getBlockNumber(provider)
      .then((bn: number) => setBlockNumber(bn))
      .catch((e: any) => setError(String(e?.message || e)));
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Quai Superapp</h1>
      <p>Pelagus detected: {pelagus ? "yes" : "no"}</p>
      {pelagus && (
        <div style={{ marginTop: 12 }}>
          <button
            onClick={async () => {
              try {
                const accts = await requestAccounts();
                setAddress(accts?.[0] ?? null);
              } catch (e: any) {
                setError(String(e?.message || e));
              }
            }}
            style={{ padding: "6px 12px" }}
          >
            {address ? "Connected" : "Connect Pelagus"}
          </button>
          {address && <p style={{ marginTop: 8 }}>Address: {address}</p>}
        </div>
      )}
      {error ? <p style={{ color: "red" }}>Error: {error}</p> : null}

      <section style={{ marginTop: 24, padding: 12, border: "1px solid #ddd", borderRadius: 8, maxWidth: 600 }}>
        <h2>Network</h2>
        <div>
          <p>Block number: {blockNumber ?? "…"}</p>
          <p>Connected address: {address ?? "—"}</p>
          <p>Chain ID: {chainId ?? "—"}</p>
          <p>Balance (ETH): {balance ?? "—"}</p>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button
            onClick={async () => {
              try {
                setError(null);
                const eth: any = (globalThis as any).ethereum;
                if (!eth) throw new Error("No injected provider found");
                const [addr] = await eth.request({ method: "eth_requestAccounts" });
                setAddress(addr);
                const id = await eth.request({ method: "eth_chainId" });
                setChainId(String(parseInt(id, 16)));
                const bal = await eth.request({ method: "eth_getBalance", params: [addr, "latest"] });
                setBalance((Number(BigInt(bal)) / 1e18).toString());
              } catch (e: any) {
                setError(String(e?.message || e));
              }
            }}
            style={{ padding: "6px 12px" }}
          >
            {address ? "Refresh Wallet Info" : "Connect Wallet"}
          </button>
        </div>
      </section>
    </main>
  );
}

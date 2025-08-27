"use client";
import React, { useEffect, useState } from "react";
import { makeProvider, detectPelagus, getBlockNumber, requestAccounts } from "../src/lib/quai";
import { MockBridgeProvider, type BridgeQuote } from "@shared/bridge";

export default function HomePage() {
  const [blockNumber, setBlockNumber] = useState<null | number>(null);
  const [pelagus, setPelagus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [quote, setQuote] = useState<BridgeQuote | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [form, setForm] = useState({ fromChainId: 150004, toChainId: 150004, token: "0x0000000000000000000000000000000000000000", amount: "1.0", addr: "" });

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
      {error ? <p style={{ color: "red" }}>Error: {error}</p> : <p>Block number: {blockNumber ?? "…"}</p>}

      <section style={{ marginTop: 24, padding: 12, border: "1px solid #ddd", borderRadius: 8, maxWidth: 600 }}>
        <h2>Bridge demo (Mock)</h2>
        <div style={{ display: "grid", gap: 8 }}>
          <label>
            From Chain ID
            <input
              type="number"
              value={form.fromChainId}
              onChange={(e) => setForm({ ...form, fromChainId: Number(e.target.value) })}
              style={{ width: "100%" }}
            />
          </label>
          <label>
            To Chain ID
            <input
              type="number"
              value={form.toChainId}
              onChange={(e) => setForm({ ...form, toChainId: Number(e.target.value) })}
              style={{ width: "100%" }}
            />
          </label>
          <label>
            Token (address)
            <input
              type="text"
              value={form.token}
              onChange={(e) => setForm({ ...form, token: e.target.value })}
              style={{ width: "100%" }}
            />
          </label>
          <label>
            Amount
            <input
              type="text"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              style={{ width: "100%" }}
            />
          </label>
          <label>
            Recipient Address
            <input
              type="text"
              placeholder="0x..."
              value={form.addr}
              onChange={(e) => setForm({ ...form, addr: e.target.value })}
              style={{ width: "100%" }}
            />
          </label>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button
              onClick={async () => {
                try {
                  setError(null);
                  setQuote(null);
                  setTxHash(null);
                  const provider = new MockBridgeProvider();
                  const q = await provider.quote({ fromChainId: form.fromChainId, toChainId: form.toChainId, token: form.token, amount: form.amount, address: form.addr || address || "" });
                  setQuote(q);
                } catch (e: any) {
                  setError(String(e?.message || e));
                }
              }}
            >
              Get Quote
            </button>
            <button
              onClick={async () => {
                try {
                  setError(null);
                  setTxHash(null);
                  const provider = new MockBridgeProvider();
                  const res = await provider.transfer({ fromChainId: form.fromChainId, toChainId: form.toChainId, token: form.token, amount: form.amount, address: form.addr || address || "" });
                  setTxHash(res.txHash);
                } catch (e: any) {
                  setError(String(e?.message || e));
                }
              }}
              disabled={!form.addr && !address}
            >
              Transfer (Mock)
            </button>
          </div>
        </div>
        {quote && (
          <div style={{ marginTop: 12 }}>
            <p>Fee: {quote.fee}</p>
            <p>ETA (s): {quote.etaSeconds}</p>
            <p>Min Out: {quote.minOut}</p>
            <p>Route: {quote.route.join(" → ")}</p>
          </div>
        )}
        {txHash && (
          <p style={{ marginTop: 12 }}>
            Tx Hash: <code>{txHash}</code>
          </p>
        )}
      </section>
    </main>
  );
}

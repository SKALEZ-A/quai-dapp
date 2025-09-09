"use client";
import { useEffect, useMemo, useState } from "react";
import { detectPelagus, requestAccounts } from "@/src/lib/quai";
import { keccak256, toHex, signTypedData } from "viem";

type Post = {
  id: string;
  cid: string;
  textPreview?: string;
  zone?: string;
  createdAt: string;
  author: { address: string };
};

export default function SocialPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:4000/posts");
        const data = await res.json();
        setPosts(data.posts ?? []);
      } catch {}
    })();
  }, []);

  const domain = useMemo(() => ({ name: "QuaiSocial", version: "1" } as const), []);
  const types = useMemo(
    () => ({
      Post: [
        { name: "author", type: "address" },
        { name: "textHash", type: "bytes32" },
        { name: "zone", type: "string" },
        { name: "issuedAt", type: "uint256" },
        { name: "nonce", type: "bytes32" },
      ],
    } as const),
    []
  );

  async function connect() {
    const [addr] = await requestAccounts();
    setAccount(addr);
  }

  async function submitPost() {
    if (!account || !text.trim()) return;
    setLoading(true);
    try {
      const textHash = keccak256(toHex(text));
      const issuedAt = Math.floor(Date.now() / 1000);
      const nonce = keccak256(toHex(`${account}:${issuedAt}:${Math.random()}`));
      const message = { author: account as `0x${string}`, textHash, zone: "", issuedAt, nonce } as const;
      const eth: any = (globalThis as any).ethereum;
      const signature: `0x${string}` = await signTypedData(eth, { account: account as `0x${string}`, domain, types, primaryType: "Post", message });

      const res = await fetch("http://localhost:4000/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorAddress: account, text, zone: "", issuedAt, nonce, signature }),
      });
      const data = await res.json();
      if (res.ok) {
        setPosts((p) => [data.post, ...p]);
        setText("");
      } else {
        alert(data?.error ? JSON.stringify(data.error) : "Failed to post");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Social</h1>
      <div style={{ marginBottom: 12 }}>
        {account ? (
          <span>Connected: {account}</span>
        ) : (
          <button onClick={connect}>Connect Wallet</button>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="What's happening?" rows={3} style={{ width: 400 }} />
        <button onClick={submitPost} disabled={!account || loading || !text.trim()}>
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
      <ul style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {posts.map((p) => (
          <li key={p.id} style={{ border: "1px solid #ddd", padding: 12 }}>
            <div style={{ fontSize: 12, color: "#666" }}>{p.author.address}</div>
            <div>{p.textPreview ?? p.cid}</div>
            <div style={{ fontSize: 12, color: "#666" }}>{new Date(p.createdAt).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}



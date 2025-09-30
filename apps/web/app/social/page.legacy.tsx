"use client";
import { useEffect, useMemo, useState } from "react";
import { detectPelagus, requestAccounts } from "@/lib/quai";
import { keccak256, toHex } from "viem";

type Post = {
  id: string;
  cid: string;
  textPreview?: string;
  zone?: string;
  createdAt: string;
  author: { address: string };
  likes?: { profile: { address: string } }[];
  comments?: any[];
};

type NFT = {
  contractAddress: string;
  tokenId: string;
  name?: string;
  image?: string;
};

export default function SocialPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [showNFTModal, setShowNFTModal] = useState(false);
  const [nftContract, setNftContract] = useState("");
  const [nftTokenId, setNftTokenId] = useState("");
  const [tipping, setTipping] = useState<{ [postId: string]: boolean }>({});
  const [commenting, setCommenting] = useState<{ [postId: string]: boolean }>({});
  const [commentText, setCommentText] = useState<{ [postId: string]: string }>({});

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
      const typedData = { domain, types, primaryType: "Post", message } as const;
      const signature = await eth.request({
        method: 'eth_signTypedData_v4',
        params: [account, JSON.stringify(typedData)]
      }) as string;

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

  async function shareNFT() {
    if (!account || !nftContract || !nftTokenId) return;

    const nftText = `Sharing NFT: ${nftContract}#${nftTokenId}`;
    setText(nftText);
    setShowNFTModal(false);
    setNftContract("");
    setNftTokenId("");
  }

  async function tipAuthor(postId: string, authorAddress: string) {
    if (!account) return;

    setTipping(prev => ({ ...prev, [postId]: true }));
    try {
      // In a real implementation, this would call a tipping contract
      alert(`Tipping ${authorAddress.slice(0, 6)}...${authorAddress.slice(-4)}`);
    } finally {
      setTipping(prev => ({ ...prev, [postId]: false }));
    }
  }

  async function likePost(postId: string) {
    if (!account) return;

    try {
      // In a real implementation, this would call the engagements API
      alert("Like functionality would be implemented here");
    } catch (err) {
      alert("Failed to like post");
    }
  }

  async function submitComment(postId: string) {
    if (!account || !commentText[postId]?.trim()) return;

    setCommenting(prev => ({ ...prev, [postId]: true }));
    try {
      // In a real implementation, this would call the engagements API
      alert(`Commenting on post: ${commentText[postId]}`);
      setCommentText(prev => ({ ...prev, [postId]: "" }));
      setCommenting(prev => ({ ...prev, [postId]: false }));
    } catch (err) {
      alert("Failed to comment");
      setCommenting(prev => ({ ...prev, [postId]: false }));
    }
  }

  function toggleComment(postId: string) {
    setCommenting(prev => ({ ...prev, [postId]: !prev[postId] }));
  }

  return (
    <main style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <h1>Social dApp</h1>
      <p>Share posts, NFTs, and connect with the Quai community</p>

      {/* Wallet Connection */}
      <div style={{ marginBottom: 24 }}>
        {account ? (
          <div>
            <span>Connected: {account.slice(0, 6)}...{account.slice(-4)}</span>
          </div>
        ) : (
          <button onClick={connect} style={{ padding: "8px 16px" }}>
            Connect Wallet
          </button>
        )}
      </div>

      {/* Post Composer */}
      <div style={{ marginBottom: 32, border: "1px solid #ddd", padding: 16, borderRadius: 8 }}>
        <h3>Share something</h3>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's happening?"
            rows={3}
            style={{ flex: 1, padding: "8px 12px", borderRadius: 4, border: "1px solid #ccc" }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button onClick={submitPost} disabled={!account || loading || !text.trim()} style={{
              padding: "8px 16px",
              backgroundColor: "#059669",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: account && !loading && text.trim() ? "pointer" : "not-allowed"
            }}>
              {loading ? "Posting..." : "Post"}
            </button>
            <button onClick={() => setShowNFTModal(true)} disabled={!account} style={{
              padding: "8px 16px",
              backgroundColor: "#7c3aed",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: account ? "pointer" : "not-allowed"
            }}>
              Share NFT
            </button>
          </div>
        </div>
        {!account && <div style={{ fontSize: 14, color: "#666" }}>
          Connect your wallet to post and interact
        </div>}
      </div>

      {/* NFT Sharing Modal */}
      {showNFTModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            padding: 24,
            borderRadius: 8,
            maxWidth: 400,
            width: "100%",
            margin: 16
          }}>
            <h3>Share NFT</h3>
            <div style={{ marginBottom: 16 }}>
              <input
                type="text"
                placeholder="NFT Contract Address"
                value={nftContract}
                onChange={(e) => setNftContract(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", marginBottom: 8, borderRadius: 4, border: "1px solid #ccc" }}
              />
              <input
                type="text"
                placeholder="Token ID"
                value={nftTokenId}
                onChange={(e) => setNftTokenId(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 4, border: "1px solid #ccc" }}
              />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setShowNFTModal(false)} style={{
                padding: "8px 16px",
                border: "1px solid #ccc",
                borderRadius: 4,
                backgroundColor: "white"
              }}>
                Cancel
              </button>
              <button onClick={shareNFT} disabled={!nftContract || !nftTokenId} style={{
                padding: "8px 16px",
                backgroundColor: "#7c3aed",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: nftContract && nftTokenId ? "pointer" : "not-allowed"
              }}>
                Share NFT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Posts Feed */}
      <div>
        <h2>Recent Posts</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {posts.map((post) => (
            <div key={post.id} style={{
              border: "1px solid #ddd",
              padding: 16,
              borderRadius: 8,
              backgroundColor: "#fafafa"
            }}>
              {/* Post Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 14, color: "#666" }}>
                  {post.author.address.slice(0, 6)}...{post.author.address.slice(-4)}
                </div>
                <div style={{ fontSize: 12, color: "#999" }}>
                  {new Date(post.createdAt).toLocaleString()}
                </div>
              </div>

              {/* Post Content */}
              <div style={{ marginBottom: 12, fontSize: 16 }}>
                {post.textPreview ?? post.cid}
              </div>

              {post.zone && (
                <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
                  Zone: {post.zone}
                </div>
              )}

              {/* Post Actions */}
              <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                <button
                  onClick={() => likePost(post.id)}
                  disabled={!account}
                  style={{
                    padding: "4px 8px",
                    border: "1px solid #ccc",
                    borderRadius: 4,
                    backgroundColor: "white",
                    cursor: account ? "pointer" : "not-allowed",
                    fontSize: 14
                  }}
                >
                  ❤️ {post.likes?.length || 0}
                </button>

                <button
                  onClick={() => toggleComment(post.id)}
                  disabled={!account}
                  style={{
                    padding: "4px 8px",
                    border: "1px solid #ccc",
                    borderRadius: 4,
                    backgroundColor: "white",
                    cursor: account ? "pointer" : "not-allowed",
                    fontSize: 14
                  }}
                >
                  💬 {post.comments?.length || 0}
                </button>

                <button
                  onClick={() => tipAuthor(post.id, post.author.address)}
                  disabled={!account || tipping[post.id]}
                  style={{
                    padding: "4px 8px",
                    border: "1px solid #ccc",
                    borderRadius: 4,
                    backgroundColor: "#fbbf24",
                    cursor: account && !tipping[post.id] ? "pointer" : "not-allowed",
                    fontSize: 14
                  }}
                >
                  {tipping[post.id] ? "Tipping..." : "💰 Tip"}
                </button>
              </div>

              {/* Comment Form */}
              {commenting[post.id] && (
                <div style={{ marginTop: 12, padding: 12, backgroundColor: "white", borderRadius: 4 }}>
                  <textarea
                    placeholder="Write a comment..."
                    value={commentText[post.id] || ""}
                    onChange={(e) => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                    rows={2}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 4,
                      border: "1px solid #ccc",
                      marginBottom: 8
                    }}
                  />
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button
                      onClick={() => toggleComment(post.id)}
                      style={{
                        padding: "4px 8px",
                        border: "1px solid #ccc",
                        borderRadius: 4,
                        backgroundColor: "white"
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => submitComment(post.id)}
                      disabled={!commentText[post.id]?.trim() || commenting[post.id]}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#059669",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        cursor: commentText[post.id]?.trim() && !commenting[post.id] ? "pointer" : "not-allowed"
                      }}
                    >
                      {commenting[post.id] ? "Commenting..." : "Comment"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {posts.length === 0 && (
          <div style={{ textAlign: "center", padding: 32, color: "#666" }}>
            No posts yet. Be the first to share something!
          </div>
        )}
      </div>
    </main>
  );
}



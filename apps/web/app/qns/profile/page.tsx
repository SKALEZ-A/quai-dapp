"use client";
import { useState, useEffect } from "react";
import { requestAccounts } from "@/lib/quai";

interface DomainInfo {
  name: string;
  available: boolean;
  price?: string;
  isAuction?: boolean;
  auctionEnd?: string;
  owner?: string;
}

export default function QNSProfilePage() {
  const [account, setAccount] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [domainInfo, setDomainInfo] = useState<DomainInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [ownedDomains, setOwnedDomains] = useState<string[]>([]);

  useEffect(() => {
    checkWallet();
  }, []);

  async function checkWallet() {
    try {
      const [addr] = await requestAccounts();
      setAccount(addr);
      // TODO: Fetch owned domains from contracts
    } catch (err) {
      // Not connected
    }
  }

  async function connect() {
    try {
      const [addr] = await requestAccounts();
      setAccount(addr);
    } catch (err) {
      alert("Failed to connect wallet");
    }
  }

  function calculateDomainPrice(name: string): { price: string; isAuction: boolean } {
    const length = name.length;
    if (length >= 3 && length <= 7) {
      const basePrices = { 3: "20000 QI", 4: "10000 QI", 5: "5000 QI", 6: "5000 QI", 7: "5000 QI" } as const;
      return { price: basePrices[length as 3 | 4 | 5 | 6 | 7], isAuction: true };
    }
    return { price: "100 QI", isAuction: false };
  }

  async function searchDomain() {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const name = searchQuery.toLowerCase().trim();
      const pricing = calculateDomainPrice(name);
      const available = Math.random() > 0.3; // mock
      setDomainInfo({ name, available, price: pricing.price, isAuction: pricing.isAuction, owner: available ? undefined : "0x1234...5678" });
    } finally {
      setLoading(false);
    }
  }

  async function registerDomain() {
    if (!account || !domainInfo) return;
    if (domainInfo.isAuction) alert(`Starting auction for ${domainInfo.name}.qns`);
    else alert(`Registering ${domainInfo.name}.qns for ${domainInfo.price}`);
  }

  return (
    <main style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <h1>Quai Name Service (QNS)</h1>
      <p>Register human-readable names on Quai Network</p>

      <div style={{ marginBottom: 24 }}>
        {account ? (
          <div>
            <span>Connected: {account.slice(0, 6)}...{account.slice(-4)}</span>
            <div style={{ marginTop: 8, fontSize: 14, color: "#666" }}>
              Your domains: {ownedDomains.length > 0 ? ownedDomains.join(", ") : "None"}
            </div>
          </div>
        ) : (
          <button onClick={connect} style={{ padding: "8px 16px" }}>Connect Wallet</button>
        )}
      </div>

      <div style={{ marginBottom: 32 }}>
        <h2>Search Domain</h2>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input type="text" placeholder="Enter domain name" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ flex: 1, padding: "8px 12px" }} onKeyDown={(e) => e.key === "Enter" && searchDomain()} />
          <button onClick={searchDomain} disabled={loading || !searchQuery.trim()}>{loading ? "Searching..." : "Search"}</button>
        </div>

        {domainInfo && (
          <div style={{ border: "1px solid #ddd", padding: 16, borderRadius: 8, backgroundColor: domainInfo.available ? "#f0f9ff" : "#fef2f2" }}>
            <h3>{domainInfo.name}.qns</h3>
            <div style={{ marginBottom: 8 }}>
              <strong>Status:</strong>{" "}
              <span style={{ color: domainInfo.available ? "#059669" : "#dc2626" }}>{domainInfo.available ? "Available" : "Taken"}</span>
            </div>
            {domainInfo.available ? (
              <div>
                <div style={{ marginBottom: 8 }}>
                  <strong>Registration:</strong> {domainInfo.isAuction ? "Dutch Auction" : "Fixed Price"}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <strong>Price:</strong> {domainInfo.price}
                  {domainInfo.isAuction && " (starting price, decreases over time)"}
                </div>
                <button onClick={registerDomain} disabled={!account} style={{ padding: "8px 16px", backgroundColor: "#059669", color: "white", border: "none", borderRadius: 4 }}>
                  {domainInfo.isAuction ? "Start Auction" : "Register Domain"}
                </button>
                {!account && <div style={{ marginTop: 8, fontSize: 14, color: "#666" }}>Connect wallet to register domains</div>}
              </div>
            ) : (
              <div>
                <strong>Owner:</strong> {domainInfo.owner}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ marginBottom: 32 }}>
        <h2>Pricing</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ border: "1px solid #ddd", padding: 16, borderRadius: 8 }}>
            <h3>3-7 Characters</h3>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>3 chars: 20,000 QI → 1,000 QI (auction)</li>
              <li>4 chars: 10,000 QI → 500 QI (auction)</li>
              <li>5-7 chars: 5,000 QI → 200 QI (auction)</li>
            </ul>
            <p style={{ fontSize: 14, color: "#666", marginTop: 8 }}>Dutch auctions decrease price over 7 days</p>
          </div>
          <div style={{ border: "1px solid #ddd", padding: 16, borderRadius: 8 }}>
            <h3>8+ Characters</h3>
            <p>Fixed price: 100 QI</p>
            <p style={{ fontSize: 14, color: "#666", marginTop: 8 }}>Direct registration with commit/reveal protection</p>
          </div>
        </div>
      </div>

      <div>
        <h2>Features</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          <div style={{ border: "1px solid #ddd", padding: 16, borderRadius: 8 }}>
            <h4>🔒 Commit/Reveal</h4>
            <p style={{ fontSize: 14 }}>Prevents front-running attacks on domain registrations</p>
          </div>
          <div style={{ border: "1px solid #ddd", padding: 16, borderRadius: 8 }}>
            <h4>💰 Qi Payments</h4>
            <p style={{ fontSize: 14 }}>Resolve domains to Qi payment codes for easy transactions</p>
          </div>
          <div style={{ border: "1px solid #ddd", padding: 16, borderRadius: 8 }}>
            <h4>🌐 Cross-Chain</h4>
            <p style={{ fontSize: 14 }}>Use your QNS domain across all Quai zones and networks</p>
          </div>
        </div>
      </div>
    </main>
  );
}

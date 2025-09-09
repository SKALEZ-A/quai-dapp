// Explicit Quai per-zone config for mainnet/devnet/testnet. Keep small and typed.

export type QuaiZoneKey =
  | "cyprus1"
  | "cyprus2"
  | "cyprus3"
  | "paxos1"
  | "paxos2"
  | "paxos3"
  | "hydrus1"
  | "hydrus2"
  | "hydrus3";

export type QuaiNetworkKey = "mainnet" | "devnet" | "testnet";

export interface QuaiChainInfo {
  name: string;
  chainId: number;
  rpcHttpUrl: string;
  rpcWsUrl?: string;
  explorerUrl?: string;
  currencySymbol: string;
}

export type QuaiChains = Record<QuaiNetworkKey, Record<QuaiZoneKey, QuaiChainInfo>>;

// NOTE: RPCs and chainIds should be verified against official docs prior to mainnet use.
// Placeholders follow the public URL pattern and must be overridden by env if provided.
export const DEFAULT_CHAINS: QuaiChains = {
  mainnet: {
    cyprus1: { name: "Cyprus-1", chainId: 9, rpcHttpUrl: "https://rpc.quai.network/cyprus1", rpcWsUrl: "wss://rpc.quai.network/cyprus1", explorerUrl: "https://quaiscan.io/cyprus1", currencySymbol: "QUAI" },
    cyprus2: { name: "Cyprus-2", chainId: 9, rpcHttpUrl: "https://rpc.quai.network/cyprus2", rpcWsUrl: "wss://rpc.quai.network/cyprus2", explorerUrl: "https://quaiscan.io/cyprus2", currencySymbol: "QUAI" },
    cyprus3: { name: "Cyprus-3", chainId: 9, rpcHttpUrl: "https://rpc.quai.network/cyprus3", rpcWsUrl: "wss://rpc.quai.network/cyprus3", explorerUrl: "https://quaiscan.io/cyprus3", currencySymbol: "QUAI" },
    paxos1: { name: "Paxos-1", chainId: 9, rpcHttpUrl: "https://rpc.quai.network/paxos1", rpcWsUrl: "wss://rpc.quai.network/paxos1", explorerUrl: "https://quaiscan.io/paxos1", currencySymbol: "QUAI" },
    paxos2: { name: "Paxos-2", chainId: 9, rpcHttpUrl: "https://rpc.quai.network/paxos2", rpcWsUrl: "wss://rpc.quai.network/paxos2", explorerUrl: "https://quaiscan.io/paxos2", currencySymbol: "QUAI" },
    paxos3: { name: "Paxos-3", chainId: 9, rpcHttpUrl: "https://rpc.quai.network/paxos3", rpcWsUrl: "wss://rpc.quai.network/paxos3", explorerUrl: "https://quaiscan.io/paxos3", currencySymbol: "QUAI" },
    hydrus1: { name: "Hydrus-1", chainId: 9, rpcHttpUrl: "https://rpc.quai.network/hydrus1", rpcWsUrl: "wss://rpc.quai.network/hydrus1", explorerUrl: "https://quaiscan.io/hydrus1", currencySymbol: "QUAI" },
    hydrus2: { name: "Hydrus-2", chainId: 9, rpcHttpUrl: "https://rpc.quai.network/hydrus2", rpcWsUrl: "wss://rpc.quai.network/hydrus2", explorerUrl: "https://quaiscan.io/hydrus2", currencySymbol: "QUAI" },
    hydrus3: { name: "Hydrus-3", chainId: 9, rpcHttpUrl: "https://rpc.quai.network/hydrus3", rpcWsUrl: "wss://rpc.quai.network/hydrus3", explorerUrl: "https://quaiscan.io/hydrus3", currencySymbol: "QUAI" },
  },
  devnet: {
    cyprus1: { name: "Dev Cyprus-1", chainId: 9000, rpcHttpUrl: "https://rpc.cyprus1.colosseum.quaiscan.io", explorerUrl: "https://colosseum.quaiscan.io/cyprus1", currencySymbol: "tQUAI" },
    cyprus2: { name: "Dev Cyprus-2", chainId: 9000, rpcHttpUrl: "https://rpc.cyprus2.colosseum.quaiscan.io", explorerUrl: "https://colosseum.quaiscan.io/cyprus2", currencySymbol: "tQUAI" },
    cyprus3: { name: "Dev Cyprus-3", chainId: 9000, rpcHttpUrl: "https://rpc.cyprus3.colosseum.quaiscan.io", explorerUrl: "https://colosseum.quaiscan.io/cyprus3", currencySymbol: "tQUAI" },
    paxos1: { name: "Dev Paxos-1", chainId: 9000, rpcHttpUrl: "https://rpc.paxos1.colosseum.quaiscan.io", explorerUrl: "https://colosseum.quaiscan.io/paxos1", currencySymbol: "tQUAI" },
    paxos2: { name: "Dev Paxos-2", chainId: 9000, rpcHttpUrl: "https://rpc.paxos2.colosseum.quaiscan.io", explorerUrl: "https://colosseum.quaiscan.io/paxos2", currencySymbol: "tQUAI" },
    paxos3: { name: "Dev Paxos-3", chainId: 9000, rpcHttpUrl: "https://rpc.paxos3.colosseum.quaiscan.io", explorerUrl: "https://colosseum.quaiscan.io/paxos3", currencySymbol: "tQUAI" },
    hydrus1: { name: "Dev Hydrus-1", chainId: 9000, rpcHttpUrl: "https://rpc.hydrus1.colosseum.quaiscan.io", explorerUrl: "https://colosseum.quaiscan.io/hydrus1", currencySymbol: "tQUAI" },
    hydrus2: { name: "Dev Hydrus-2", chainId: 9000, rpcHttpUrl: "https://rpc.hydrus2.colosseum.quaiscan.io", explorerUrl: "https://colosseum.quaiscan.io/hydrus2", currencySymbol: "tQUAI" },
    hydrus3: { name: "Dev Hydrus-3", chainId: 9000, rpcHttpUrl: "https://rpc.hydrus3.colosseum.quaiscan.io", explorerUrl: "https://colosseum.quaiscan.io/hydrus3", currencySymbol: "tQUAI" },
  },
  testnet: {
    cyprus1: { name: "Test Cyprus-1", chainId: 9000, rpcHttpUrl: "https://rpc.cyprus1.colosseum.quaiscan.io", explorerUrl: "https://colosseum.quaiscan.io/cyprus1", currencySymbol: "tQUAI" },
    cyprus2: { name: "Test Cyprus-2", chainId: 9000, rpcHttpUrl: "https://rpc.cyprus2.colosseum.quaiscan.io", explorerUrl: "https://colosseum.quaiscan.io/cyprus2", currencySymbol: "tQUAI" },
    cyprus3: { name: "Test Cyprus-3", chainId: 9000, rpcHttpUrl: "https://rpc.cyprus3.colosseum.quaiscan.io", explorerUrl: "https://colosseum.quaiscan.io/cyprus3", currencySymbol: "tQUAI" },
    paxos1: { name: "Test Paxos-1", chainId: 9000, rpcHttpUrl: "https://rpc.paxos1.colosseum.quaiscan.io", explorerUrl: "https://colosseum.quaiscan.io/paxos1", currencySymbol: "tQUAI" },
    paxos2: { name: "Test Paxos-2", chainId: 9000, rpcHttpUrl: "https://rpc.paxos2.colosseum.quaiscan.io", explorerUrl: "https://colosseum.quaiscan.io/paxos2", currencySymbol: "tQUAI" },
    paxos3: { name: "Test Paxos-3", chainId: 9000, rpcHttpUrl: "https://rpc.paxos3.colosseum.quaiscan.io", explorerUrl: "https://colosseum.quaiscan.io/paxos3", currencySymbol: "tQUAI" },
    hydrus1: { name: "Test Hydrus-1", chainId: 9000, rpcHttpUrl: "https://rpc.hydrus1.colosseum.quaiscan.io", explorerUrl: "https://colosseum.quaiscan.io/hydrus1", currencySymbol: "tQUAI" },
    hydrus2: { name: "Test Hydrus-2", chainId: 9000, rpcHttpUrl: "https://rpc.hydrus2.colosseum.quaiscan.io", explorerUrl: "https://colosseum.quaiscan.io/hydrus2", currencySymbol: "tQUAI" },
    hydrus3: { name: "Test Hydrus-3", chainId: 9000, rpcHttpUrl: "https://rpc.hydrus3.colosseum.quaiscan.io", explorerUrl: "https://colosseum.quaiscan.io/hydrus3", currencySymbol: "tQUAI" },
  },
};

export function resolveChainsFromEnv(fallback: QuaiChains = DEFAULT_CHAINS): QuaiChains {
  const env = process.env;
  const withOverride = (zone: QuaiZoneKey, network: QuaiNetworkKey, def: QuaiChainInfo): QuaiChainInfo => {
    const prefix = `NEXT_PUBLIC_QUAI_${network.toUpperCase()}_${zone.toUpperCase()}`;
    const http = env[`${prefix}_RPC_HTTP`];
    const ws = env[`${prefix}_RPC_WS`];
    const chainIdStr = env[`${prefix}_CHAIN_ID`];
    const explorer = env[`${prefix}_EXPLORER`];
    return {
      name: def.name,
      chainId: chainIdStr ? Number(chainIdStr) : def.chainId,
      rpcHttpUrl: http || def.rpcHttpUrl,
      rpcWsUrl: ws || def.rpcWsUrl,
      explorerUrl: explorer || def.explorerUrl,
      currencySymbol: def.currencySymbol,
    };
  };
  const produce = (network: QuaiNetworkKey): Record<QuaiZoneKey, QuaiChainInfo> => ({
    cyprus1: withOverride("cyprus1", network, fallback[network].cyprus1),
    cyprus2: withOverride("cyprus2", network, fallback[network].cyprus2),
    cyprus3: withOverride("cyprus3", network, fallback[network].cyprus3),
    paxos1: withOverride("paxos1", network, fallback[network].paxos1),
    paxos2: withOverride("paxos2", network, fallback[network].paxos2),
    paxos3: withOverride("paxos3", network, fallback[network].paxos3),
    hydrus1: withOverride("hydrus1", network, fallback[network].hydrus1),
    hydrus2: withOverride("hydrus2", network, fallback[network].hydrus2),
    hydrus3: withOverride("hydrus3", network, fallback[network].hydrus3),
  });
  return {
    mainnet: produce("mainnet"),
    devnet: produce("devnet"),
    testnet: produce("testnet"),
  };
}

export function getActiveNetwork(): QuaiNetworkKey {
  const raw = (process.env.NEXT_PUBLIC_QUAI_NETWORK || "devnet").toLowerCase();
  if (raw === "mainnet" || raw === "devnet" || raw === "testnet") return raw;
  return "devnet";
}

export function getZoneRpcUrl(zone: QuaiZoneKey): string {
  const network = getActiveNetwork();
  const chains = resolveChainsFromEnv();
  const entry = chains[network][zone];
  if (!entry?.rpcHttpUrl) throw new Error(`Missing RPC for ${network}/${zone}`);
  return entry.rpcHttpUrl;
}



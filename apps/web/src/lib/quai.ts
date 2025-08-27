// Wallet & Provider utilities per BUILD_RULES.md
// Prefer official quais SDK with pathing enabled, per provided anchors.
import { JsonRpcProvider } from "quais";

export function makeProvider(rpcUrl: string) {
  if (!rpcUrl) throw new Error("rpcUrl is required");
  // Enable pathing per Quai requirements
  return new JsonRpcProvider(rpcUrl, undefined, { usePathing: true });
}

// Use a standard JSON-RPC method to avoid guessing shard-specific APIs
export async function getBlockNumber(provider: any): Promise<number> {
  const hex = await provider.send("eth_blockNumber", []);
  return Number.parseInt(hex, 16);
}

export function detectPelagus(): boolean {
  const eth = (globalThis as any)?.ethereum;
  return Boolean(eth && eth.isPelagus);
}

export async function requestAccounts(): Promise<string[]> {
  const eth = (globalThis as any)?.ethereum;
  if (!eth) throw new Error("No injected provider found");
  // Standard EIP-1193 method supported by Pelagus
  const accounts: string[] = await eth.request({ method: "eth_requestAccounts" });
  return accounts;
}

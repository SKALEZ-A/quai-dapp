export interface BridgeQuoteInput {
  fromChainId: number;
  toChainId: number;
  token: string;
  amount: string; // string to avoid float issues
  address: string;
}

export interface BridgeQuote {
  fee: string;
  etaSeconds: number;
  minOut: string;
  route: string[];
}

export interface BridgeProvider {
  name: string;
  supports(_chainId: number): boolean;
  quote(_input: BridgeQuoteInput): Promise<BridgeQuote>;
  transfer(_input: BridgeQuoteInput): Promise<{ txHash: string; trackingUrl?: string }>;
}

export class MockBridgeProvider implements BridgeProvider {
  name = "mock";
  supports(_chainId: number): boolean {
    return true;
  }
  async quote(q: BridgeQuoteInput): Promise<BridgeQuote> {
    const feeBp = 30; // 0.3%
    const amountNum = Number(q.amount);
    const fee = ((amountNum * feeBp) / 10000).toFixed(6);
    return {
      fee,
      etaSeconds: 60,
      minOut: (amountNum - Number(fee)).toFixed(6),
      route: [String(q.fromChainId), "mock-route", String(q.toChainId)]
    };
  }
  async transfer(q: BridgeQuoteInput): Promise<{ txHash: string; trackingUrl?: string }> {
    // Deterministic pseudo tx hash for dev
    const txHash = `0xmock_${q.fromChainId}_${q.toChainId}_${q.token}_${q.amount}`;
    return { txHash, trackingUrl: `https://example.com/tx/${encodeURIComponent(txHash)}` };
  }
}

import { describe, it, expect } from "vitest";
import { getBlockNumber } from "./quai";

describe("getBlockNumber", () => {
  it("parses hex block number to decimal", async () => {
    const provider = {
      send: async (method: string, _params: unknown[]) => {
        expect(method).toBe("eth_blockNumber");
        return "0x10"; // 16
      }
    } as any;

    const bn = await getBlockNumber(provider);
    expect(bn).toBe(16);
  });

  it("throws when provider rejects", async () => {
    const provider = {
      send: async () => {
        throw new Error("rpc error");
      }
    } as any;

    await expect(getBlockNumber(provider)).rejects.toThrow("rpc error");
  });
});

import { Web3Storage, File } from "web3.storage";

function getClient(): Web3Storage {
  const token = process.env.WEB3_STORAGE_TOKEN;
  if (!token) {
    throw new Error("WEB3_STORAGE_TOKEN is required for IPFS uploads");
  }
  return new Web3Storage({ token });
}

export async function uploadJson(name: string, data: unknown): Promise<string> {
  const client = getClient();
  const buffer = Buffer.from(JSON.stringify(data));
  const files = [new File([buffer], name, { type: "application/json" })];
  const cid = await client.put(files, { wrapWithDirectory: false });
  return cid;
}



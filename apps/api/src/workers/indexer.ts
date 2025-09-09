import pino from "pino";
import { JsonRpcProvider, Contract } from "quais";
import { prisma } from "../db/client";

const SOCIAL_ABI = [
  "event PostCreated(address indexed author, string cid, string zone)",
];

const logger = pino({ level: process.env.NODE_ENV === "production" ? "info" : "debug" });

async function main(): Promise<void> {
  logger.info("Indexer worker started");

  const rpcUrl = process.env.QUAI_RPC_URL;
  const socialAddress = process.env.SOCIAL_CONTRACT_ADDRESS;
  if (!rpcUrl || !socialAddress) {
    logger.warn("Missing QUAI_RPC_URL or SOCIAL_CONTRACT_ADDRESS; indexer idle");
    setInterval(() => logger.debug("indexer: heartbeat"), 15_000);
    return;
  }

  const provider = new JsonRpcProvider(rpcUrl, undefined, { usePathing: true });
  const contract = new Contract(socialAddress, SOCIAL_ABI, provider as any);

  contract.on("PostCreated", async (author: string, cid: string, zone: string, event: any) => {
    logger.info({ author, cid, zone, txHash: event?.log?.transactionHash }, "PostCreated");
    try {
      await prisma.post.updateMany({
        where: { cid },
        data: { txHash: event?.log?.transactionHash ?? null, zone },
      });
    } catch (err) {
      logger.error({ err }, "Failed to update post by cid");
    }
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});



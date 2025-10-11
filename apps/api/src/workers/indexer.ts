import pino from "pino";
import { JsonRpcProvider, Contract } from "quais";
import { prisma } from "../db/client";

const SOCIAL_ABI = [
  "event PostCreated(address indexed author, string cid, string zone)",
];

const QNS_REGISTRY_ABI = [
  "event OwnerChanged(bytes32 indexed node, address owner)",
  "event ResolverChanged(bytes32 indexed node, address resolver)",
  "event TTLChanged(bytes32 indexed node, uint64 ttl)",
];

const QNS_CONTROLLER_ABI = [
  "event Commit(bytes32 indexed commitHash, bytes32 indexed node, address indexed owner, bytes32 secret, uint64 expiresAt)",
  "event Reveal(bytes32 indexed commitHash, bytes32 indexed node, address indexed owner)",
];

const QNS_AUCTION_ABI = [
  "event AuctionStarted(bytes32 indexed node, uint64 startTime, uint64 endTime, uint256 startPrice, uint256 floorPrice)",
  "event BidPlaced(bytes32 indexed node, address indexed bidder, uint256 amount)",
  "event AuctionSettled(bytes32 indexed node, address indexed winner, uint256 finalPrice)",
];

const QNS_RESERVED_ABI = [
  "event NameReserved(bytes32 indexed node, address indexed claimant, uint64 claimDeadline)",
  "event NameClaimed(bytes32 indexed node, address indexed claimant)",
  "event ReservationRevoked(bytes32 indexed node)",
];

const QNS_NFT_ABI = [
  "event NameMinted(bytes32 indexed node, uint256 indexed tokenId, address indexed owner)",
  "event NameTransferred(bytes32 indexed node, address indexed from, address indexed to)",
];

const PAYMENT_RESOLVER_ABI = [
  "event PaymentRecordSet(bytes32 indexed node, string qiCode, address primaryAddress)",
  "event PaymentRecordUpdated(bytes32 indexed node, string qiCode)",
  "event AddressAdded(bytes32 indexed node, string chain, address addr)",
  "event PaymentRecordDeactivated(bytes32 indexed node)",
];

const logger = pino({ level: process.env.NODE_ENV === "production" ? "info" : "debug" });

async function main(): Promise<void> {
  logger.info("Indexer worker started");

  const rpcUrl = process.env.QUAI_RPC_URL;
  if (!rpcUrl) {
    logger.warn("Missing QUAI_RPC_URL; indexer idle");
    setInterval(() => logger.debug("indexer: heartbeat"), 15_000);
    return;
  }

  const provider = new JsonRpcProvider(rpcUrl, undefined, { usePathing: true });

  // Set up contract listeners
  const contracts = [
    {
      name: "SocialPosts",
      address: process.env.SOCIAL_CONTRACT_ADDRESS,
      abi: SOCIAL_ABI,
      handlers: {
        PostCreated: handlePostCreated
      }
    },
    {
      name: "QNSRegistry",
      address: process.env.QNS_REGISTRY_ADDRESS,
      abi: QNS_REGISTRY_ABI,
      handlers: {
        OwnerChanged: handleOwnerChanged,
        ResolverChanged: handleResolverChanged,
        TTLChanged: handleTTLChanged
      }
    },
    {
      name: "QNSController",
      address: process.env.QNS_CONTROLLER_ADDRESS,
      abi: QNS_CONTROLLER_ABI,
      handlers: {
        Commit: handleCommit,
        Reveal: handleReveal
      }
    },
    {
      name: "QNSAuctionManager",
      address: process.env.AUCTION_MANAGER_ADDRESS,
      abi: QNS_AUCTION_ABI,
      handlers: {
        AuctionStarted: handleAuctionStarted,
        BidPlaced: handleBidPlaced,
        AuctionSettled: handleAuctionSettled
      }
    },
    {
      name: "QNSReservedNames",
      address: process.env.RESERVED_NAMES_ADDRESS,
      abi: QNS_RESERVED_ABI,
      handlers: {
        NameReserved: handleNameReserved,
        NameClaimed: handleNameClaimed,
        ReservationRevoked: handleReservationRevoked
      }
    },
    {
      name: "QNSNFT",
      address: process.env.QNS_NFT_ADDRESS,
      abi: QNS_NFT_ABI,
      handlers: {
        NameMinted: handleNameMinted,
        NameTransferred: handleNameTransferred
      }
    },
    {
      name: "QiPaymentResolver",
      address: process.env.PAYMENT_RESOLVER_ADDRESS,
      abi: PAYMENT_RESOLVER_ABI,
      handlers: {
        PaymentRecordSet: handlePaymentRecordSet,
        PaymentRecordUpdated: handlePaymentRecordUpdated,
        AddressAdded: handleAddressAdded,
        PaymentRecordDeactivated: handlePaymentRecordDeactivated
      }
    }
  ];

  // Set up listeners for each contract
  for (const contractConfig of contracts) {
    if (!contractConfig.address) {
      logger.warn(`Missing address for ${contractConfig.name}, skipping`);
      continue;
    }

    try {
      const contract = new Contract(contractConfig.address, contractConfig.abi, provider as any);

      for (const [eventName, handler] of Object.entries(contractConfig.handlers)) {
        contract.on(eventName, async (...args: any[]) => {
          const event = args[args.length - 1]; // Last argument is usually the event object
          logger.info({ contract: contractConfig.name, event: eventName, txHash: event?.log?.transactionHash }, `${contractConfig.name}:${eventName}`);
          try {
            await (handler as Function)(...args);
          } catch (err) {
            logger.error({ err, contract: contractConfig.name, event: eventName }, `Failed to handle ${eventName}`);
          }
        });
      }

      logger.info({ contract: contractConfig.name, address: contractConfig.address }, `Set up listeners for ${contractConfig.name}`);
    } catch (err) {
      logger.error({ err, contract: contractConfig.name }, `Failed to set up ${contractConfig.name} listeners`);
    }
  }
}

// Event handlers
async function handlePostCreated(author: string, cid: string, zone: string, event: any) {
  try {
    await prisma.post.updateMany({
      where: { cid },
      data: { txHash: event?.log?.transactionHash ?? null, zone },
    });
  } catch (err) {
    logger.error({ err }, "Failed to update post by cid");
  }
}

async function handleOwnerChanged(node: string, owner: string) {
  // Store QNS ownership changes
  logger.info({ node, owner }, "QNS ownership changed");
  // In a real implementation, you'd update a QNS ownership table
}

async function handleResolverChanged(node: string, resolver: string) {
  logger.info({ node, resolver }, "QNS resolver changed");
  // Update resolver records
}

async function handleTTLChanged(node: string, ttl: bigint) {
  logger.info({ node, ttl: ttl.toString() }, "QNS TTL changed");
  // Update TTL records
}

async function handleCommit(commitHash: string, node: string, owner: string, secret: string, expiresAt: bigint) {
  logger.info({ commitHash, node, owner, expiresAt: expiresAt.toString() }, "QNS commit recorded");
  // Store commit records for reveal verification
}

async function handleReveal(commitHash: string, node: string, owner: string) {
  logger.info({ commitHash, node, owner }, "QNS reveal processed");
  // Process domain registration
}

async function handleAuctionStarted(node: string, startTime: bigint, endTime: bigint, startPrice: bigint, floorPrice: bigint) {
  logger.info({ node, startPrice: startPrice.toString(), floorPrice: floorPrice.toString() }, "QNS auction started");
  // Store auction data
}

async function handleBidPlaced(node: string, bidder: string, amount: bigint) {
  logger.info({ node, bidder, amount: amount.toString() }, "QNS bid placed");
  // Update auction bids
}

async function handleAuctionSettled(node: string, winner: string, finalPrice: bigint) {
  logger.info({ node, winner, finalPrice: finalPrice.toString() }, "QNS auction settled");
  // Process auction settlement
}

async function handleNameReserved(node: string, claimant: string, claimDeadline: bigint) {
  logger.info({ node, claimant, claimDeadline: claimDeadline.toString() }, "QNS name reserved");
  // Store reservation data
}

async function handleNameClaimed(node: string, claimant: string) {
  logger.info({ node, claimant }, "QNS reserved name claimed");
  // Process reservation claim
}

async function handleReservationRevoked(node: string) {
  logger.info({ node }, "QNS reservation revoked");
  // Remove reservation
}

async function handleNameMinted(node: string, tokenId: bigint, owner: string) {
  logger.info({ node, tokenId: tokenId.toString(), owner }, "QNS name minted as NFT");
  // Store NFT minting
}

async function handleNameTransferred(node: string, from: string, to: string) {
  logger.info({ node, from, to }, "QNS name transferred");
  // Update ownership
}

async function handlePaymentRecordSet(node: string, qiCode: string, primaryAddress: string) {
  logger.info({ node, qiCode, primaryAddress }, "QNS payment record set");
  // Store payment resolution data
}

async function handlePaymentRecordUpdated(node: string, qiCode: string) {
  logger.info({ node, qiCode }, "QNS payment record updated");
  // Update payment records
}

async function handleAddressAdded(node: string, chain: string, addr: string) {
  logger.info({ node, chain, addr }, "QNS chain address added");
  // Add chain-specific address
}

async function handlePaymentRecordDeactivated(node: string) {
  logger.info({ node }, "QNS payment record deactivated");
  // Deactivate payment record
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});



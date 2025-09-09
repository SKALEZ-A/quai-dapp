import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/client";
import { uploadJson } from "../services/ipfs";
import { verifyTypedData, keccak256, toHex } from "viem";

const router = Router();

const createPostSchema = z.object({
  authorAddress: z.string().min(1),
  text: z.string().min(1).max(5000),
  zone: z.string().optional(),
  issuedAt: z.number().int().positive(),
  nonce: z.string().regex(/^0x[0-9a-fA-F]{64}$/),
  signature: z.string().regex(/^0x[0-9a-fA-F]+$/),
});

router.get("/", async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit ?? 20), 1), 100);
  const cursor = typeof req.query.cursor === "string" ? req.query.cursor : undefined;
  const authorAddress = typeof req.query.authorAddress === "string" ? req.query.authorAddress.toLowerCase() : undefined;

  const where = authorAddress
    ? { author: { address: authorAddress } }
    : undefined;

  const posts = await prisma.post.findMany({
    take: limit,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    where,
    orderBy: { createdAt: "desc" },
    include: { author: true, likes: true, comments: true },
  });

  const nextCursor = posts.length === limit ? posts[posts.length - 1].id : null;
  res.json({ posts, nextCursor });
});

router.post("/", async (req, res) => {
  const parsed = createPostSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { authorAddress, text, zone, issuedAt, nonce, signature } = parsed.data;

  const textHash = keccak256(toHex(text));
  const domain = { name: "QuaiSocial", version: "1" } as const;
  const types = {
    Post: [
      { name: "author", type: "address" },
      { name: "textHash", type: "bytes32" },
      { name: "zone", type: "string" },
      { name: "issuedAt", type: "uint256" },
      { name: "nonce", type: "bytes32" },
    ],
  } as const;
  const message = {
    author: authorAddress,
    textHash,
    zone: zone ?? "",
    issuedAt,
    nonce,
  } as const;

  const ok = await verifyTypedData({
    address: authorAddress as `0x${string}`,
    domain,
    types,
    primaryType: "Post",
    message,
    signature: signature as `0x${string}`,
  });
  if (!ok) {
    return res.status(401).json({ error: "Invalid EIP-712 signature" });
  }

  // Ensure profile exists (address is unique identifier)
  const profile = await prisma.profile.upsert({
    where: { address: authorAddress.toLowerCase() },
    update: {},
    create: { address: authorAddress.toLowerCase() },
  });

  // Upload post body to IPFS
  const cid = await uploadJson("post.json", { text, author: authorAddress, zone, issuedAt, nonce, textHash });

  const post = await prisma.post.create({
    data: {
      authorId: profile.id,
      cid,
      textPreview: text.slice(0, 180),
      zone,
    },
    include: { author: true },
  });

  res.status(201).json({ post });
});

export default router;



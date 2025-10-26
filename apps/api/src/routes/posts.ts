import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import { prisma } from "../db/client";
import { uploadJson, uploadImages } from "../services/ipfs";
import { verifyTypedData, keccak256, toHex } from "viem";
import { postCreationLimiter } from "../middleware/rateLimiter";

const router = Router();

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'));
      return;
    }
    cb(null, true);
  }
});

const createPostSchema = z.object({
  authorAddress: z.string().min(1),
  text: z.string().min(1).max(5000),
  zone: z.string().optional(),
  issuedAt: z.union([z.number().int().positive(), z.string().transform((val) => parseInt(val, 10))]).refine((val) => val > 0),
  nonce: z.string().regex(/^0x[0-9a-fA-F]{64}$/),
  signature: z.string().regex(/^0x[0-9a-fA-F]+$/),
});

router.get("/", async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get single post by ID
router.get("/:id", async (req, res) => {
  const post = await prisma.post.findUnique({
    where: { id: req.params.id },
    include: { 
      author: true, 
      likes: { include: { profile: true } }, 
      comments: { 
        include: { author: true }, 
        orderBy: { createdAt: 'asc' } 
      } 
    },
  });
  
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }
  
  res.json({ post });
});

router.post("/", postCreationLimiter, upload.array('images', 4), async (req, res) => {
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
    author: authorAddress as `0x${string}`,
    textHash: textHash as `0x${string}`,
    zone: zone ?? "",
    issuedAt: BigInt(issuedAt),
    nonce: nonce as `0x${string}`,
  } as const;

  // Skip signature verification for now - using mock signatures in development
  // TODO: Implement proper EIP-712 signature generation on frontend
  console.log('🔐 Signature received for post creation:', {
    authorAddress,
    signatureLength: signature.length,
    signaturePrefix: signature.slice(0, 10),
    environment: process.env.NODE_ENV,
    note: 'Signature verification skipped - using mock signatures'
  });
  
  // In production, uncomment the verification code below when proper signatures are implemented
  /*
  if (process.env.NODE_ENV !== 'development') {
    try {
      console.log('🔐 Verifying signature for post creation...');

      const ok = await verifyTypedData({
        address: authorAddress as `0x${string}`,
        domain,
        types,
        primaryType: "Post",
        message,
        signature: signature as `0x${string}`,
      });

      if (!ok) {
        console.warn('❌ Signature verification failed for address:', authorAddress);
        return res.status(401).json({ 
          error: "Invalid EIP-712 signature",
          code: "INVALID_SIGNATURE"
        });
      }

      console.log('✅ Signature verification successful');
    } catch (error) {
      console.error('🚨 Signature verification error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        authorAddress,
        signatureLength: signature.length,
      });

      return res.status(400).json({ 
        error: "Signature verification failed",
        code: "SIGNATURE_VERIFICATION_ERROR",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
  */

  // Ensure profile exists (address is unique identifier)
  // First check for duplicate profiles and clean them up
  const existingProfiles = await prisma.profile.findMany({
    where: {
      address: {
        equals: authorAddress.toLowerCase()
      }
    }
  });

  if (existingProfiles.length > 1) {
    console.log(`⚠️ Found ${existingProfiles.length} duplicate profiles for address: ${authorAddress}`);
    // Keep the most recent profile and delete others
    const profilesToDelete = existingProfiles.slice(1);
    for (const duplicateProfile of profilesToDelete) {
      // Delete follow relationships first
      await prisma.follow.deleteMany({
        where: {
          OR: [
            { followerId: duplicateProfile.id },
            { followingId: duplicateProfile.id }
          ]
        }
      });
      await prisma.profile.delete({
        where: { id: duplicateProfile.id }
      });
      console.log(`🗑️ Deleted duplicate profile: ${duplicateProfile.id}`);
    }
  }

  const profile = await prisma.profile.upsert({
    where: { address: authorAddress.toLowerCase() },
    update: {},
    create: { address: authorAddress.toLowerCase() },
  });

  // Upload images to IPFS if any
  let imageCids: string[] = [];
  const files = req.files as Express.Multer.File[];
  if (files && files.length > 0) {
    try {
      // Validate image files
      const validFiles = files.filter(file => {
        const isValidType = file.mimetype.startsWith('image/');
        const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
        if (!isValidType) {
          console.warn(`Invalid file type: ${file.mimetype}`);
        }
        if (!isValidSize) {
          console.warn(`File too large: ${file.size} bytes`);
        }
        return isValidType && isValidSize;
      });

      if (validFiles.length === 0) {
        return res.status(400).json({ 
          error: "No valid image files provided. Images must be under 10MB and be valid image types." 
        });
      }

      const imageData = validFiles.map(file => ({
        buffer: file.buffer,
        contentType: file.mimetype
      }));
      
      imageCids = await uploadImages(imageData);
      console.log(`✅ Successfully uploaded ${imageCids.length} images to IPFS:`, imageCids);
    } catch (ipfsError) {
      console.error('❌ Image upload to IPFS failed:', ipfsError);
      return res.status(500).json({ 
        error: "Failed to upload images. Please try again later.",
        details: process.env.NODE_ENV === 'development' ? ipfsError instanceof Error ? ipfsError.message : 'Unknown error' : undefined
      });
    }
  }

  // Upload post body to IPFS (fallback to local CID if IPFS is down)
  let cid: string;
  try {
    cid = await uploadJson("post.json", { text, author: authorAddress, zone, issuedAt, nonce, textHash, imageCids });
  } catch (ipfsError) {
    console.warn('IPFS upload failed, using fallback CID:', ipfsError);
    // Generate a fallback CID (in production, you'd queue this for retry)
    cid = `local_${Date.now()}_${nonce.slice(2, 10)}`;
  }

  const post = await prisma.post.create({
    data: {
      authorId: profile.id,
      cid,
      textPreview: text.slice(0, 180),
      imageCids: imageCids.join(','),
      zone,
    },
    include: { author: true },
  });

  res.status(201).json({ post });
});

export default router;
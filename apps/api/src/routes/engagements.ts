import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import { prisma } from "../db/client";
import { uploadJson } from "../services/ipfs";
import { likeLimiter, commentLimiter } from "../middleware/rateLimiter";

const router = Router();

// Configure multer for comment image uploads (optional)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'));
      return;
    }
    cb(null, true);
  }
});

const likeSchema = z.object({
  profileAddress: z.string().min(1),
  postId: z.string().min(1),
});

router.post("/likes", likeLimiter, async (req, res) => {
  const parsed = likeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { profileAddress, postId } = parsed.data;

  const profile = await prisma.profile.upsert({
    where: { address: profileAddress.toLowerCase() },
    update: {},
    create: { address: profileAddress.toLowerCase() },
  });

  const like = await prisma.like.upsert({
    where: { profileId_postId: { profileId: profile.id, postId } },
    update: {},
    create: { profileId: profile.id, postId },
  });
  res.status(201).json({ like });
});

// Unlike a post
router.delete("/likes", async (req, res) => {
  const parsed = likeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { profileAddress, postId } = parsed.data;

  const profile = await prisma.profile.findUnique({ 
    where: { address: profileAddress.toLowerCase() } 
  });
  
  if (!profile) {
    return res.status(404).json({ error: "Profile not found" });
  }

  await prisma.like.delete({
    where: { profileId_postId: { profileId: profile.id, postId } }
  });
  
  res.json({ success: true });
});

const commentSchema = z.object({
  authorAddress: z.string().min(1),
  postId: z.string().min(1),
  text: z.string().min(1).max(2000),
  signature: z.string().regex(/^0x[0-9a-fA-F]+$/),
  issuedAt: z.number().int().positive(),
  nonce: z.string().regex(/^0x[0-9a-fA-F]{64}$/),
});

router.post("/comments", commentLimiter, upload.array('images', 4), async (req, res) => {
  const parsed = commentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { authorAddress, postId, text, signature, issuedAt, nonce } = parsed.data;

  // TODO: Add signature verification similar to posts
  // For now, skip in development mode
  
  const profile = await prisma.profile.upsert({
    where: { address: authorAddress.toLowerCase() },
    update: {},
    create: { address: authorAddress.toLowerCase() },
  });

  // Upload comment text to IPFS (with fallback)
  let cid: string;
  try {
    cid = await uploadJson("comment.json", { 
      text, 
      author: authorAddress, 
      postId, 
      issuedAt, 
      nonce 
    });
  } catch (ipfsError) {
    console.warn('Comment IPFS upload failed, using fallback CID:', ipfsError);
    cid = `local_comment_${Date.now()}_${nonce.slice(2, 10)}`;
  }

  // Generate text preview (first 200 characters)
  const textPreview = text.slice(0, 200);

  const comment = await prisma.comment.create({
    data: {
      authorId: profile.id,
      postId,
      cid,
      textPreview,
    },
    include: { author: true },
  });
  
  res.status(201).json({ comment });
});

export default router;



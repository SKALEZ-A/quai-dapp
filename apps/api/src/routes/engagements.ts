import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/client";

const router = Router();

const likeSchema = z.object({
  profileAddress: z.string().min(1),
  postId: z.string().min(1),
});

router.post("/likes", async (req, res) => {
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

const commentSchema = z.object({
  authorAddress: z.string().min(1),
  postId: z.string().min(1),
  textCid: z.string().min(1),
  textPreview: z.string().min(1).max(200).optional(),
});

router.post("/comments", async (req, res) => {
  const parsed = commentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { authorAddress, postId, textCid, textPreview } = parsed.data;

  const profile = await prisma.profile.upsert({
    where: { address: authorAddress.toLowerCase() },
    update: {},
    create: { address: authorAddress.toLowerCase() },
  });

  const comment = await prisma.comment.create({
    data: {
      authorId: profile.id,
      postId,
      cid: textCid,
      textPreview,
    },
    include: { author: true },
  });
  res.status(201).json({ comment });
});

export default router;



import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { profileUpdateLimiter } from '../middleware/rateLimiter';
import { uploadToPinata } from '../services/pinata';
import multer from 'multer';

const router = Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Simplified validation schema for profile updates (NO SIGNATURE REQUIRED)
const profileUpdateSchema = z.object({
  address: z.string().min(1),
  displayName: z.string().optional(),
  qnsName: z.string().optional(),
  bio: z.string().optional(),
  avatarCid: z.string().optional(),
  coverCid: z.string().optional(),
});

// GET /profiles/:address - Fetch profile by address
router.get('/:address', async (req, res) => {
  try {
    const { address } = req.params;

    const profile = await prisma.profile.findUnique({
      where: { address },
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /profiles - Update profile WITHOUT signature verification
router.put('/', profileUpdateLimiter, async (req, res) => {
  try {
    // Validate request body (NO SIGNATURE REQUIRED)
    const validatedData = profileUpdateSchema.parse(req.body);
    const { address, displayName, qnsName, bio, avatarCid, coverCid } = validatedData;

    console.log('✅ Profile update request (signature-free):', {
      address,
      displayName,
      qnsName,
      bio,
      avatarCid,
      coverCid
    });

    // Check if profile exists, create if not
    let profile = await prisma.profile.findUnique({
      where: { address },
    });

    const updateData: any = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (qnsName !== undefined) updateData.qnsName = qnsName;
    if (bio !== undefined) updateData.bio = bio;
    if (avatarCid !== undefined) updateData.avatarUrl = avatarCid;
    if (coverCid !== undefined) updateData.coverUrl = coverCid;

    if (profile) {
      // Update existing profile
      profile = await prisma.profile.update({
        where: { address },
        data: updateData,
        include: {
          _count: {
            select: {
              followers: true,
              following: true,
            },
          },
        },
      });
    } else {
      // Create new profile
      profile = await prisma.profile.create({
        data: {
          address,
          ...updateData,
        },
        include: {
          _count: {
            select: {
              followers: true,
              following: true,
            },
          },
        },
      });
    }

    console.log('✅ Profile updated successfully:', profile);
    res.json(profile);
  } catch (error) {
    console.error('Error updating profile:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// POST /profiles/upload - Upload image to Pinata and return CID
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const cid = await uploadToPinata(req.file.buffer, req.file.originalname);
    res.json({ cid });
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

export default router;
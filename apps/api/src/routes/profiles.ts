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

// GET /profiles/leaderboard - Get user leaderboard with post counts and engagement
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit ?? 20), 1), 100);
    const offset = Math.max(Number(req.query.offset ?? 0), 0);

    // Get all profiles with their post counts and engagement metrics
    const profiles = await prisma.profile.findMany({
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
        posts: {
          include: {
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Fallback ordering
      },
    });

    console.log('Found profiles:', profiles.length);

    // Calculate engagement scores for each profile
    const leaderboardData = profiles
      .map((profile) => {
        const postCount = profile._count.posts;
        const totalLikes = profile.posts.reduce((sum, post) => sum + post._count.likes, 0);
        const totalComments = profile.posts.reduce((sum, post) => sum + post._count.comments, 0);
        
        // Calculate engagement score: postCount + (totalLikes * 0.5) + (totalComments * 0.3)
        const engagementScore = postCount + (totalLikes * 0.5) + (totalComments * 0.3);

        return {
          profile: {
            id: profile.id,
            address: profile.address,
            qnsName: profile.qnsName,
            displayName: profile.displayName,
            avatarUrl: profile.avatarUrl,
            bio: profile.bio,
          },
          postCount,
          totalLikes,
          totalComments,
          engagementScore,
        };
      })
      .filter((entry) => entry.postCount > 0) // Only include users with posts
      .sort((a, b) => b.engagementScore - a.engagementScore) // Sort by engagement score
      .slice(offset, offset + limit)
      .map((entry, index) => ({
        rank: offset + index + 1,
        ...entry,
      }));

    res.json({
      leaderboard: leaderboardData,
      total: profiles.filter(p => p._count.posts > 0).length,
      hasMore: offset + limit < profiles.filter(p => p._count.posts > 0).length,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// GET /profiles/:address - Fetch profile by address
router.get('/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    // Normalize address to lowercase for consistent lookup
    const normalizedAddress = address.toLowerCase();

    const profile = await prisma.profile.findUnique({
      where: { address: normalizedAddress },
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

    // Check for duplicate profiles with same address (case-insensitive)
    const existingProfiles = await prisma.profile.findMany({
      where: {
        address: {
          equals: address,
          mode: 'insensitive'
        }
      }
    });

    if (existingProfiles.length > 1) {
      console.log(`⚠️ Found ${existingProfiles.length} duplicate profiles for address: ${address}`);
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
      // Update profile reference to the remaining one
      profile = existingProfiles[0];
    }

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
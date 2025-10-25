import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const followSchema = z.object({
  followerAddress: z.string().min(1),
  followingAddress: z.string().min(1),
});

// POST /follows - Follow a user
router.post('/', async (req, res) => {
  try {
    const { followerAddress, followingAddress } = followSchema.parse(req.body);

    // Check if already following
    const existingFollow = await prisma.follow.findFirst({
      where: {
        follower: { address: followerAddress },
        following: { address: followingAddress },
      },
    });

    if (existingFollow) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    // Get or create follower profile
    let followerProfile = await prisma.profile.findUnique({
      where: { address: followerAddress },
    });

    if (!followerProfile) {
      followerProfile = await prisma.profile.create({
        data: { address: followerAddress },
      });
    }

    // Get or create following profile
    let followingProfile = await prisma.profile.findUnique({
      where: { address: followingAddress },
    });

    if (!followingProfile) {
      followingProfile = await prisma.profile.create({
        data: { address: followingAddress },
      });
    }

    // Create follow relationship
    const follow = await prisma.follow.create({
      data: {
        followerId: followerProfile.id,
        followingId: followingProfile.id,
      },
      include: {
        follower: true,
        following: true,
      },
    });

    // Get updated counts
    const followerCount = await prisma.follow.count({
      where: { followerId: followerProfile.id },
    });

    const followingCount = await prisma.follow.count({
      where: { followingId: followingProfile.id },
    });

    res.json({
      success: true,
      follow,
      counts: {
        followers: followerCount,
        following: followingCount,
      },
    });
  } catch (error) {
    console.error('Error following user:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

// DELETE /follows/:followingAddress - Unfollow a user
router.delete('/:followingAddress', async (req, res) => {
  try {
    const { followingAddress } = req.params;
    const { followerAddress } = req.body;

    if (!followerAddress) {
      return res.status(400).json({ error: 'followerAddress is required' });
    }

    // Find the follow relationship
    const follow = await prisma.follow.findFirst({
      where: {
        follower: { address: followerAddress },
        following: { address: followingAddress },
      },
    });

    if (!follow) {
      return res.status(404).json({ error: 'Follow relationship not found' });
    }

    // Delete the follow relationship
    await prisma.follow.delete({
      where: { id: follow.id },
    });

    // Get updated counts
    const followerProfile = await prisma.profile.findUnique({
      where: { address: followerAddress },
    });

    const followingProfile = await prisma.profile.findUnique({
      where: { address: followingAddress },
    });

    const followerCount = followerProfile ? await prisma.follow.count({
      where: { followerId: followerProfile.id },
    }) : 0;

    const followingCount = followingProfile ? await prisma.follow.count({
      where: { followingId: followingProfile.id },
    }) : 0;

    res.json({
      success: true,
      counts: {
        followers: followerCount,
        following: followingCount,
      },
    });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

// GET /follows/followers/:address - Get user's followers
router.get('/followers/:address', async (req, res) => {
  try {
    const { address } = req.params;

    const profile = await prisma.profile.findUnique({
      where: { address },
      include: {
        followers: {
          include: {
            follower: {
              select: {
                id: true,
                address: true,
                displayName: true,
                avatarUrl: true,
                qnsName: true,
              },
            },
          },
        },
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

    res.json({
      followers: profile.followers.map(f => f.follower),
      count: profile._count.followers,
    });
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ error: 'Failed to fetch followers' });
  }
});

// GET /follows/following/:address - Get who user follows
router.get('/following/:address', async (req, res) => {
  try {
    const { address } = req.params;

    const profile = await prisma.profile.findUnique({
      where: { address },
      include: {
        following: {
          include: {
            following: {
              select: {
                id: true,
                address: true,
                displayName: true,
                avatarUrl: true,
                qnsName: true,
              },
            },
          },
        },
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

    res.json({
      following: profile.following.map(f => f.following),
      count: profile._count.following,
    });
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ error: 'Failed to fetch following' });
  }
});

// GET /follows/status/:followerAddress/:followingAddress - Check if user is following another user
router.get('/status/:followerAddress/:followingAddress', async (req, res) => {
  try {
    const { followerAddress, followingAddress } = req.params;

    const follow = await prisma.follow.findFirst({
      where: {
        follower: { address: followerAddress },
        following: { address: followingAddress },
      },
    });

    res.json({
      isFollowing: !!follow,
    });
  } catch (error) {
    console.error('Error checking follow status:', error);
    res.status(500).json({ error: 'Failed to check follow status' });
  }
});

export default router;

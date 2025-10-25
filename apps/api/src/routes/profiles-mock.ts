import { Router } from 'express';
import { z } from 'zod';
import { profileUpdateLimiter } from '../middleware/rateLimiter';
import { uploadToPinata } from '../services/pinata';
import multer from 'multer';

const router = Router();

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Simplified validation schema for profile updates (NO SIGNATURE REQUIRED)
const profileUpdateSchema = z.object({
  address: z.string().min(1),
  displayName: z.string().optional(),
  bio: z.string().optional(),
  avatarCid: z.string().optional(),
  coverCid: z.string().optional(),
});

// Mock profile storage (in-memory for testing)
const mockProfiles = new Map<string, any>();

// GET /profiles/:address - Fetch profile by address
router.get('/:address', async (req, res) => {
  try {
    const { address } = req.params;

    let profile = mockProfiles.get(address);
    
    if (!profile) {
      // Return default profile if not found
      profile = {
        id: `mock-${address}`,
        address,
        displayName: 'Quai User',
        bio: 'Exploring Quai Network and the Synq Superapp.',
        avatarUrl: '/assets/avatars/alice-chen.png',
        coverUrl: '/assets/pattern.png',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: {
          followers: 120,
          following: 85,
        },
      };
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
    const { address, displayName, bio, avatarCid, coverCid } = validatedData;

    console.log('✅ Profile update request (signature-free):', {
      address,
      displayName,
      bio,
      avatarCid,
      coverCid
    });

    // Get existing profile or create new one
    let profile = mockProfiles.get(address) || {
      id: `mock-${address}`,
      address,
      displayName: 'Quai User',
      bio: 'Exploring Quai Network and the Synq Superapp.',
      avatarUrl: '/assets/avatars/alice-chen.png',
      coverUrl: '/assets/pattern.png',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: {
        followers: 120,
        following: 85,
      },
    };

    // Update profile data
    if (displayName !== undefined) profile.displayName = displayName;
    if (bio !== undefined) profile.bio = bio;
    if (avatarCid !== undefined) profile.avatarUrl = avatarCid;
    if (coverCid !== undefined) profile.coverUrl = coverCid;
    
    profile.updatedAt = new Date().toISOString();

    // Store updated profile
    mockProfiles.set(address, profile);

    console.log('✅ Profile updated successfully (mock storage):', profile);
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

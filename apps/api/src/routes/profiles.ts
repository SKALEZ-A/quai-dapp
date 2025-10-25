import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { recoverTypedDataAddress } from 'viem';
import { profileUpdateLimiter } from '../middleware/rateLimiter';
import { uploadToPinata } from '../services/pinata';
import multer from 'multer';

const router = Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Validation schema for profile updates
const profileUpdateSchema = z.object({
  address: z.string().min(1),
  displayName: z.string().optional(),
  bio: z.string().optional(),
  avatarCid: z.string().optional(),
  coverCid: z.string().optional(),
  signature: z.string().min(1),
  domain: z.object({
    name: z.string(),
    version: z.string(),
    chainId: z.number().optional(),
  }),
  types: z.object({
    ProfileUpdate: z.array(z.object({
      name: z.string(),
      type: z.string(),
    })),
  }),
  primaryType: z.string(),
  message: z.object({
    address: z.string(),
    displayName: z.string().optional(),
    bio: z.string().optional(),
    avatarCid: z.string().optional(),
    coverCid: z.string().optional(),
    issuedAt: z.string(),
    nonce: z.string(),
  }),
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

// PUT /profiles - Update profile with EIP-712 signature verification
router.put('/', profileUpdateLimiter, async (req, res) => {
  try {
    // Validate request body
    const validatedData = profileUpdateSchema.parse(req.body);
    const { address, displayName, bio, avatarCid, coverCid, signature, domain, types, primaryType, message } = validatedData;

    // 🔍 Enhanced debug logging for signature verification
    console.log('🔍 Signature Verification Debug:', {
      address,
      signatureLength: signature.length,
      signaturePreview: signature.substring(0, 20) + '...',
      signatureEnd: '...' + signature.substring(signature.length - 20),
      domain,
      messageKeys: Object.keys(message),
      messageValues: {
        address: message.address,
        displayName: message.displayName,
        bio: message.bio,
        avatarCid: message.avatarCid,
        coverCid: message.coverCid,
        issuedAt: message.issuedAt,
        nonce: message.nonce
      },
      types,
      primaryType
    });

    // Verify EIP-712 signature using recoverTypedDataAddress for Pelagus compatibility
    let isValidSignature = false;
    let recoveredAddress = '';
    
    try {
      recoveredAddress = await recoverTypedDataAddress({
        domain,
        types,
        primaryType: primaryType as 'ProfileUpdate',
        message,
        signature: signature as `0x${string}`,
      });
      
      isValidSignature = recoveredAddress.toLowerCase() === address.toLowerCase();
      
      console.log('🔍 Signature recovery debug:', {
        recoveredAddress,
        claimedAddress: address,
        addressesMatch: isValidSignature,
        signatureLength: signature.length
      });
      
    } catch (error) {
      console.error('❌ Signature recovery failed:', error);
      return res.status(401).json({ 
        error: 'Invalid signature format', 
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    if (!isValidSignature) {
      return res.status(401).json({ 
        error: 'Invalid signature', 
        details: `Recovered address ${recoveredAddress} does not match claimed address ${address}`
      });
    }

    // Check if profile exists, create if not
    let profile = await prisma.profile.findUnique({
      where: { address },
    });

    const updateData: any = {};
    if (displayName !== undefined) updateData.displayName = displayName;
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
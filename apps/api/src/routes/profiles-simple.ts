import { Router } from 'express';

const router = Router();

// Simple mock profile data for testing
const mockProfile = {
  id: 'mock-profile-id',
  address: '0xe2f92e8f706997b021919a092437372b268a432d',
  qnsName: 'testuser.quai',
  displayName: 'Test User',
  avatarUrl: '/assets/avatars/alice-chen.png',
  coverUrl: '/assets/pattern.png',
  bio: 'Exploring Quai Network and the Synq Superapp.',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  _count: {
    followers: 120,
    following: 85,
  },
};

// GET /profiles/:address - Return mock profile
router.get('/:address', async (req, res) => {
  try {
    console.log('📋 Fetching profile for address:', req.params.address);
    res.json(mockProfile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /profiles - Mock profile update
router.put('/', async (req, res) => {
  try {
    console.log('📝 Profile update request:', req.body);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return updated mock profile
    const updatedProfile = {
      ...mockProfile,
      displayName: req.body.displayName || mockProfile.displayName,
      bio: req.body.bio || mockProfile.bio,
      avatarUrl: req.body.avatarCid || mockProfile.avatarUrl,
      coverUrl: req.body.coverCid || mockProfile.coverUrl,
      updatedAt: new Date().toISOString(),
    };
    
    res.json(updatedProfile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// POST /profiles/upload - Mock image upload
router.post('/upload', async (req, res) => {
  try {
    console.log('📤 Mock image upload');
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock CID
    const mockCid = 'bafkrei' + Math.random().toString(36).substring(2, 15);
    res.json({ cid: mockCid });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

export default router;

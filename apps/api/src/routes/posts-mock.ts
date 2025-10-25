import { Router } from 'express';

const router = Router();

// Mock posts data that matches your existing posts
const mockPosts = [
  {
    id: 'post-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    authorId: 'profile-1',
    cid: 'bafkreiabc123',
    textPreview: 'Just discovered the amazing potential of Quai Network! The parallel processing capabilities are incredible. 🚀',
    imageCids: ['bafkreiimg1', 'bafkreiimg2'],
    zone: 'cyprus-1',
    txHash: '0x1234567890abcdef',
    author: {
      id: 'profile-1',
      address: '0xe2f92e8f706997b021919a092437372b268a432d',
      qnsName: 'alice.quai',
      displayName: 'Alice Chen',
      avatarUrl: '/assets/avatars/alice-chen.png',
      bio: 'Quai Network enthusiast and blockchain developer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    likes: [
      { id: 'like-1', profileId: 'profile-2', postId: 'post-1' },
      { id: 'like-2', profileId: 'profile-3', postId: 'post-1' },
    ],
    comments: [
      {
        id: 'comment-1',
        content: 'Amazing insights! Quai is definitely the future.',
        author: {
          id: 'profile-2',
          address: '0xb1234567890abcdef1234567890abcdef1234567',
          displayName: 'Bob Wilson',
          avatarUrl: '/assets/avatars/bob-wilson.png',
        },
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'post-2',
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    authorId: 'profile-1',
    cid: 'bafkreidef456',
    textPreview: 'Building on Quai Network has been a game-changer for our dApp. The transaction throughput is unmatched!',
    imageCids: ['bafkreiimg3'],
    zone: 'cyprus-1',
    txHash: '0xabcdef1234567890',
    author: {
      id: 'profile-1',
      address: '0xe2f92e8f706997b021919a092437372b268a432d',
      qnsName: 'alice.quai',
      displayName: 'Alice Chen',
      avatarUrl: '/assets/avatars/alice-chen.png',
      bio: 'Quai Network enthusiast and blockchain developer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    likes: [
      { id: 'like-3', profileId: 'profile-3', postId: 'post-2' },
    ],
    comments: [],
  },
  {
    id: 'post-3',
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    authorId: 'profile-1',
    cid: 'bafkreighi789',
    textPreview: 'The Quai ecosystem is growing rapidly! Excited to see what the future holds for parallel blockchains.',
    imageCids: [],
    zone: 'cyprus-1',
    txHash: '0x9876543210fedcba',
    author: {
      id: 'profile-1',
      address: '0xe2f92e8f706997b021919a092437372b268a432d',
      qnsName: 'alice.quai',
      displayName: 'Alice Chen',
      avatarUrl: '/assets/avatars/alice-chen.png',
      bio: 'Quai Network enthusiast and blockchain developer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    likes: [
      { id: 'like-4', profileId: 'profile-2', postId: 'post-3' },
      { id: 'like-5', profileId: 'profile-3', postId: 'post-3' },
      { id: 'like-6', profileId: 'profile-4', postId: 'post-3' },
    ],
    comments: [
      {
        id: 'comment-2',
        content: 'Couldn\'t agree more! The potential is limitless.',
        author: {
          id: 'profile-3',
          address: '0xc1234567890abcdef1234567890abcdef1234567',
          displayName: 'Carol Davis',
          avatarUrl: '/assets/avatars/carol-davis.png',
        },
        createdAt: new Date().toISOString(),
      },
    ],
  },
];

// GET /posts - Return mock posts
router.get('/', async (req, res) => {
  try {
    console.log('📋 Fetching mock posts');
    const { limit = 10, cursor } = req.query;
    
    let posts = mockPosts;
    
    if (cursor) {
      const cursorIndex = posts.findIndex(p => p.id === cursor);
      if (cursorIndex !== -1) {
        posts = posts.slice(cursorIndex + 1);
      }
    }
    
    posts = posts.slice(0, parseInt(limit as string));
    const nextCursor = posts.length === parseInt(limit as string) ? posts[posts.length - 1].id : null;
    
    res.json({ posts, nextCursor });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// POST /posts - Mock post creation
router.post('/', async (req, res) => {
  try {
    console.log('📝 Creating mock post:', req.body);
    
    const newPost = {
      id: `post-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: 'profile-1',
      cid: 'bafkrei' + Math.random().toString(36).substring(2, 15),
      textPreview: req.body.text || 'New post content',
      imageCids: req.body.images || [],
      zone: req.body.zone || 'cyprus-1',
      txHash: '0x' + Math.random().toString(16).substring(2, 10),
      author: {
        id: 'profile-1',
        address: '0xe2f92e8f706997b021919a092437372b268a432d',
        qnsName: 'alice.quai',
        displayName: 'Alice Chen',
        avatarUrl: '/assets/avatars/alice-chen.png',
        bio: 'Quai Network enthusiast and blockchain developer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      likes: [],
      comments: [],
    };
    
    // Add to beginning of mock posts
    mockPosts.unshift(newPost);
    
    res.json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

export default router;

import { Router } from 'express';
import { prisma } from '../db/client';

const router = Router();

// Emergency endpoint to clear database
router.post('/clear-database', async (req, res) => {
  try {
    console.log('🗑️  CLEARING RAILWAY DATABASE...\n');
    
    // Clear in correct order to respect foreign key constraints
    console.log('1. Deleting Likes...');
    const likeCount = await prisma.like.deleteMany();
    console.log(`   ✅ Deleted ${likeCount.count} likes`);
    
    console.log('2. Deleting Comments...');
    const commentCount = await prisma.comment.deleteMany();
    console.log(`   ✅ Deleted ${commentCount.count} comments`);
    
    console.log('3. Deleting Follows...');
    const followCount = await prisma.follow.deleteMany();
    console.log(`   ✅ Deleted ${followCount.count} follows`);
    
    console.log('4. Deleting Posts...');
    const postCount = await prisma.post.deleteMany();
    console.log(`   ✅ Deleted ${postCount.count} posts`);
    
    console.log('5. Deleting Profiles...');
    const profileCount = await prisma.profile.deleteMany();
    console.log(`   ✅ Deleted ${profileCount.count} profiles`);
    
    console.log('\n🎉 DATABASE CLEARED SUCCESSFULLY!');
    
    res.json({
      success: true,
      message: 'Database cleared successfully',
      summary: {
        likes: likeCount.count,
        comments: commentCount.count,
        follows: followCount.count,
        posts: postCount.count,
        profiles: profileCount.count
      }
    });
    
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear database',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

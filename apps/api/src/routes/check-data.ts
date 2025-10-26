import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Temporary endpoint to check data before clearing
router.get('/check-data', async (req, res) => {
  try {
    console.log('📊 Checking Railway data...');
    
    const profileCount = await prisma.profile.count();
    const postCount = await prisma.post.count();
    const commentCount = await prisma.comment.count();
    const likeCount = await prisma.like.count();
    const followCount = await prisma.follow.count();
    
    const total = profileCount + postCount + commentCount + likeCount + followCount;
    
    const data = {
      summary: {
        profiles: profileCount,
        posts: postCount,
        comments: commentCount,
        likes: likeCount,
        follows: followCount,
        total
      },
      recommendation: total === 0 ? 'Database is empty - safe to clear' : 
                     total < 5 ? 'Small amount of data - consider if worth saving' :
                     'Significant data - make sure you want to lose this!'
    };
    
    console.log('📈 Data Summary:', data.summary);
    console.log('💡 Recommendation:', data.recommendation);
    
    res.json(data);
    
  } catch (error: any) {
    console.log('❌ Error checking data:', error.message);
    
    if (error.message && (error.message.includes('P2023') || error.message.includes('converting field'))) {
      res.json({
        error: 'P2023 Data Format Error',
        message: 'Data exists but has incompatible format - confirms need to clear database',
        recommendation: 'Clear the database to fix format issues'
      });
    } else {
      res.status(500).json({ error: error.message || 'Unknown error occurred' });
    }
  }
});

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
    
  } catch (error: any) {
    console.error('❌ Error clearing database:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear database',
      details: error.message || 'Unknown error'
    });
  }
});

export default router;

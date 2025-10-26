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

export default router;

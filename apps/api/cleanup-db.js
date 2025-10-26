const { PrismaClient } = require('@prisma/client');

async function cleanupDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧹 Starting Database Cleanup...\n');
    
    // 1. Remove Alice Chen test data
    console.log('🗑️ Removing Alice Chen test data...');
    
    // First, get Alice Chen's profile
    const aliceProfile = await prisma.profile.findFirst({
      where: {
        OR: [
          { displayName: 'Alice Chen' },
          { qnsName: 'alice.quai' }
        ]
      }
    });
    
    if (aliceProfile) {
      console.log(`   Found Alice Chen profile: ${aliceProfile.id}`);
      
      // First, delete all comments on Alice Chen's posts
      const alicePosts = await prisma.post.findMany({
        where: { authorId: aliceProfile.id },
        select: { id: true }
      });
      
      for (const post of alicePosts) {
        await prisma.comment.deleteMany({
          where: { postId: post.id }
        });
      }
      console.log(`   Deleted comments on Alice Chen's posts`);
      
      // Delete all likes on Alice Chen's posts
      for (const post of alicePosts) {
        await prisma.like.deleteMany({
          where: { postId: post.id }
        });
      }
      console.log(`   Deleted likes on Alice Chen's posts`);
      
      // Delete all comments by Alice Chen
      const deletedComments = await prisma.comment.deleteMany({
        where: { authorId: aliceProfile.id }
      });
      console.log(`   Deleted ${deletedComments.count} comments by Alice Chen`);
      
      // Delete all likes by Alice Chen
      const deletedLikes = await prisma.like.deleteMany({
        where: { profileId: aliceProfile.id }
      });
      console.log(`   Deleted ${deletedLikes.count} likes by Alice Chen`);
      
      // Delete all follow relationships involving Alice Chen
      const deletedFollows = await prisma.follow.deleteMany({
        where: {
          OR: [
            { followerId: aliceProfile.id },
            { followingId: aliceProfile.id }
          ]
        }
      });
      console.log(`   Deleted ${deletedFollows.count} follow relationships`);
      
      // Now delete Alice Chen's posts
      const deletedPosts = await prisma.post.deleteMany({
        where: { authorId: aliceProfile.id }
      });
      console.log(`   Deleted ${deletedPosts.count} posts by Alice Chen`);
      
      // Finally, delete Alice Chen's profile
      await prisma.profile.delete({
        where: { id: aliceProfile.id }
      });
      console.log(`   Deleted Alice Chen profile`);
    } else {
      console.log('   Alice Chen profile not found');
    }
    
    // 2. Clean up profiles with no meaningful data
    console.log('\n🧹 Cleaning up empty profiles...');
    
    const emptyProfiles = await prisma.profile.findMany({
      where: {
        AND: [
          { displayName: null },
          { qnsName: null },
          { avatarUrl: null },
          { bio: null }
        ]
      },
      include: {
        _count: {
          select: {
            posts: true,
            likes: true,
            comments: true
          }
        }
      }
    });
    
    for (const profile of emptyProfiles) {
      if (profile._count.posts === 0 && profile._count.likes === 0 && profile._count.comments === 0) {
        // Delete follow relationships first
        await prisma.follow.deleteMany({
          where: {
            OR: [
              { followerId: profile.id },
              { followingId: profile.id }
            ]
          }
        });
        
        await prisma.profile.delete({
          where: { id: profile.id }
        });
        console.log(`   Deleted empty profile: ${profile.address}`);
      }
    }
    
    // 3. Fix profile data for your real users
    console.log('\n🔧 Fixing profile data for real users...');
    
    // Update AURACLE profile
    const auracleProfile = await prisma.profile.findFirst({
      where: { qnsName: 'auracle.defi' }
    });
    
    if (auracleProfile) {
      console.log(`   AURACLE profile found: ${auracleProfile.id}`);
      console.log(`   Display Name: ${auracleProfile.displayName}`);
      console.log(`   Avatar URL: ${auracleProfile.avatarUrl}`);
    }
    
    // Update Baddest Dev profile
    const baddestDevProfile = await prisma.profile.findFirst({
      where: { qnsName: 'skalezDgreat' }
    });
    
    if (baddestDevProfile) {
      console.log(`   Baddest Dev profile found: ${baddestDevProfile.id}`);
      console.log(`   Display Name: ${baddestDevProfile.displayName}`);
      console.log(`   Avatar URL: ${baddestDevProfile.avatarUrl}`);
    }
    
    // 4. Check final state
    console.log('\n📊 Final Database State:');
    
    const finalProfiles = await prisma.profile.findMany({
      include: {
        _count: {
          select: {
            posts: true,
            likes: true,
            comments: true
          }
        }
      }
    });
    
    console.log(`\nTotal Profiles: ${finalProfiles.length}`);
    
    finalProfiles.forEach((profile, index) => {
      console.log(`\n${index + 1}. ${profile.displayName || profile.qnsName || 'Unnamed'}`);
      console.log(`   Address: ${profile.address}`);
      console.log(`   Posts: ${profile._count.posts}`);
      console.log(`   Likes: ${profile._count.likes}`);
      console.log(`   Comments: ${profile._count.comments}`);
    });
    
    console.log('\n✅ Database cleanup completed!');
    
  } catch (error) {
    console.error('❌ Cleanup Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDatabase();

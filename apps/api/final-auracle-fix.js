const { PrismaClient } = require('@prisma/client');

async function finalAuracleFix() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Final AURACLE Fix...\n');
    
    // First, delete the profile without posts (the one with QNS name)
    const profileWithoutPosts = await prisma.profile.findFirst({
      where: {
        address: '0x0002567655a581a53ADf543E25dD384097EA196c',
        displayName: 'AURACLE'
      }
    });
    
    if (profileWithoutPosts) {
      console.log(`🗑️ Deleting profile without posts: ${profileWithoutPosts.id}`);
      
      // Delete follow relationships first
      await prisma.follow.deleteMany({
        where: {
          OR: [
            { followerId: profileWithoutPosts.id },
            { followingId: profileWithoutPosts.id }
          ]
        }
      });
      
      await prisma.profile.delete({
        where: { id: profileWithoutPosts.id }
      });
      
      console.log('✅ Deleted profile without posts');
    }
    
    // Now update the profile with posts
    const profileWithPosts = await prisma.profile.findFirst({
      where: {
        address: '0x0002567655a581a53adf543e25dd384097ea196c'
      }
    });
    
    if (profileWithPosts) {
      console.log(`\n🔄 Updating profile with posts: ${profileWithPosts.id}`);
      
      await prisma.profile.update({
        where: { id: profileWithPosts.id },
        data: {
          displayName: 'AURACLE',
          qnsName: 'auracle.defi',
          avatarUrl: 'QmV1tQnxVehEoQofZgofmYUkqnrGnLkvA7xJTrssuUmE4B',
          bio: 'Exploring Quai Network and the Synq Superapp.'
        }
      });
      
      console.log('✅ Updated profile with posts to have AURACLE data');
    }
    
    // Final verification
    const finalProfile = await prisma.profile.findFirst({
      where: {
        address: '0x0002567655a581a53adf543e25dd384097ea196c'
      },
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    });
    
    if (finalProfile) {
      console.log('\n📊 Final AURACLE Profile:');
      console.log(`   ID: ${finalProfile.id}`);
      console.log(`   Address: ${finalProfile.address}`);
      console.log(`   Display Name: ${finalProfile.displayName}`);
      console.log(`   QNS Name: ${finalProfile.qnsName}`);
      console.log(`   Avatar: ${finalProfile.avatarUrl}`);
      console.log(`   Bio: ${finalProfile.bio}`);
      console.log(`   Posts: ${finalProfile._count.posts}`);
    }
    
    console.log('\n✅ Final AURACLE fix completed!');
    
  } catch (error) {
    console.error('❌ Final AURACLE Fix Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

finalAuracleFix();

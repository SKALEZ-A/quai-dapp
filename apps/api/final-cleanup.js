const { PrismaClient } = require('@prisma/client');

async function finalCleanup() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Final Database Cleanup...\n');
    
    // First, delete the duplicate Baddest Dev profile (the one without posts)
    const duplicateProfile = await prisma.profile.findFirst({
      where: {
        address: '0x003DAC94805c77d7fD485cd415F8078414d171e4',
        displayName: 'Baddest Dev'
      }
    });
    
    if (duplicateProfile) {
      console.log(`🗑️ Deleting duplicate Baddest Dev profile: ${duplicateProfile.id}`);
      
      // Delete follow relationships first
      await prisma.follow.deleteMany({
        where: {
          OR: [
            { followerId: duplicateProfile.id },
            { followingId: duplicateProfile.id }
          ]
        }
      });
      
      await prisma.profile.delete({
        where: { id: duplicateProfile.id }
      });
      
      console.log('✅ Deleted duplicate profile');
    }
    
    // Now update the profile with posts
    const profileWithPosts = await prisma.profile.findFirst({
      where: {
        address: '0x003dac94805c77d7fd485cd415f8078414d171e4',
        displayName: null
      }
    });
    
    if (profileWithPosts) {
      console.log(`\n🔄 Updating profile with posts: ${profileWithPosts.id}`);
      
      await prisma.profile.update({
        where: { id: profileWithPosts.id },
        data: {
          displayName: 'Baddest Dev',
          qnsName: 'skalezDgreat',
          bio: 'GOD IS THE GREATEST. ✝️☪️',
          avatarUrl: 'QmcWVsRrZkMuM76ukqHhBBz4EbmWRn9fozNhw43fyQAiby'
        }
      });
      
      console.log('✅ Updated profile with Baddest Dev data');
    }
    
    // Clean up any other empty profiles
    console.log('\n🧹 Cleaning up remaining empty profiles...');
    
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
    
    // Final state check
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
      console.log(`   Display Name: ${profile.displayName || 'Not set'}`);
      console.log(`   QNS Name: ${profile.qnsName || 'Not set'}`);
      console.log(`   Avatar URL: ${profile.avatarUrl || 'Not set'}`);
      console.log(`   Posts: ${profile._count.posts}`);
      console.log(`   Likes: ${profile._count.likes}`);
      console.log(`   Comments: ${profile._count.comments}`);
    });
    
    console.log('\n✅ Final cleanup completed!');
    
  } catch (error) {
    console.error('❌ Final Cleanup Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

finalCleanup();

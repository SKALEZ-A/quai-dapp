const { PrismaClient } = require('@prisma/client');

async function updateBaddestDevPosts() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Updating Baddest Dev Profile with Posts...\n');
    
    // Find the profile with posts (the one that's missing data)
    const profileWithPosts = await prisma.profile.findFirst({
      where: {
        address: '0x003dac94805c77d7fd485cd415f8078414d171e4',
        displayName: null
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
    
    if (profileWithPosts) {
      console.log(`Found profile with posts: ${profileWithPosts.id}`);
      console.log(`Posts: ${profileWithPosts._count.posts}`);
      console.log(`Likes: ${profileWithPosts._count.likes}`);
      console.log(`Comments: ${profileWithPosts._count.comments}`);
      
      // Update this profile with Baddest Dev data
      console.log('\n🔄 Updating profile with Baddest Dev data...');
      
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
      
      // Now delete the duplicate profile (the one without posts)
      const duplicateProfile = await prisma.profile.findFirst({
        where: {
          address: '0x003DAC94805c77d7fD485cd415F8078414d171e4',
          displayName: 'Baddest Dev'
        }
      });
      
      if (duplicateProfile) {
        console.log('\n🗑️ Deleting duplicate profile...');
        
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
    } else {
      console.log('Profile with posts not found');
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
    
    console.log('\n✅ Baddest Dev profile with posts updated!');
    
  } catch (error) {
    console.error('❌ Profile Update Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateBaddestDevPosts();

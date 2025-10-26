const { PrismaClient } = require('@prisma/client');

async function fixBaddestDev() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Fixing Baddest Dev Profile...\n');
    
    // Find the two profiles for the same address
    const profiles = await prisma.profile.findMany({
      where: {
        address: '0x003dac94805c77d7fd485cd415f8078414d171e4'
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
    
    console.log(`Found ${profiles.length} profiles for Baddest Dev's address`);
    
    profiles.forEach((profile, index) => {
      console.log(`\n${index + 1}. Profile ID: ${profile.id}`);
      console.log(`   Display Name: ${profile.displayName || 'Not set'}`);
      console.log(`   QNS Name: ${profile.qnsName || 'Not set'}`);
      console.log(`   Avatar URL: ${profile.avatarUrl || 'Not set'}`);
      console.log(`   Posts: ${profile._count.posts}`);
      console.log(`   Likes: ${profile._count.likes}`);
      console.log(`   Comments: ${profile._count.comments}`);
    });
    
    if (profiles.length === 2) {
      // Find the profile with posts (the active one)
      const activeProfile = profiles.find(p => p._count.posts > 0);
      const profileWithData = profiles.find(p => p.displayName === 'Baddest Dev');
      
      if (activeProfile && profileWithData) {
        console.log(`\n🎯 Active profile (with posts): ${activeProfile.id}`);
        console.log(`🎯 Profile with data: ${profileWithData.id}`);
        
        // Update the active profile with the profile data
        console.log('\n🔄 Updating active profile with Baddest Dev data...');
        
        await prisma.profile.update({
          where: { id: activeProfile.id },
          data: {
            displayName: 'Baddest Dev',
            qnsName: 'skalezDgreat',
            bio: 'GOD IS THE GREATEST. ✝️☪️',
            avatarUrl: 'QmcWVsRrZkMuM76ukqHhBBz4EbmWRn9fozNhw43fyQAiby'
          }
        });
        
        console.log('✅ Updated active profile with Baddest Dev data');
        
        // Delete the duplicate profile
        console.log('\n🗑️ Deleting duplicate profile...');
        
        // Delete follow relationships first
        await prisma.follow.deleteMany({
          where: {
            OR: [
              { followerId: profileWithData.id },
              { followingId: profileWithData.id }
            ]
          }
        });
        
        await prisma.profile.delete({
          where: { id: profileWithData.id }
        });
        
        console.log('✅ Deleted duplicate profile');
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
    
    console.log('\n✅ Baddest Dev profile fixed!');
    
  } catch (error) {
    console.error('❌ Profile Fixing Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixBaddestDev();

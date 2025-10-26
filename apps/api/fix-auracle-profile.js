const { PrismaClient } = require('@prisma/client');

async function fixAuracleProfile() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Fixing AURACLE Profile...\n');
    
    // Find the two AURACLE profiles
    const auracleProfiles = await prisma.profile.findMany({
      where: {
        address: '0x0002567655a581a53adf543e25dd384097ea196c'
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
    
    console.log(`Found ${auracleProfiles.length} AURACLE profiles:`);
    
    auracleProfiles.forEach((profile, index) => {
      console.log(`\n${index + 1}. Profile ID: ${profile.id}`);
      console.log(`   Display Name: ${profile.displayName || 'Not set'}`);
      console.log(`   QNS Name: ${profile.qnsName || 'Not set'}`);
      console.log(`   Avatar: ${profile.avatarUrl || 'Not set'}`);
      console.log(`   Posts: ${profile._count.posts}`);
      console.log(`   Likes: ${profile._count.likes}`);
      console.log(`   Comments: ${profile._count.comments}`);
    });
    
    if (auracleProfiles.length === 2) {
      // Find the profile with posts (the one missing data)
      const profileWithPosts = auracleProfiles.find(p => p._count.posts > 0);
      const profileWithData = auracleProfiles.find(p => p.displayName === 'AURACLE');
      
      if (profileWithPosts && profileWithData) {
        console.log(`\n🎯 Profile with posts: ${profileWithPosts.id}`);
        console.log(`🎯 Profile with data: ${profileWithData.id}`);
        
        // Update the profile with posts to have the proper data
        console.log('\n🔄 Updating profile with posts to have AURACLE data...');
        
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
        
        // Delete the duplicate profile (the one without posts)
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
    console.log('\n📊 Final AURACLE State:');
    
    const finalAuracleProfile = await prisma.profile.findFirst({
      where: {
        address: '0x0002567655a581a53adf543e25dd384097ea196c'
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
    
    if (finalAuracleProfile) {
      console.log(`\nFinal AURACLE Profile:`);
      console.log(`   ID: ${finalAuracleProfile.id}`);
      console.log(`   Address: ${finalAuracleProfile.address}`);
      console.log(`   Display Name: ${finalAuracleProfile.displayName || 'Not set'}`);
      console.log(`   QNS Name: ${finalAuracleProfile.qnsName || 'Not set'}`);
      console.log(`   Avatar: ${finalAuracleProfile.avatarUrl || 'Not set'}`);
      console.log(`   Posts: ${finalAuracleProfile._count.posts}`);
      console.log(`   Likes: ${finalAuracleProfile._count.likes}`);
      console.log(`   Comments: ${finalAuracleProfile._count.comments}`);
    }
    
    console.log('\n✅ AURACLE profile fixed!');
    
  } catch (error) {
    console.error('❌ AURACLE Fix Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAuracleProfile();

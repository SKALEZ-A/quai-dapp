const { PrismaClient } = require('@prisma/client');

async function deleteAuracleDuplicate() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Deleting AURACLE Duplicate Profile...\n');
    
    // Find all profiles with auracle.defi QNS name
    const auracleProfiles = await prisma.profile.findMany({
      where: {
        qnsName: 'auracle.defi'
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
    
    console.log(`Found ${auracleProfiles.length} profiles with auracle.defi QNS name:`);
    
    auracleProfiles.forEach((profile, index) => {
      console.log(`\n${index + 1}. Profile ID: ${profile.id}`);
      console.log(`   Address: ${profile.address}`);
      console.log(`   Display Name: ${profile.displayName || 'Not set'}`);
      console.log(`   QNS Name: ${profile.qnsName || 'Not set'}`);
      console.log(`   Avatar: ${profile.avatarUrl || 'Not set'}`);
      console.log(`   Posts: ${profile._count.posts}`);
      console.log(`   Likes: ${profile._count.likes}`);
      console.log(`   Comments: ${profile._count.comments}`);
    });
    
    if (auracleProfiles.length > 1) {
      // Find the profile without posts (the duplicate)
      const duplicateProfile = auracleProfiles.find(p => p._count.posts === 0);
      
      if (duplicateProfile) {
        console.log(`\n🗑️ Deleting duplicate profile: ${duplicateProfile.id}`);
        
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
    }
    
    // Now update the remaining profile
    const remainingProfile = await prisma.profile.findFirst({
      where: {
        address: '0x0002567655a581a53adf543e25dd384097ea196c'
      }
    });
    
    if (remainingProfile) {
      console.log(`\n🔄 Updating remaining profile: ${remainingProfile.id}`);
      
      await prisma.profile.update({
        where: { id: remainingProfile.id },
        data: {
          displayName: 'AURACLE',
          qnsName: 'auracle.defi',
          avatarUrl: 'QmV1tQnxVehEoQofZgofmYUkqnrGnLkvA7xJTrssuUmE4B',
          bio: 'Exploring Quai Network and the Synq Superapp.'
        }
      });
      
      console.log('✅ Updated remaining profile with AURACLE data');
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
    
    console.log('\n✅ AURACLE duplicate deletion completed!');
    
  } catch (error) {
    console.error('❌ AURACLE Duplicate Deletion Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAuracleDuplicate();

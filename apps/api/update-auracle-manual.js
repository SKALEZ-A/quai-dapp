const { PrismaClient } = require('@prisma/client');

async function updateAuracleManual() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Manually Updating AURACLE Profile...\n');
    
    // Find the AURACLE profile with posts
    const auracleProfile = await prisma.profile.findFirst({
      where: {
        address: '0x0002567655a581a53adf543e25dd384097ea196c'
      }
    });
    
    if (auracleProfile) {
      console.log(`Found AURACLE profile: ${auracleProfile.id}`);
      console.log(`Current Display Name: ${auracleProfile.displayName || 'Not set'}`);
      console.log(`Current QNS Name: ${auracleProfile.qnsName || 'Not set'}`);
      console.log(`Current Avatar: ${auracleProfile.avatarUrl || 'Not set'}`);
      
      // Update with proper AURACLE data
      console.log('\n🔄 Updating with AURACLE data...');
      
      await prisma.profile.update({
        where: { id: auracleProfile.id },
        data: {
          displayName: 'AURACLE',
          qnsName: 'auracle.defi',
          avatarUrl: 'QmV1tQnxVehEoQofZgofmYUkqnrGnLkvA7xJTrssuUmE4B',
          bio: 'Exploring Quai Network and the Synq Superapp.'
        }
      });
      
      console.log('✅ Updated AURACLE profile with proper data');
      
      // Verify the update
      const updatedProfile = await prisma.profile.findUnique({
        where: { id: auracleProfile.id },
        include: {
          _count: {
            select: {
              posts: true
            }
          }
        }
      });
      
      console.log('\n📊 Updated AURACLE Profile:');
      console.log(`   ID: ${updatedProfile.id}`);
      console.log(`   Address: ${updatedProfile.address}`);
      console.log(`   Display Name: ${updatedProfile.displayName}`);
      console.log(`   QNS Name: ${updatedProfile.qnsName}`);
      console.log(`   Avatar: ${updatedProfile.avatarUrl}`);
      console.log(`   Bio: ${updatedProfile.bio}`);
      console.log(`   Posts: ${updatedProfile._count.posts}`);
      
    } else {
      console.log('AURACLE profile not found');
    }
    
    console.log('\n✅ AURACLE manual update completed!');
    
  } catch (error) {
    console.error('❌ AURACLE Manual Update Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAuracleManual();

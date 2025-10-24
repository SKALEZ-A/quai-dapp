// Quick test to verify Prisma client generation
const { PrismaClient } = require('./src/generated/prisma');

async function testPrisma() {
  try {
    const prisma = new PrismaClient();
    console.log('✅ Prisma client loaded successfully');
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    await prisma.$disconnect();
    console.log('✅ Prisma test completed successfully');
  } catch (error) {
    console.error('❌ Prisma test failed:', error.message);
    process.exit(1);
  }
}

testPrisma();

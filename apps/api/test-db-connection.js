const { Pool } = require('pg');
require('dotenv').config();

// Get connection string from .env
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL not found in .env file');
  process.exit(1);
}

console.log('🔍 Testing Supabase PostgreSQL Connection...\n');
console.log('Connection string:', connectionString.replace(/:[^:@]+@/, ':****@'));
console.log('');

const pool = new Pool({
  connectionString,
  ssl: false
});

async function testConnection() {
  let client;
  try {
    console.log('1️⃣  Connecting to database...');
    client = await pool.connect();
    console.log('   ✅ Connection established!\n');
    
    console.log('2️⃣  Testing query...');
    const versionResult = await client.query('SELECT version()');
    console.log('   ✅ Query successful!');
    console.log('   📊 PostgreSQL:', versionResult.rows[0].version.split(',')[0]);
    console.log('');
    
    console.log('3️⃣  Checking current schema...');
    const schemaResult = await client.query('SELECT current_schema()');
    console.log('   ✅ Schema:', schemaResult.rows[0].current_schema);
    console.log('');
    
    console.log('4️⃣  Listing existing tables...');
    const tablesResult = await client.query(`
      SELECT table_name, table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log('   ⚠️  No tables found (database is empty)');
      console.log('   💡 Run: pnpx prisma db push --schema=./prisma/schema.prisma');
    } else {
      console.log(`   ✅ Found ${tablesResult.rows.length} table(s):`);
      tablesResult.rows.forEach(row => {
        console.log(`      - ${row.table_name} (${row.table_type})`);
      });
    }
    console.log('');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ DATABASE CONNECTION SUCCESSFUL!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('Next steps:');
    if (tablesResult.rows.length === 0) {
      console.log('1. Run: pnpx prisma db push --schema=./prisma/schema.prisma');
      console.log('2. Start API: pnpm run dev');
      console.log('3. Start frontend: cd ../web && pnpm run dev');
    } else {
      console.log('1. Start API: pnpm run dev');
      console.log('2. Start frontend: cd ../web && pnpm run dev');
      console.log('3. Test features at http://localhost:3000');
    }
    console.log('');
    
    client.release();
    await pool.end();
    process.exit(0);
    
  } catch (error) {
    if (client) client.release();
    await pool.end();
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ DATABASE CONNECTION FAILED!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('Error Details:');
    console.log('  Message:', error.message);
    console.log('  Code:', error.code || 'N/A');
    console.log('');
    
    if (error.code === 'ENOTFOUND') {
      console.log('🔍 Diagnosis: Hostname not found');
      console.log('');
      console.log('This means the database hostname cannot be resolved.');
      console.log('Common causes:');
      console.log('  1. Incorrect hostname in connection string');
      console.log('  2. Supabase project is paused or deleted');
      console.log('  3. Typo in project reference ID');
      console.log('');
      console.log('✅ Solution:');
      console.log('  1. Go to https://supabase.com/dashboard');
      console.log('  2. Select your project');
      console.log('  3. Click "Connect" button');
      console.log('  4. Copy the connection string');
      console.log('  5. Update DATABASE_URL in .env file');
      console.log('  6. Add ?sslmode=require at the end');
      console.log('');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('🔍 Diagnosis: Connection refused');
      console.log('');
      console.log('The database server rejected the connection.');
      console.log('Common causes:');
      console.log('  1. Wrong port number');
      console.log('  2. Firewall blocking connection');
      console.log('  3. Database server not running');
      console.log('');
    } else if (error.message.includes('password authentication failed')) {
      console.log('🔍 Diagnosis: Authentication failed');
      console.log('');
      console.log('The password is incorrect.');
      console.log('✅ Solution:');
      console.log('  1. Go to Supabase Dashboard → Project Settings → Database');
      console.log('  2. Reset your database password');
      console.log('  3. Update DATABASE_URL in .env file');
      console.log('');
    }
    
    console.log('📚 For more help, see: SUPABASE_CONNECTION_HELP.md');
    console.log('');
    process.exit(1);
  }
}

testConnection();


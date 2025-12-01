/**
 * MySQL Connection Test Script
 * Run this to verify your MySQL connection is working
 * Usage: node scripts/test-mysql-connection.js
 */

// Note: This requires mysql2 package to be installed
// If you don't have it yet, see docs/MYSQL_MANUAL_INSTALL.md

async function testConnection() {
  console.log('🔍 Testing MySQL connection...\n');
  
  try {
    // Import mysql connection
    const { query, testConnection: testConn } = require('../lib/mysql');
    
    console.log('✓ MySQL module loaded successfully\n');
    
    // Test basic connection
    console.log('📡 Testing database connection...');
    await testConn();
    console.log('✓ Database connection successful\n');
    
    // Test database selection
    console.log('📊 Checking database...');
    const dbResult = await query('SELECT DATABASE() as db');
    console.log('✓ Current database:', dbResult[0].db, '\n');
    
    // Check tables
    console.log('📋 Listing tables...');
    const tables = await query('SHOW TABLES');
    console.log('✓ Found tables:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log('  -', tableName);
    });
    console.log('');
    
    // Check users table structure
    console.log('👤 Checking users table structure...');
    const usersColumns = await query('DESCRIBE users');
    console.log('✓ Users table columns:');
    usersColumns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });
    console.log('');
    
    // Check sessions table
    console.log('🔐 Checking sessions table...');
    const sessionsCount = await query('SELECT COUNT(*) as count FROM sessions');
    console.log('✓ Current sessions:', sessionsCount[0].count, '\n');
    
    // Check banks table
    console.log('🏦 Checking banks table...');
    const banksCount = await query('SELECT COUNT(*) as count FROM banks');
    console.log('✓ Bank accounts:', banksCount[0].count, '\n');
    
    // Check transactions table
    console.log('💳 Checking transactions table...');
    const transactionsCount = await query('SELECT COUNT(*) as count FROM transactions');
    console.log('✓ Transactions:', transactionsCount[0].count, '\n');
    
    console.log('✅ All tests passed!\n');
    console.log('Your MySQL database is ready to use.');
    console.log('\nNext steps:');
    console.log('1. Start the dev server: npm run dev');
    console.log('2. Go to: http://localhost:3000/sign-up');
    console.log('3. Create a test account\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Connection test failed:\n');
    
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('Error: Required packages not installed\n');
      console.error('Please install the packages first:');
      console.error('  npm install mysql2 bcryptjs uuid @types/bcryptjs @types/uuid\n');
      console.error('If npm is blocked by your network:');
      console.error('  1. Use VPN or mobile hotspot');
      console.error('  2. See: docs/MYSQL_MANUAL_INSTALL.md for manual installation\n');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Error: Cannot connect to MySQL server\n');
      console.error('Please check:');
      console.error('  1. Is MySQL installed? Run: which mysql');
      console.error('  2. Is MySQL running? Run: brew services list (or check XAMPP)');
      console.error('  3. Start MySQL: brew services start mysql (or start in XAMPP)\n');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Error: Access denied\n');
      console.error('Please check:');
      console.error('  1. Is the password in .env.local correct?');
      console.error('  2. Does the MySQL user have proper permissions?\n');
      console.error('Current .env.local settings:');
      console.error('  DB_HOST:', process.env.DB_HOST || 'not set');
      console.error('  DB_PORT:', process.env.DB_PORT || 'not set');
      console.error('  DB_USER:', process.env.DB_USER || 'not set');
      console.error('  DB_NAME:', process.env.DB_NAME || 'not set\n');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('Error: Database does not exist\n');
      console.error('Please create the database:');
      console.error('  1. Run: mysql -u root -p');
      console.error('  2. Execute: CREATE DATABASE managenow;');
      console.error('  3. Execute: exit');
      console.error('  4. Run: mysql -u root -p managenow < database/schema.sql\n');
    } else {
      console.error('Error details:', error.message);
      console.error('\nFull error:');
      console.error(error);
    }
    
    process.exit(1);
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Run the test
testConnection();

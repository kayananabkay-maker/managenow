require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function testDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    console.log('✅ MySQL connection successful!');
    
    // Check if database exists
    const [databases] = await connection.query("SHOW DATABASES LIKE 'managenow'");
    
    if (databases.length === 0) {
      console.log('❌ Database "managenow" does not exist!');
      console.log('Creating database...');
      await connection.query('CREATE DATABASE managenow');
      console.log('✅ Database created!');
    } else {
      console.log('✅ Database "managenow" exists!');
    }

    await connection.query('USE managenow');
    
    // Check if users table exists
    const [tables] = await connection.query("SHOW TABLES LIKE 'users'");
    
    if (tables.length === 0) {
      console.log('❌ Table "users" does not exist!');
      console.log('You need to run the database schema setup.');
      console.log('Run: mysql -uroot < database/schema.sql');
    } else {
      console.log('✅ Table "users" exists!');
      
      // Check if any users exist
      const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
      console.log(`📊 Total users in database: ${users[0].count}`);
      
      if (users[0].count === 0) {
        console.log('⚠️  No users found. You need to sign up first!');
      }
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      errno: error.errno
    });
    process.exit(1);
  }
}

testDatabase();

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve('./managenow.db');
console.log('📁 Database:', dbPath);
console.log('');

try {
    const db = new Database(dbPath, { readonly: true });
    
    // Check users table
    const users = db.prepare('SELECT * FROM users').all();
    console.log('👥 Users Table:');
    console.log('─'.repeat(60));
    if (users.length === 0) {
        console.log('❌ No users found in database!');
        console.log('');
        console.log('This means sign-up is NOT saving to SQLite.');
        console.log('The app might be using MySQL stub (in-memory).');
    } else {
        console.log(`✅ Found ${users.length} user(s):`);
        users.forEach(user => {
            console.log(`\n  ID: ${user.id}`);
            console.log(`  Email: ${user.email}`);
            console.log(`  Name: ${user.first_name} ${user.last_name}`);
            console.log(`  Created: ${user.created_at}`);
        });
    }
    
    console.log('');
    console.log('─'.repeat(60));
    
    // Check sessions table
    const sessions = db.prepare('SELECT * FROM sessions').all();
    console.log('\n🔐 Sessions Table:');
    console.log('─'.repeat(60));
    if (sessions.length === 0) {
        console.log('❌ No sessions found!');
    } else {
        console.log(`✅ Found ${sessions.length} session(s):`);
        sessions.forEach(session => {
            console.log(`\n  User ID: ${session.user_id}`);
            console.log(`  Token: ${session.token.substring(0, 20)}...`);
            console.log(`  Expires: ${session.expires_at}`);
        });
    }
    
    db.close();
    
} catch (error) {
    console.error('❌ Error:', error.message);
}

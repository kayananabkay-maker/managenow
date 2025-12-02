const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function setupDatabase() {
    console.log('🚀 Setting up ManageNow Database...\n');
    
    let connection;
    
    try {
        // Connect to MySQL
        connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST || 'localhost',
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_ROOT_PASSWORD || process.env.MYSQL_PASSWORD,
            port: parseInt(process.env.MYSQL_PORT || '3306'),
            multipleStatements: true
        });
        
        console.log('✅ Connected to MySQL');
        
        // Create database if not exists
        const dbName = process.env.MYSQL_DATABASE || 'managenow';
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
        console.log(`✅ Database '${dbName}' ready`);
        
        // Use the database
        await connection.query(`USE ${dbName}`);
        
        // Read and execute the schema file
        const schemaPath = path.join(__dirname, '../database/managenow-complete-schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Split by delimiter and execute
        const statements = schema
            .split('DELIMITER //')[0] // Skip trigger definitions for now
            .split(';')
            .filter(stmt => stmt.trim().length > 0 && !stmt.trim().startsWith('--'));
        
        console.log(`\n📝 Executing ${statements.length} SQL statements...\n`);
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i].trim();
            if (statement && !statement.startsWith('--')) {
                try {
                    await connection.query(statement);
                    // Show progress for important statements
                    if (statement.includes('CREATE TABLE')) {
                        const tableName = statement.match(/CREATE TABLE (?:IF NOT EXISTS )?`?(\w+)`?/i)?.[1];
                        console.log(`  ✓ Created table: ${tableName}`);
                    } else if (statement.includes('INSERT INTO')) {
                        const tableName = statement.match(/INSERT INTO `?(\w+)`?/i)?.[1];
                        console.log(`  ✓ Inserted data into: ${tableName}`);
                    } else if (statement.includes('CREATE.*VIEW')) {
                        const viewName = statement.match(/CREATE.*VIEW `?(\w+)`?/i)?.[1];
                        console.log(`  ✓ Created view: ${viewName}`);
                    }
                } catch (err) {
                    // Skip errors for DROP/CREATE REPLACE statements
                    if (!err.message.includes('already exists') && 
                        !err.message.includes('Unknown table') &&
                        !err.message.includes('Duplicate entry')) {
                        console.error(`  ⚠️  Warning on statement ${i + 1}:`, err.message.substring(0, 100));
                    }
                }
            }
        }
        
        // Verify tables were created
        const [tables] = await connection.query('SHOW TABLES');
        console.log(`\n✅ Database setup complete!`);
        console.log(`📊 Total tables created: ${tables.length}`);
        console.log('\nTables:');
        tables.forEach(table => {
            const tableName = Object.values(table)[0];
            console.log(`  - ${tableName}`);
        });
        
        // Show some stats
        console.log('\n📈 Sample Data:');
        const [categories] = await connection.query('SELECT COUNT(*) as count FROM categories');
        console.log(`  - ${categories[0].count} default categories`);
        
        const [challenges] = await connection.query('SELECT COUNT(*) as count FROM challenges');
        console.log(`  - ${challenges[0].count} challenges`);
        
        const [content] = await connection.query('SELECT COUNT(*) as count FROM educational_content');
        console.log(`  - ${content[0].count} educational articles`);
        
        console.log('\n🎉 ManageNow database is ready to use!');
        
    } catch (error) {
        console.error('❌ Error setting up database:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run the setup
setupDatabase();

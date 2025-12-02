const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function setupDatabase() {
    console.log('🚀 Setting up ManageNow SQLite Database...\n');
    
    const dbPath = process.env.DATABASE_URL || './managenow.db';
    const absoluteDbPath = path.resolve(dbPath);
    
    console.log(`📁 Database location: ${absoluteDbPath}\n`);
    
    // Create database connection
    const db = new sqlite3.Database(absoluteDbPath, (err) => {
        if (err) {
            console.error('❌ Error opening database:', err.message);
            process.exit(1);
        }
        console.log('✅ Connected to SQLite database');
    });
    
    // Read schema file
    const schemaPath = path.join(__dirname, '../database/managenow-sqlite-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📝 Executing SQL schema...\n');
    
    // Execute the schema
    db.exec(schema, (err) => {
        if (err) {
            console.error('❌ Error executing schema:', err.message);
            db.close();
            process.exit(1);
        }
        
        console.log('✅ Schema executed successfully!\n');
        
        // Verify tables
        db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", [], (err, tables) => {
            if (err) {
                console.error('❌ Error querying tables:', err.message);
                db.close();
                process.exit(1);
            }
            
            console.log(`📊 Total tables created: ${tables.length}`);
            console.log('\nTables:');
            tables.forEach(table => {
                console.log(`  - ${table.name}`);
            });
            
            // Show some stats
            console.log('\n📈 Sample Data:');
            
            db.get('SELECT COUNT(*) as count FROM categories', [], (err, row) => {
                if (!err && row) {
                    console.log(`  - ${row.count} default categories`);
                }
                
                db.get('SELECT COUNT(*) as count FROM challenges', [], (err, row) => {
                    if (!err && row) {
                        console.log(`  - ${row.count} challenges`);
                    }
                    
                    db.get('SELECT COUNT(*) as count FROM educational_content', [], (err, row) => {
                        if (!err && row) {
                            console.log(`  - ${row.count} educational articles`);
                        }
                        
                        // Show views
                        db.all("SELECT name FROM sqlite_master WHERE type='view' ORDER BY name", [], (err, views) => {
                            if (!err && views && views.length > 0) {
                                console.log(`\n📊 Views created: ${views.length}`);
                                views.forEach(view => {
                                    console.log(`  - ${view.name}`);
                                });
                            }
                            
                            // Show triggers
                            db.all("SELECT name FROM sqlite_master WHERE type='trigger' ORDER BY name", [], (err, triggers) => {
                                if (!err && triggers && triggers.length > 0) {
                                    console.log(`\n⚡ Triggers created: ${triggers.length}`);
                                    triggers.forEach(trigger => {
                                        console.log(`  - ${trigger.name}`);
                                    });
                                }
                                
                                console.log('\n🎉 ManageNow database is ready to use!');
                                console.log(`\n💡 Database file: ${absoluteDbPath}`);
                                
                                // Close database
                                db.close((err) => {
                                    if (err) {
                                        console.error('Error closing database:', err.message);
                                    }
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}

// Run the setup
setupDatabase();

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../managenow.db');
const db = new sqlite3.Database(dbPath);

console.log('🗄️  ManageNow Database Explorer\n');
console.log('📁 Database:', dbPath);
console.log('─'.repeat(60));

// Show all tables
db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", [], (err, tables) => {
    if (err) {
        console.error('Error:', err);
        return;
    }
    
    console.log('\n📊 Tables:');
    tables.forEach(table => {
        console.log(`   - ${table.name}`);
    });
    
    // Show categories
    console.log('\n📂 Categories:');
    db.all("SELECT * FROM categories ORDER BY type, name", [], (err, categories) => {
        if (err) {
            console.error('Error:', err);
            return;
        }
        
        console.log('\n   Income Categories:');
        categories.filter(c => c.type === 'income').forEach(cat => {
            console.log(`   ${cat.icon} ${cat.name}`);
        });
        
        console.log('\n   Expense Categories:');
        categories.filter(c => c.type === 'expense').forEach(cat => {
            console.log(`   ${cat.icon} ${cat.name}`);
        });
        
        // Show challenges
        console.log('\n🎯 Available Challenges:');
        db.all("SELECT * FROM challenges", [], (err, challenges) => {
            if (err) {
                console.error('Error:', err);
                return;
            }
            
            challenges.forEach(ch => {
                console.log(`   ${ch.title} (${ch.difficulty}) - ${ch.points} points`);
                console.log(`      ${ch.description}`);
            });
            
            // Show educational content
            console.log('\n📚 Educational Content:');
            db.all("SELECT * FROM educational_content", [], (err, content) => {
                if (err) {
                    console.error('Error:', err);
                    db.close();
                    return;
                }
                
                content.forEach(article => {
                    console.log(`   📖 ${article.title} (${article.difficulty})`);
                    console.log(`      ${article.content.substring(0, 80)}...`);
                });
                
                // Show views
                console.log('\n👁️  Analytics Views:');
                db.all("SELECT name FROM sqlite_master WHERE type='view' ORDER BY name", [], (err, views) => {
                    if (err) {
                        console.error('Error:', err);
                        db.close();
                        return;
                    }
                    
                    views.forEach(view => {
                        console.log(`   - ${view.name}`);
                    });
                    
                    console.log('\n✅ Database is ready to use!');
                    console.log('─'.repeat(60));
                    
                    db.close();
                });
            });
        });
    });
});

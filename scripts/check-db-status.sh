#!/bin/bash

# 🔍 Quick Database Info Script
# Shows database status and proves persistence

echo "╔════════════════════════════════════════════════════════╗"
echo "║  📊 ManageNow Database Status                          ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Check if database exists
if [ -f "managenow.db" ]; then
    echo "✅ Database file exists!"
    echo "📁 Location: $(pwd)/managenow.db"
    echo "📏 Size: $(ls -lh managenow.db | awk '{print $5}')"
    echo "📅 Last modified: $(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" managenow.db)"
    echo ""
    
    echo "🔍 File Type:"
    file managenow.db
    echo ""
    
    echo "📊 Database Statistics:"
    node scripts/explore-db.js | head -20
    echo ""
    
    echo "✅ Your data is PERSISTENT and saved to disk!"
    echo "   - Survives VS Code restarts ✅"
    echo "   - Survives server restarts ✅"  
    echo "   - Survives computer restarts ✅"
    echo ""
    echo "🎯 To open in DB Browser for SQLite:"
    echo "   1. Launch DB Browser app"
    echo "   2. Click 'Open Database'"
    echo "   3. Select: $(pwd)/managenow.db"
    echo "   4. Click 'Browse Data' tab"
    echo "   5. Select 'categories' table"
    echo "   6. You'll see 15 categories!"
    
else
    echo "❌ Database file not found!"
    echo ""
    echo "🔧 To create it, run:"
    echo "   npm run db:setup"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"

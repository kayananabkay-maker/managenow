#!/bin/bash

# Quick script to open ManageNow database in DB Browser for SQLite

DB_PATH="./managenow.db"

echo "🗄️  Opening ManageNow Database..."
echo "📁 Location: $(pwd)/$DB_PATH"

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    echo "❌ Database not found!"
    echo "💡 Run: node scripts/setup-sqlite-db.js"
    exit 1
fi

# Check if DB Browser is installed
if command -v "DB Browser for SQLite" &> /dev/null || [ -d "/Applications/DB Browser for SQLite.app" ]; then
    open -a "DB Browser for SQLite" "$DB_PATH"
    echo "✅ Database opened in DB Browser for SQLite"
else
    echo "❌ DB Browser for SQLite not found!"
    echo ""
    echo "📥 Install with:"
    echo "   brew install --cask db-browser-for-sqlite"
    echo ""
    echo "Or download from: https://sqlitebrowser.org/"
    exit 1
fi

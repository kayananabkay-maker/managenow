#!/bin/bash

# One-command MySQL setup for ManageNow
# Just run: bash install-mysql-now.sh

echo "🚀 Installing MySQL for ManageNow..."
echo ""

# Install Homebrew if needed
if ! command -v brew &> /dev/null; then
    echo "📦 Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add to PATH for M1/M2 Macs
    if [[ $(uname -m) == 'arm64' ]]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
fi

echo "📦 Installing MySQL..."
brew install mysql

echo "🚀 Starting MySQL..."
brew services start mysql

echo "⏳ Waiting 5 seconds for MySQL to start..."
sleep 5

echo "🗄️ Setting up database..."
mysql -uroot -e "CREATE DATABASE IF NOT EXISTS managenow;" 2>/dev/null || echo "Database may already exist"

echo "📋 Loading schema..."
mysql -uroot managenow < /Users/nabilakayana/Desktop/managenow/database/schema.sql 2>/dev/null

echo ""
echo "✅ Done! Testing connection..."
cd /Users/nabilakayana/Desktop/managenow && node test-db.js

echo ""
echo "🎉 Setup complete! Tell Copilot: 'MySQL is ready'"

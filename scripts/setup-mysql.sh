#!/bin/bash

# ManageNow MySQL Setup Script
# This script will guide you through setting up MySQL for your project

echo "======================================"
echo "ManageNow MySQL Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check if MySQL is installed
echo "Step 1: Checking MySQL installation..."
if command -v mysql &> /dev/null; then
    echo -e "${GREEN}✓ MySQL is already installed${NC}"
    mysql --version
else
    echo -e "${YELLOW}⚠ MySQL is not installed${NC}"
    echo ""
    echo "Please install MySQL using one of these methods:"
    echo ""
    echo "Option 1 - Homebrew (Recommended for Mac):"
    echo "  brew install mysql"
    echo "  brew services start mysql"
    echo "  mysql_secure_installation"
    echo ""
    echo "Option 2 - XAMPP (Easy GUI):"
    echo "  Download from: https://www.apachefriends.org/"
    echo "  Install and start MySQL from control panel"
    echo ""
    echo "Option 3 - MySQL Installer:"
    echo "  Download from: https://dev.mysql.com/downloads/mysql/"
    echo ""
    read -p "Press Enter after installing MySQL..."
fi

echo ""
echo "======================================"

# Step 2: Test MySQL connection
echo "Step 2: Testing MySQL connection..."
echo ""
read -p "Enter MySQL root password (or press Enter if no password): " MYSQL_PASSWORD

if [ -z "$MYSQL_PASSWORD" ]; then
    MYSQL_CMD="mysql -u root"
else
    MYSQL_CMD="mysql -u root -p$MYSQL_PASSWORD"
fi

# Test connection
if $MYSQL_CMD -e "SELECT 1;" &> /dev/null; then
    echo -e "${GREEN}✓ MySQL connection successful${NC}"
else
    echo -e "${RED}✗ Cannot connect to MySQL${NC}"
    echo "Please check your MySQL installation and password"
    exit 1
fi

echo ""
echo "======================================"

# Step 3: Create database
echo "Step 3: Creating database..."
echo ""

$MYSQL_CMD <<EOF
CREATE DATABASE IF NOT EXISTS managenow;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database 'managenow' created successfully${NC}"
else
    echo -e "${RED}✗ Failed to create database${NC}"
    exit 1
fi

echo ""
echo "======================================"

# Step 4: Create tables
echo "Step 4: Creating tables from schema..."
echo ""

if [ -f "database/schema.sql" ]; then
    if [ -z "$MYSQL_PASSWORD" ]; then
        mysql -u root managenow < database/schema.sql
    else
        mysql -u root -p"$MYSQL_PASSWORD" managenow < database/schema.sql
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Tables created successfully${NC}"
    else
        echo -e "${RED}✗ Failed to create tables${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ schema.sql file not found${NC}"
    echo "Make sure you're running this script from the project root directory"
    exit 1
fi

echo ""
echo "======================================"

# Step 5: Update .env.local
echo "Step 5: Updating .env.local..."
echo ""

if [ -f ".env.local" ]; then
    # Create backup
    cp .env.local .env.local.backup
    
    # Update password in .env.local
    if [ -n "$MYSQL_PASSWORD" ]; then
        sed -i.bak "s/DB_PASSWORD=.*/DB_PASSWORD=$MYSQL_PASSWORD/" .env.local
        rm .env.local.bak
        echo -e "${GREEN}✓ .env.local updated with your MySQL password${NC}"
    else
        sed -i.bak "s/DB_PASSWORD=.*/DB_PASSWORD=/" .env.local
        rm .env.local.bak
        echo -e "${GREEN}✓ .env.local updated (no password)${NC}"
    fi
else
    echo -e "${RED}✗ .env.local file not found${NC}"
    exit 1
fi

echo ""
echo "======================================"

# Step 6: Verify tables
echo "Step 6: Verifying database structure..."
echo ""

$MYSQL_CMD managenow -e "SHOW TABLES;" | grep -E "users|sessions|banks|transactions"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ All tables verified${NC}"
else
    echo -e "${YELLOW}⚠ Some tables may be missing${NC}"
fi

echo ""
echo "======================================"
echo -e "${GREEN}✓ MySQL setup complete!${NC}"
echo "======================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Install npm packages (requires internet/VPN):"
echo "   npm install mysql2 bcryptjs uuid @types/bcryptjs @types/uuid"
echo ""
echo "   If npm is blocked, see: docs/MYSQL_MANUAL_INSTALL.md"
echo ""
echo "2. Test the connection:"
echo "   node scripts/test-mysql-connection.js"
echo ""
echo "3. Start the development server:"
echo "   npm run dev"
echo ""
echo "4. Test authentication at:"
echo "   http://localhost:3000/sign-up"
echo ""

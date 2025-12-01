# Manual Package Installation Guide

Since npm registry is blocked by your network, this guide provides alternative methods to install the required packages for MySQL authentication.

## Required Packages

Your project needs these packages:
- `mysql2` - MySQL database driver
- `bcryptjs` - Password hashing
- `uuid` - Unique ID generation
- `@types/bcryptjs` - TypeScript types
- `@types/uuid` - TypeScript types

## Method 1: Use VPN or Mobile Hotspot (Easiest)

### Option A: Free VPN
1. Install a VPN:
   - **ProtonVPN** (Free): https://protonvpn.com/
   - **Windscribe** (Free 10GB): https://windscribe.com/
   - **TunnelBear** (Free 500MB): https://www.tunnelbear.com/

2. Connect to VPN

3. Install packages:
```bash
npm install mysql2 bcryptjs uuid @types/bcryptjs @types/uuid
```

### Option B: Mobile Hotspot
1. Enable hotspot on your phone
2. Connect your computer to the hotspot
3. Run the npm install command above

## Method 2: Manual Download and Installation

If you cannot use VPN, follow these steps:

### Step 1: Download packages manually

Go to these URLs and download the latest .tgz files:

1. **mysql2**: https://registry.npmjs.org/mysql2/-/mysql2-3.11.4.tgz
2. **bcryptjs**: https://registry.npmjs.org/bcryptjs/-/bcryptjs-2.4.3.tgz
3. **uuid**: https://registry.npmjs.org/uuid/-/uuid-11.0.3.tgz
4. **@types/bcryptjs**: https://registry.npmjs.org/@types/bcryptjs/-/bcryptjs-2.4.6.tgz
5. **@types/uuid**: https://registry.npmjs.org/@types/uuid/-/uuid-10.0.0.tgz

### Step 2: Create installation script

Create a file called `install-packages.sh` in your project root:

```bash
#!/bin/bash

# Manual Package Installation Script
echo "Installing packages manually..."

# Create temp directory
mkdir -p temp_packages
cd temp_packages

# Download packages (you need to do this manually or with curl if available)
# Place all .tgz files in this directory

# Install mysql2
if [ -f mysql2-*.tgz ]; then
    npm install mysql2-*.tgz
    echo "✓ mysql2 installed"
fi

# Install bcryptjs
if [ -f bcryptjs-*.tgz ]; then
    npm install bcryptjs-*.tgz
    echo "✓ bcryptjs installed"
fi

# Install uuid
if [ -f uuid-*.tgz ]; then
    npm install uuid-*.tgz
    echo "✓ uuid installed"
fi

# Install types
if [ -f bcryptjs-*.tgz ]; then
    npm install --save-dev @types_bcryptjs-*.tgz
    echo "✓ @types/bcryptjs installed"
fi

if [ -f uuid-*.tgz ]; then
    npm install --save-dev @types_uuid-*.tgz
    echo "✓ @types/uuid installed"
fi

cd ..
rm -rf temp_packages

echo "✓ All packages installed!"
```

Make it executable:
```bash
chmod +x install-packages.sh
```

Run it:
```bash
./install-packages.sh
```

## Method 3: Use Alternative Registry

Try using a different npm registry that might not be blocked:

```bash
# Try Taobao registry (China mirror)
npm config set registry https://registry.npmmirror.com

# Install packages
npm install mysql2 bcryptjs uuid @types/bcryptjs @types/uuid

# Reset to default (optional)
npm config set registry https://registry.npmjs.org
```

## Method 4: Use Yarn Instead of npm

Yarn might work if npm is blocked:

```bash
# Install Yarn (if you don't have it)
brew install yarn

# Or using npm (if that works)
npm install -g yarn

# Install packages using Yarn
yarn add mysql2 bcryptjs uuid
yarn add --dev @types/bcryptjs @types/uuid
```

## Method 5: Copy from Another Computer

If you have access to another computer with working internet:

1. On the working computer, run:
```bash
npm pack mysql2
npm pack bcryptjs
npm pack uuid
npm pack @types/bcryptjs
npm pack @types/uuid
```

2. Copy all the `.tgz` files to a USB drive

3. On your computer, copy the files to your project and run:
```bash
npm install mysql2-*.tgz
npm install bcryptjs-*.tgz
npm install uuid-*.tgz
npm install --save-dev bcryptjs-*.tgz
npm install --save-dev uuid-*.tgz
```

## Verification

After installation, verify the packages are installed:

```bash
npm ls mysql2
npm ls bcryptjs
npm ls uuid
```

You should see output like:
```
managenow@0.1.0
├── mysql2@3.11.4
├── bcryptjs@2.4.3
└── uuid@11.0.3
```

## Test the Installation

Run the connection test:
```bash
node scripts/test-mysql-connection.js
```

If it works, you'll see:
```
✓ MySQL module loaded successfully
✓ Database connection successful
```

## Troubleshooting

### Error: Cannot find module 'mysql2'
- The package wasn't installed correctly
- Try Method 1 with VPN/hotspot
- Check if `node_modules/mysql2` directory exists

### Error: ENOTFOUND registry.npmjs.org
- Your network is blocking npm
- Use VPN (Method 1)
- Try alternative registry (Method 3)
- Use manual installation (Method 2)

### Error: Permission denied
- Run with sudo: `sudo npm install ...`
- Or fix npm permissions: https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally

## Alternative: Use Docker

If all else fails, you could run your development environment in Docker with pre-installed packages:

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

CMD ["npm", "run", "dev"]
```

Build and run:
```bash
docker build -t managenow .
docker run -p 3000:3000 managenow
```

## Need Help?

If you're still stuck:
1. Check the error message carefully
2. Try each method in order
3. Verify MySQL is installed and running
4. Check .env.local has correct credentials

## Quick Links

- **mysql2 npm page**: https://www.npmjs.com/package/mysql2
- **bcryptjs npm page**: https://www.npmjs.com/package/bcryptjs
- **uuid npm page**: https://www.npmjs.com/package/uuid
- **ProtonVPN**: https://protonvpn.com/download
- **Windscribe**: https://windscribe.com/download

## Next Steps

Once packages are installed:
1. ✅ Update your .env.local with MySQL password
2. ✅ Create the database: `CREATE DATABASE managenow;`
3. ✅ Run the schema: `mysql -u root -p managenow < database/schema.sql`
4. ✅ Test connection: `node scripts/test-mysql-connection.js`
5. ✅ Start dev server: `npm run dev`
6. ✅ Test at: http://localhost:3000/sign-up

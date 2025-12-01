# Quick Start: Connect to Appwrite Database

## ✅ Step 1: Create Appwrite Account (5 minutes)

I've opened https://cloud.appwrite.io for you in the browser.

1. Click "Sign Up" (or "Get Started")
2. Create account with email/password or Google
3. Verify your email if needed

## ✅ Step 2: Create Your Project (2 minutes)

1. After login, click "Create Project"
2. Name it: **ManageNow**
3. Click "Create"
4. **COPY YOUR PROJECT ID** - you'll see it at the top (looks like: `6741abc...`)

## ✅ Step 3: Get Your API Secret (1 minute)

1. In your project, click "Settings" (gear icon) on left sidebar
2. Click "API Keys" tab
3. Click "Create API Key"
4. Name it: "ManageNow Server Key"
5. Set scopes to "All" (or select specific permissions)
6. Click "Create"
7. **COPY THE SECRET KEY** - you can only see it once!

## ✅ Step 4: Create Database (3 minutes)

1. Click "Databases" in left sidebar
2. Click "Create Database"
3. Name it: **managenow**
4. Click "Create"
5. **COPY THE DATABASE ID** (shown at top)

## ✅ Step 5: Create Users Collection (2 minutes)

1. Inside your database, click "Create Collection"
2. Name it: **users**
3. Click "Create"
4. **COPY THE COLLECTION ID**
5. Click on "Settings" tab for this collection
6. Under "Permissions", click "Add Role"
7. Select "Any" for both "Create" and "Read" (for testing)

### Add Attributes to Users Collection:

Click "Attributes" tab, then add these one by one:

| Attribute Name | Type   | Size | Required |
|---------------|--------|------|----------|
| userId        | String | 255  | Yes      |
| email         | String | 255  | Yes      |
| firstName     | String | 255  | Yes      |
| lastName      | String | 255  | Yes      |
| name          | String | 255  | Yes      |
| address1      | String | 500  | No       |
| city          | String | 255  | No       |
| state         | String | 10   | No       |
| postalCode    | String | 20   | No       |
| dateOfBirth   | String | 50   | No       |
| ssn           | String | 50   | No       |

## ✅ Step 6: Update Your .env.local File

Open the file: `/Users/nabilakayana/Desktop/managenow/.env.local`

Replace these values with what you copied:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT=YOUR_PROJECT_ID_HERE    ← Replace this
APPWRITE_DATABASE_ID=YOUR_DATABASE_ID_HERE           ← Replace this
APPWRITE_USER_COLLECTION_ID=YOUR_USERS_COLLECTION_ID_HERE  ← Replace this
APPWRITE_SECRET=YOUR_API_SECRET_KEY_HERE             ← Replace this
```

### Example (with fake IDs):
```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT=6741abc123def456
APPWRITE_DATABASE_ID=6741xyz789ghi012
APPWRITE_USER_COLLECTION_ID=6742user123abc456
APPWRITE_SECRET=standard_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

## ✅ Step 7: Restart Your Dev Server

1. Stop the current server (Ctrl+C in terminal)
2. Run: `npm run dev`
3. Go to: http://localhost:3000/sign-up

## ✅ Step 8: Test Sign Up!

1. Go to http://localhost:3000/sign-up
2. Enter:
   - Email: test@example.com
   - Password: password123
   - First Name: John
   - Last Name: Doe
   - Address: 123 Test St
   - City: Jakarta
   - State: JK
   - Postal Code: 12345
   - Date of Birth: 1990-01-01
   - SSN: 1234

3. Click "Sign Up"
4. If successful, you'll be redirected to homepage!
5. Check your Appwrite Console → Databases → managenow → users collection
6. You should see your new user! 🎉

## 🚨 Troubleshooting

### Error: "Invalid project ID"
- Make sure you copied the Project ID correctly
- It should look like: `6741abc123def456`

### Error: "Invalid API key"
- Make sure you copied the entire secret key
- It starts with `standard_` or similar

### Error: "Collection not found"
- Make sure you copied the Collection ID from the users collection
- Go back to Appwrite and verify the ID

### Still not working?
- Check the browser console (F12) for error messages
- Check your terminal for error logs
- Make sure all IDs in .env.local are correct
- Restart dev server after changing .env.local

## 🎯 What's Next?

Once sign-up works, you can:
1. Create more collections (banks, transactions)
2. Add real bank connection with Plaid
3. Add profile page
4. Add logout functionality
5. Add password reset

## 📞 Need Help?

If you get stuck, just let me know:
- What error message you're seeing
- What step you're on
- I'll help you debug!

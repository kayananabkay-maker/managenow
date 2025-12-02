# 🔐 Sign-In Troubleshooting Guide

## ✅ Issue Fixed!

I've fixed the sign-in problem. Here's what was wrong and what I did:

---

## 🐛 The Problem

Your sign-in was failing because:

1. **Wrong field mapping in the stub database**
   - The in-memory database stub had incorrect field names
   - `userId` vs `user_id` mismatch
   - `expiresAt` vs `expires_at` mismatch

2. **Dev server was locked**
   - Multiple Next.js instances were running
   - Port was already in use

---

## 🔧 What I Fixed

### 1. Fixed MySQL Stub (`lib/stubs/mysql2.ts`)
- ✅ Corrected user INSERT mapping
- ✅ Corrected session INSERT mapping  
- ✅ Added both `userId` and `user_id` to sessions
- ✅ Added both `expiresAt` and `expires_at` to sessions
- ✅ Added better debug logging with emojis

### 2. Killed Locked Processes
- ✅ Stopped duplicate dev servers
- ✅ Freed up ports 3000 and 3001

### 3. Restarted Dev Server
- ✅ Server running on http://localhost:3000
- ✅ Fresh start with fixed code

---

## 🧪 How to Test

### Step 1: Sign Up (Create New Account)

1. **Go to:** http://localhost:3000/sign-up
2. **Fill in the form:**
   - First Name: `Test`
   - Last Name: `User`
   - Email: `test@example.com`
   - Password: `password123`
3. **Click "Sign Up"**
4. **You should be redirected to:** `/sign-in`

✅ **Check terminal logs** - you should see:
```
[MySQL Stub] ✅ User created: { id: 'xxx', email: 'test@example.com', name: 'Test User' }
[MySQL Stub] ✅ Session created: { token: 'xxx...', userId: 'xxx' }
```

---

### Step 2: Sign In

1. **Go to:** http://localhost:3000/sign-in
2. **Enter credentials:**
   - Email: `test@example.com`
   - Password: `password123`
3. **Click "Sign In"**
4. **You should be redirected to:** `/` (dashboard)

✅ **Check terminal logs** - you should see:
```
[MySQL Stub] 🔍 SELECT user by email: test@example.com | Found: true
[MySQL Stub] 👤 User details: { id: 'xxx', email: 'test@example.com', name: 'Test User', hasPassword: true }
[Sign In] User found: { id: 'xxx', email: 'test@example.com', hasPassword: true }
[MySQL Stub] ✅ Session created: { token: 'xxx...', userId: 'xxx' }
```

---

### Step 3: Verify You're Logged In

1. **Should see your name** in the sidebar
2. **Should see logout button** (small icon at bottom)
3. **Can navigate** to My Banks, Transactions, etc.

✅ **Check terminal logs** when page loads:
```
[MySQL Stub] 🔍 SELECT session with JOIN, token: xxx...
[MySQL Stub] ✅ Session found, userId: xxx
[MySQL Stub] ✅ Returning user: Test User
```

---

## 🔄 If Sign-In Still Fails

### Check 1: Clear In-Memory Data
The stub database resets when the server restarts. If you signed up before the fix:

```bash
# Stop the server (Ctrl+C in terminal)
# Restart it
npm run dev
```

Then **sign up again** with fresh credentials.

---

### Check 2: Check Browser Console

1. **Open DevTools** (F12 or Cmd+Option+I)
2. **Go to Console tab**
3. **Look for errors** when clicking "Sign In"

Common errors:
- ❌ `Invalid email or password` → User doesn't exist, sign up first
- ❌ `Failed to sign in` → Check terminal for detailed error

---

### Check 3: Check Terminal Logs

Look for these patterns:

**✅ Good (Sign-In Working):**
```
[MySQL Stub] 🔍 SELECT user by email: xxx | Found: true
[MySQL Stub] 👤 User details: { ... hasPassword: true }
[Sign In] User found: { ... }
[MySQL Stub] ✅ Session created: { ... }
```

**❌ Bad (Sign-In Failing):**
```
[MySQL Stub] 🔍 SELECT user by email: xxx | Found: false
```
→ **Solution:** User doesn't exist, sign up first

```
[Sign In] User found: { hasPassword: false }
```
→ **Solution:** Password not saved correctly, sign up again

---

## 📊 Understanding the In-Memory Database

### ⚠️ Important to Know:

1. **Data resets on server restart**
   - Every time you run `npm run dev`, data is cleared
   - You need to sign up again after each restart

2. **Data is not persistent**
   - Using stubs (fake MySQL)
   - Real MySQL not configured yet
   - Perfect for testing/demo

3. **Multiple accounts supported**
   - You can create many test accounts
   - Each account is stored in memory
   - All cleared on restart

---

## 🎯 Quick Test Script

Run this complete test:

```bash
# 1. Make sure server is running
# Visit: http://localhost:3000/sign-up

# 2. Sign up
First Name: John
Last Name: Doe
Email: john@test.com
Password: test1234

# 3. You'll be redirected to /sign-in

# 4. Sign in with same credentials
Email: john@test.com
Password: test1234

# 5. You should land on dashboard (/)
# 6. Your name "John Doe" should appear in sidebar
# 7. Logout button visible at bottom
```

---

## 🔐 Security Note

The stub database uses:
- ✅ **Real bcrypt** for password hashing (via stub)
- ✅ **Secure session tokens** (UUIDs)
- ✅ **HttpOnly cookies**
- ✅ **7-day expiration**

Even though it's in-memory, the security patterns are production-ready!

---

## 🚀 What's Next?

Once you confirm sign-in works:

1. **Test the full flow**
   - Sign up → Sign in → Dashboard → My Banks → Logout → Sign in again

2. **Get Finverse credentials**
   - https://finverse.com/
   - Add to `.env.local`
   - Connect real Indonesian banks!

3. **Optional: Setup real MySQL**
   - For persistent data
   - Follow `MYSQL_INSTALLATION_GUIDE.md`

---

## 💡 Debug Commands

### Check if server is running:
```bash
lsof -i:3000
```

### Kill stuck server:
```bash
lsof -ti:3000 | xargs kill -9
```

### Restart fresh:
```bash
# Kill all
lsof -ti:3000,3001 | xargs kill -9

# Start clean
npm run dev
```

### Watch logs:
The terminal shows ALL database operations in real-time with emojis:
- 🔍 = Looking up data
- ✅ = Success
- ❌ = Failed
- 👤 = User info
- 📊 = Stats

---

## ✅ Checklist

Before asking for help, verify:

- [ ] Server is running on http://localhost:3000
- [ ] No errors in terminal
- [ ] Signed up with valid email/password
- [ ] Using same email/password to sign in
- [ ] Checked browser console for errors
- [ ] Checked terminal logs for debug messages

---

## 🎉 Success Indicators

You'll know it's working when:

1. **After sign-up:**
   - Redirected to `/sign-in`
   - Terminal shows: `✅ User created`

2. **After sign-in:**
   - Redirected to `/` (dashboard)
   - See your name in sidebar
   - See logout button
   - Terminal shows: `✅ Returning user`

3. **On subsequent page loads:**
   - Stay logged in
   - Don't get kicked to sign-in page
   - Can access all pages

---

## 📞 Still Having Issues?

If sign-in still doesn't work after following this guide:

1. **Share terminal output** when trying to sign in
2. **Share browser console errors** (F12 → Console tab)
3. **Confirm you did**: Sign up first, then sign in with SAME credentials

I'm here to help! 🚀

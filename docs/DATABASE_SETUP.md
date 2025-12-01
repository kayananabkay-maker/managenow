# Database Connection Guide for ManageNow

## ✅ What We've Set Up

1. **Installed Packages**:
   - `node-appwrite` - Backend SDK for Appwrite
   - `appwrite` - Client SDK for Appwrite

2. **Created Files**:
   - `.env.local` - Environment variables (configuration)
   - `lib/appwrite.ts` - Appwrite client configuration
   - `lib/actions/user.actions.ts` - Authentication functions (signIn, signUp, logout)

3. **Existing Files**:
   - `lib/utils.ts` - Already has `parseStringify` and `authFormSchema`
   - `types/index.d.ts` - All TypeScript types defined
   - `components/AuthForm.tsx` - Updated to use real authentication

## 🚀 Next Steps to Complete Database Setup

### Step 1: Create Appwrite Account

1. Go to https://cloud.appwrite.io
2. Create a free account
3. Create a new project called "ManageNow"
4. Copy your Project ID

### Step 2: Set Up Appwrite Database

In your Appwrite Console:

1. **Create Database**:
   - Go to Databases → Create Database
   - Name: "managenow"
   - Copy the Database ID

2. **Create Collections**:

   **Users Collection**:
   - Name: "users"
   - Attributes:
     - `userId` (string, required)
     - `email` (string, required)
     - `firstName` (string, required)
     - `lastName` (string, required)
     - `name` (string, required)
     - `address1` (string, optional)
     - `city` (string, optional)
     - `state` (string, optional)
     - `postalCode` (string, optional)
     - `dateOfBirth` (string, optional)
     - `ssn` (string, optional)
   - Permissions: Set "Any" for read/write (you can restrict later)

   **Banks Collection**:
   - Name: "banks"
   - Attributes:
     - `userId` (string, required)
     - `bankId` (string, required)
     - `accountId` (string, required)
     - `accessToken` (string, required)
     - `fundingSourceUrl` (string, optional)
     - `shareableId` (string, required)

   **Transactions Collection**:
   - Name: "transactions"
   - Attributes:
     - `name` (string, required)
     - `amount` (string, required)
     - `senderId` (string, required)
     - `senderBankId` (string, required)
     - `receiverId` (string, required)
     - `receiverBankId` (string, required)
     - `email` (string, required)
     - `channel` (string, required)
     - `category` (string, required)

3. **Get API Key**:
   - Go to Settings → API Keys
   - Create new API Key with full permissions
   - Copy the Secret Key

### Step 3: Update Environment Variables

Open `.env.local` and fill in your values:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT=YOUR_PROJECT_ID_HERE
APPWRITE_DATABASE_ID=YOUR_DATABASE_ID_HERE
APPWRITE_USER_COLLECTION_ID=YOUR_USERS_COLLECTION_ID_HERE
APPWRITE_BANK_COLLECTION_ID=YOUR_BANKS_COLLECTION_ID_HERE
APPWRITE_TRANSACTION_COLLECTION_ID=YOUR_TRANSACTIONS_COLLECTION_ID_HERE
APPWRITE_SECRET=YOUR_API_SECRET_KEY_HERE
```

### Step 4: Add Sign-Up Fields to AuthForm

The AuthForm needs additional fields for sign-up. Add these fields between email and password:

```tsx
{type === 'sign-up' && (
  <>
    <div className="flex gap-4">
      <FormField
        control={form.control}
        name="firstName"
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormLabel>First Name</FormLabel>
            <FormControl>
              <Input placeholder="Ex: John" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="lastName"
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormLabel>Last Name</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Doe" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>

    <FormField
      control={form.control}
      name="address1"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Address</FormLabel>
          <FormControl>
            <Input placeholder="Enter your address" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <div className="flex gap-4">
      <FormField
        control={form.control}
        name="city"
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormLabel>City</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Jakarta" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="state"
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormLabel>State</FormLabel>
            <FormControl>
              <Input placeholder="Ex: JK" maxLength={2} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="postalCode"
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormLabel>Postal Code</FormLabel>
            <FormControl>
              <Input placeholder="Ex: 12345" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>

    <div className="flex gap-4">
      <FormField
        control={form.control}
        name="dateOfBirth"
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormLabel>Date of Birth</FormLabel>
            <FormControl>
              <Input placeholder="YYYY-MM-DD" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="ssn"
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormLabel>SSN</FormLabel>
            <FormControl>
              <Input placeholder="Ex: 1234" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  </>
)}
```

### Step 5: Test the Authentication

1. Start your dev server: `npm run dev`
2. Go to http://localhost:3000/sign-up
3. Fill in the sign-up form with all required fields
4. Click "Sign Up"
5. If successful, you'll be redirected to the homepage
6. Check your Appwrite Database → Users collection to see the new user

### Step 6: Protect Routes

Create a middleware to protect authenticated routes:

Create `middleware.ts` in the root:

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('appwrite-session')
  
  // Public routes that don't require authentication
  const publicRoutes = ['/sign-in', '/sign-up']
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )
  
  // If no session and trying to access protected route
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }
  
  // If has session and trying to access auth pages
  if (session && isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

## 📝 Alternative: Use Supabase (Easier Setup)

If Appwrite seems complex, you can use Supabase instead:

1. Install: `npm install @supabase/supabase-js @supabase/auth-helpers-nextjs`
2. Create account at https://supabase.com
3. Create project and get API keys
4. Much simpler authentication with built-in UI components

## 🔒 Security Best Practices

1. **Never commit `.env.local`** - Add to `.gitignore`
2. **Use environment variables** - Never hardcode secrets
3. **Validate user input** - Already done with Zod schemas
4. **Use HTTPS** - In production, always use secure connections
5. **Rate limiting** - Implement to prevent brute force attacks

## 📚 Resources

- Appwrite Docs: https://appwrite.io/docs
- Next.js Auth: https://nextjs.org/docs/authentication
- Supabase Auth: https://supabase.com/docs/guides/auth

## ✅ Current Status

- ✅ Database connection code created
- ✅ Authentication functions ready
- ✅ Environment variables template created
- ⏳ Appwrite account setup needed
- ⏳ Environment variables configuration needed
- ⏳ Sign-up form fields need to be added
- ⏳ Testing required

Once you complete Steps 1-3, your authentication will be fully functional with a real database!

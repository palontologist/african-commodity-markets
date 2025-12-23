# Quick Guide: Testing Multi-Role System

## 1. View Your Current Profile

Once signed in and wallet connected, your profile is automatically created. To check it:

### Option A: Using Drizzle Studio (Recommended)
```bash
pnpm drizzle-kit studio
```
This opens a web UI at http://localhost:4983 where you can:
- View the `user_profiles` table
- See your userId, walletAddress, and current roles
- Edit roles directly in the UI

### Option B: Using API
Open browser console and run:
```javascript
const userId = 'your_clerk_user_id' // Get from Clerk dashboard or console
const response = await fetch(`/api/profile?userId=${userId}`)
const profile = await response.json()
console.log(profile)
```

## 2. Add Roles to Your Account

### Method 1: Direct Database Edit (Easiest)
```bash
# Open Drizzle Studio
pnpm drizzle-kit studio

# In the web UI:
1. Go to "user_profiles" table
2. Find your record (by walletAddress)
3. Click Edit
4. Change roles from: ["PUBLIC"]
   to: ["PUBLIC", "FARMER", "TRADER", "COOPERATIVE"]
5. Save
```

### Method 2: Using API in Browser Console
```javascript
// Get your userId first (check localStorage or Clerk)
const userId = 'user_xxx' // Your Clerk user ID

// Add FARMER role
await fetch('/api/profile', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: userId,
    addRole: 'FARMER'
  })
})

// Add TRADER role
await fetch('/api/profile', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: userId,
    addRole: 'TRADER'
  })
})

// Add COOPERATIVE role
await fetch('/api/profile', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: userId,
    addRole: 'COOPERATIVE'
  })
})

// Verify
const response = await fetch(`/api/profile?userId=${userId}`)
const profile = await response.json()
console.log(profile.roles) // Should show all roles
```

### Method 3: Using Turso CLI
```bash
# Connect to database
turso db shell your-database-name

# View profiles
SELECT * FROM user_profiles;

# Update roles (replace with your user_id)
UPDATE user_profiles 
SET roles = '["PUBLIC", "FARMER", "TRADER", "COOPERATIVE"]'
WHERE user_id = 'user_xxx';

# Verify
SELECT user_id, wallet_address, roles, active_role FROM user_profiles;
```

## 3. Test Role Switching

After adding roles:

1. **Refresh the page** (Cmd/Ctrl + R)
2. Look at the header - you should see a role switcher button
3. Click it to see a dropdown with all your roles
4. Click different roles and observe:
   - Navigation changes (e.g., clicking "Farmer" goes to `/farmer`)
   - Active role badge updates
   - Dashboard content changes

## 4. Test Each Dashboard

### PUBLIC Role
- Navigate to: `/marketplace`
- Can: Stake on markets, view insights
- Cannot: Create markets, list commodities

### FARMER Role
- Navigate to: `/farmer`
- Features:
  - View DVC score
  - Link to "Add Commodity" (farmer-vault)
  - See prediction markets
  - Track commodities and settlements

### TRADER Role
- Navigate to: `/trader`
- Features:
  - Portfolio view
  - P&L tracking
  - Market creation info (coming soon)
  - View all markets

### COOPERATIVE Role
- Navigate to: `/cooperative`
- Features:
  - Member management
  - Verification workflow
  - API access setup
  - Network analytics

## 5. Test DVC Score (Farmers)

Update DVC score to test tier system:

```javascript
// Set DVC score to 150 (unlocks 65% LTV)
await fetch('/api/profile', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'your_user_id',
    metadata: {
      dvcScore: 150
    }
  })
})

// Or directly in database:
// UPDATE user_profiles SET dvc_score = 150 WHERE user_id = 'user_xxx';
```

**DVC Tiers**:
- 0-99 DVC: 60% LTV advance rate
- 100-199 DVC: 65% LTV advance rate
- 200+ DVC: 70% LTV advance rate

## 6. Test KYC Status

```javascript
// Mark as KYC verified
await fetch('/api/profile', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'your_user_id',
    kycVerified: true
  })
})

// This will show a "✓ Verified" badge in the header
```

## 7. Common Issues & Solutions

### Issue: Role switcher not showing
**Solution**: 
- Make sure you're signed in (Clerk)
- Wallet must be connected
- Refresh the page after signing in

### Issue: Can't access role dashboard
**Solution**:
- Check you have the role: `GET /api/profile?userId=xxx`
- Verify roles array includes the role name
- Check browser console for errors

### Issue: Profile not found
**Solution**:
- Profile is auto-created on first wallet connection
- Try disconnecting and reconnecting wallet
- Check `userProfiles` table in database

### Issue: Role not updating
**Solution**:
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Clear localStorage
- Check API response for errors

## 8. Finding Your User ID

### Method 1: Browser Console
```javascript
// After signing in with Clerk
console.log(localStorage)
// Look for items containing "user_" - that's your Clerk user ID
```

### Method 2: Clerk Dashboard
1. Go to https://dashboard.clerk.com
2. Select your app
3. Go to "Users"
4. Find your user
5. Copy the user ID (starts with "user_")

### Method 3: Database
```bash
pnpm drizzle-kit studio
# Look at user_profiles table, the user_id column
```

## 9. Quick Test Script

Run this in browser console after signing in:

```javascript
async function testMultiRole() {
  // Get your user ID from localStorage or Clerk
  const userId = 'user_xxx' // REPLACE THIS
  
  console.log('1. Fetching profile...')
  const profile = await fetch(`/api/profile?userId=${userId}`).then(r => r.json())
  console.log('Current profile:', profile)
  
  console.log('2. Adding FARMER role...')
  await fetch('/api/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, addRole: 'FARMER' })
  })
  
  console.log('3. Adding TRADER role...')
  await fetch('/api/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, addRole: 'TRADER' })
  })
  
  console.log('4. Verifying roles...')
  const updated = await fetch(`/api/profile?userId=${userId}`).then(r => r.json())
  console.log('Updated profile:', updated)
  
  console.log('5. All done! Refresh the page to see role switcher.')
}

// Run it
testMultiRole()
```

## 10. Reset to Default

If you want to reset to PUBLIC only:

```javascript
// Using API
await fetch('/api/profile', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'your_user_id',
    removeRole: 'FARMER'
  })
})

// Or in database
UPDATE user_profiles 
SET roles = '["PUBLIC"]', active_role = 'PUBLIC'
WHERE user_id = 'user_xxx';
```

## 11. Development Tips

### Watch for errors
```bash
# Terminal where dev server is running
# Watch for API errors or TypeScript issues
```

### Check network tab
- Open DevTools → Network
- Look for `/api/profile` requests
- Verify request/response payloads

### Use React DevTools
- Install React DevTools extension
- Find `UserProfileContext.Provider`
- Inspect current profile state

---

## Need Help?

If something isn't working:
1. Check browser console for errors
2. Verify database has `user_profiles` table
3. Confirm you're signed in with Clerk
4. Make sure wallet is connected
5. Check the role exists in the `roles` array

**Everything is working if**:
- ✅ Role switcher appears in header (when signed in)
- ✅ Clicking roles navigates to dashboards
- ✅ Active role shows "Active" badge
- ✅ DVC score displays (if set)
- ✅ Each dashboard shows role-specific content

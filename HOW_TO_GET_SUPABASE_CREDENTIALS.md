# 🔑 How to Get Your Supabase Credentials

## Step-by-Step Guide with Screenshots

### Step 1: Log into Supabase
1. Go to: **https://supabase.com/dashboard**
2. Sign in with your account
3. You should see a list of your projects

### Step 2: Select Your Project
1. Click on the project that's connected to your backend server
   - Look for the project that has your `orders` table
   - This is the same project configured in your `server/.env` file
   - The name should match your `SUPABASE_URL` environment variable

### Step 3: Navigate to API Settings
1. On the left sidebar, click **Settings** (gear icon at bottom)
2. In the Settings menu, click **API**
3. You'll see the "Project API keys" section

### Step 4: Copy Your Credentials

You'll see several pieces of information. You need these two:

#### 1. Project URL
```
Location: "Config" section at the top
Label: "Project URL"
Format: https://xxxxxxxxxxxxx.supabase.co
```

**Example:**
```
https://abcdefghijklmnop.supabase.co
```

**Copy this entire URL!**

#### 2. Anon (Public) Key
```
Location: "Project API keys" section
Label: "anon public"
Format: Starts with "eyJ..."
```

**Example:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzOTU4NjQwMCwiZXhwIjoxOTU1MTYyNDAwfQ.aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789...
```

**Click the copy icon to copy this key!**

---

## Important: Which Key to Use?

### ✅ USE THIS: `anon public`
- **Safe for browser use**
- **Labeled:** "anon public" or just "anon"
- **Protected by Row Level Security**
- **This is the one you need!**

### ❌ DON'T USE: `service_role secret`
- **Never use in browser code!**
- **Labeled:** "service_role" (has a red warning icon)
- **Bypasses all security**
- **Only for server-side use**

---

## Paste Into Your Code

Once you have both values:

1. Open `supabase-config.js` in your code editor
2. Find these lines near the top:
   ```javascript
   const SUPABASE_URL = 'https://your-project.supabase.co'; // Replace with your Supabase URL
   const SUPABASE_ANON_KEY = 'your-anon-key'; // Replace with your Supabase anon key
   ```

3. Replace with your actual values:
   ```javascript
   const SUPABASE_URL = 'https://abcdefghijklmnop.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSI...';
   ```

4. Save the file

---

## Verification Checklist

Before deploying, verify:

- [ ] SUPABASE_URL starts with `https://`
- [ ] SUPABASE_URL ends with `.supabase.co`
- [ ] SUPABASE_ANON_KEY starts with `eyJ`
- [ ] SUPABASE_ANON_KEY is several hundred characters long
- [ ] You're using the `anon` key, NOT the `service_role` key
- [ ] Both values are wrapped in quotes `'...'`
- [ ] No spaces at the beginning or end of the strings

---

## Example: Complete Configuration

```javascript
// Supabase Configuration for Admin Dashboard
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/+esm';

// ✅ CORRECT - Real values pasted from Supabase dashboard
const SUPABASE_URL = 'https://abcdefghijklmnop.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzOTU4NjQwMCwiZXhwIjoxOTU1MTYyNDAwfQ.aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789';

// ... rest of file
```

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Using the Service Role Key
```javascript
// WRONG! This is the service_role key (too dangerous for browser)
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...InJvbGUiOiJzZXJ2aWNlX3JvbGUi...';
//                                                              ^^^^^^^^^^^^^ service_role
```

**Fix:** Use the `anon` key instead!

### ❌ Mistake 2: Wrong Project
```javascript
// WRONG! This is a different Supabase project
const SUPABASE_URL = 'https://differentproject.supabase.co';
```

**Fix:** Make sure the URL matches your backend's `SUPABASE_URL` environment variable

### ❌ Mistake 3: Missing Quotes
```javascript
// WRONG! Missing quotes around the values
const SUPABASE_URL = https://abcd.supabase.co;
const SUPABASE_ANON_KEY = eyJ...;
```

**Fix:** Add quotes: `'https://...'` and `'eyJ...'`

### ❌ Mistake 4: Extra Spaces
```javascript
// WRONG! Extra spaces at the end
const SUPABASE_URL = 'https://abcd.supabase.co ';
const SUPABASE_ANON_KEY = ' eyJ...';
```

**Fix:** Remove all leading/trailing spaces

---

## Finding Your Project Name

If you have multiple Supabase projects and aren't sure which one to use:

### Method 1: Check Your Backend .env File
```bash
# In your server/.env file, look for:
SUPABASE_URL=https://xxxxx.supabase.co

# The "xxxxx" part is your project reference
# Find the project with the same reference in the Supabase dashboard
```

### Method 2: Check the Orders Table
1. In Supabase dashboard, open each project
2. Click "Table Editor" in the left sidebar
3. Look for a table called `orders`
4. The project with the `orders` table is the correct one

### Method 3: Check for Recent Data
1. Open each project's Table Editor
2. Click on the `orders` table
3. Look for recent order data that matches your website's orders
4. That's the correct project!

---

## Security Note

### Is it safe to commit these credentials to Git?

**The anon key:** ✅ **Generally safe** (it's public by design)
- Protected by Row Level Security (RLS)
- Can be restricted by domain
- Rate-limited by Supabase

**Better approach:** 🔒 **Use environment variables**

If you want extra security:

1. Create a `.env` file (don't commit this):
   ```
   VITE_SUPABASE_URL=https://abcd.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

2. Use build-time replacement in your build process
3. Or fetch credentials from a secure config endpoint

**For most cases:** The anon key is safe to commit (but enable RLS!)

---

## After Configuration

Once you've updated `supabase-config.js`:

1. **Save the file**
2. **Commit to Git:**
   ```bash
   git add supabase-config.js
   git commit -m "Configure Supabase integration"
   git push
   ```
3. **Wait for deployment** (GitHub Pages auto-deploys)
4. **Open admin dashboard** in browser
5. **Open console** (press F12)
6. **Look for:** `✅ Supabase initialized`

---

## Troubleshooting

### "Supabase not initialized"
- Check that both URL and key are set
- Verify no typos in the credentials
- Make sure quotes are present
- Check browser console for specific errors

### "Invalid API key"
- Verify you copied the entire key
- Make sure you're using the `anon` key, not `service_role`
- Check for extra spaces or line breaks

### "Project not found"
- Verify the URL is correct
- Check that the project still exists in your Supabase dashboard
- Ensure the URL includes `https://`

---

## Next Steps

After configuring:

1. ✅ Test the admin dashboard
2. ✅ Verify orders appear from Supabase
3. ⏳ Consider enabling Row Level Security
4. ⏳ Consider adding admin authentication

**Need more help?** Check `SUPABASE_ADMIN_SETUP.md` for complete troubleshooting guide.

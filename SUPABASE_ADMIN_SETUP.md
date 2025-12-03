# Supabase Admin Dashboard Setup Guide

## Overview
The admin dashboard now integrates with **both Firebase and Supabase** to display all orders:
- **Firebase**: Abandoned carts, test orders, manual orders
- **Supabase**: Production Stripe payment orders

## Quick Setup

### Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard at https://supabase.com/dashboard
2. Click on your project (the one connected to your backend server)
3. Go to **Settings** → **API**
4. Copy these two values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### Step 2: Configure the Admin Dashboard

1. Open `supabase-config.js` in your code editor
2. Replace the placeholder values with your actual credentials:

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co'; // Replace with your URL
const SUPABASE_ANON_KEY = 'your-anon-key'; // Replace with your anon key
```

**Example:**
```javascript
const SUPABASE_URL = 'https://abcdefghijklmnop.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSI...';
```

### Step 3: Deploy and Test

1. Save the file
2. Deploy to your hosting (GitHub Pages, etc.)
3. Open the admin dashboard
4. Check the browser console (F12) for:
   - ✅ `Supabase client initialized`
   - ✅ `Supabase initialized - will fetch production Stripe orders`

## What You'll See

Once configured, the admin dashboard will:
- ✅ Show **all orders** from both Firebase and Supabase
- ✅ Display production Stripe orders with status 'created' or 'paid'
- ✅ Merge and deduplicate orders from both sources
- ✅ Update order status in **both** databases when you change it

## Security Notes

### Is it safe to use the anon key in the browser?
**Yes!** The anon key is designed to be used in client-side code. It's protected by:

1. **Row Level Security (RLS)**: Supabase uses RLS policies to control what data can be accessed
2. **Domain restrictions**: You can restrict which domains can use your Supabase API
3. **Rate limiting**: Supabase has built-in rate limiting to prevent abuse

### Setting Up Row Level Security (Recommended)

To ensure only authorized users can view/update orders:

1. Go to your Supabase dashboard
2. Navigate to **Authentication** → **Policies**
3. Select the `orders` table
4. Add a policy that requires authentication:

```sql
-- Allow authenticated users to read orders
CREATE POLICY "Enable read access for authenticated users" ON orders
FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow authenticated users to update orders
CREATE POLICY "Enable update for authenticated users" ON orders
FOR UPDATE
USING (auth.role() = 'authenticated');
```

**Note**: Since your admin dashboard doesn't currently have authentication, you may want to:
- Option A: Add authentication to the admin dashboard (recommended)
- Option B: Use IP restrictions in Supabase settings
- Option C: Keep RLS disabled for now (less secure)

## Troubleshooting

### Orders not appearing from Supabase

**Check the console:**
```javascript
// You should see:
✅ Supabase initialized - will fetch production Stripe orders
💾 Loading orders from Supabase, filter: all
📋 Supabase orders found: X
```

**Common issues:**
- ❌ `Supabase not initialized` → Check that credentials are set in `supabase-config.js`
- ❌ `No orders found in Supabase` → Your Supabase `orders` table may be empty
- ❌ `Supabase query error` → Check RLS policies or table permissions

### Cannot update order status

If you see errors when updating status:
1. Check that RLS policies allow updates (see Security Notes above)
2. Verify the order ID matches exactly in the database
3. Check browser console for specific error messages

### Orders appearing twice

If the same order appears twice:
- This means the order exists in BOTH Firebase and Supabase
- The dashboard should automatically deduplicate based on order ID or Stripe session ID
- Check console for: `🔄 Duplicate order removed: XXX`

## Testing the Integration

### 1. Verify Supabase Connection
```javascript
// Open browser console on admin dashboard and run:
console.log('Supabase available:', !!window.supabase);
```

### 2. Check Order Sources
After orders load, check the console for:
```javascript
📊 Combined orders: {
  firebase: 5,    // Orders from Firebase
  supabase: 12,   // Orders from Supabase
  total: 17,      // Total unique orders
  revenue: '450.00'
}
```

### 3. Test Status Update
1. Find a Supabase order (status will be 'created' or 'paid')
2. Change the status using the dropdown
3. Check console for: `✅ Supabase order updated`

## Database Schema Reference

### Supabase `orders` table columns:
```
id (text, primary key)
stripe_session_id (text)
customer_name (text)
customer_email (text)
shipping_address (text)
shipping_city (text)
shipping_state (text)
shipping_zip (text)
items (jsonb)
subtotal_amount (numeric)
shipping_amount (numeric)
tax_amount (numeric)
total_amount (numeric)
discount_amount (numeric)
discount_code (text)
status (text)
created_at (timestamp)
updated_at (timestamp)
```

### Firebase `orders` collection fields:
```
customerInfo { name, email, address, city, state, zip }
items [ { name, price, quantity } ]
orderDetails { subtotal, shipping, tax, total, discount }
status (string)
timestamp (Firestore timestamp)
emailSent (boolean)
```

## Next Steps

1. ✅ Configure Supabase credentials in `supabase-config.js`
2. ✅ Test order loading in the admin dashboard
3. ⏳ Consider adding authentication to the admin dashboard
4. ⏳ Set up Row Level Security policies in Supabase
5. ⏳ Configure domain restrictions in Supabase settings

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your Supabase credentials are correct
3. Ensure the `orders` table exists in your Supabase project
4. Check that RLS policies (if enabled) allow read/update access

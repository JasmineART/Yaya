# 🔧 EmailJS Gmail API Scope Error Fix

## Problem
**Error:** `Gmail_API: Request had insufficient authentication scopes`

This means EmailJS doesn't have permission to send emails through Gmail on your behalf.

## Root Cause
When you connected Gmail to EmailJS, it wasn't granted the correct OAuth2 scopes (permissions) to send emails. EmailJS needs the `https://www.googleapis.com/auth/gmail.send` scope.

---

## Solution: Reconnect Gmail with Correct Scopes

### Step 1: Remove Current Gmail Connection

1. **Log in to EmailJS Dashboard**
   - Go to: https://dashboard.emailjs.com/
   - Sign in with faeriepoetics@gmail.com

2. **Navigate to Email Services**
   - Click "Email Services" in left sidebar
   - Find your Gmail service (`service_eodjffq`)

3. **Remove the Connection**
   - Click on the service
   - Click "Remove" or "Disconnect"
   - Confirm removal

### Step 2: Reconnect Gmail with Proper Permissions

1. **Add New Gmail Service**
   - Click "Add New Service"
   - Select "Gmail"

2. **Authorize with Full Permissions**
   - Click "Connect Account"
   - Sign in with **faeriepoetics@gmail.com**
   
3. **IMPORTANT: Grant ALL Permissions**
   When Google asks for permissions, you should see:
   - ✅ Send email on your behalf
   - ✅ View your email messages
   - ✅ Manage drafts and send emails
   
   **Click "Allow" to grant ALL permissions**

4. **Save Service**
   - Note the new Service ID (should still be `service_eodjffq`)
   - Click "Save"

### Step 3: Update Templates

1. **Newsletter Template (`template_b6rgdel`)**
   - Go to Email Templates
   - Open your newsletter template
   - Verify template has these variables:
     - `{{to_email}}` - Recipient email
     - `{{user_email}}` - Subscriber email
     - `{{from_name}}` - Sender name
   - Subject: "New Newsletter Subscriber"
   - Body should send to: `{{to_email}}`

2. **Order Template (`template_New_Order`)**
   - Go to Email Templates
   - Open your order template (or create if missing)
   - Verify template has:
     - `{{to_email}}` - faeriepoetics@gmail.com
     - `{{customer_name}}` - Customer's name
     - `{{customer_email}}` - Customer's email
     - `{{order_total}}` - Order amount
     - `{{order_items}}` - Items list
   - Subject: "New Order - ${{order_total}}"

### Step 4: Test Email Configuration

1. **Go to EmailJS Dashboard → Email Services**
2. **Click "Send Test Email" on your Gmail service**
3. **Enter faeriepoetics@gmail.com as recipient**
4. **Click "Send"**
5. **Check inbox** - You should receive test email ✅

If test email fails, Gmail needs re-authentication.

---

## Alternative: Check Gmail App Permissions

### Option A: Review Gmail Third-Party Access

1. **Go to Google Account Settings**
   - Visit: https://myaccount.google.com/permissions
   - Sign in with faeriepoetics@gmail.com

2. **Find EmailJS in Connected Apps**
   - Look for "EmailJS" or "email.js"
   - Click on it

3. **Verify Permissions Include:**
   - ✅ Send email on your behalf
   - ✅ View and manage your email
   - ✅ See, edit, create, and delete email messages

4. **If permissions are missing:**
   - Click "Remove Access"
   - Go back to EmailJS and reconnect

### Option B: Enable Less Secure App Access (Not Recommended)

⚠️ **Only use if reconnecting doesn't work**

1. Go to: https://myaccount.google.com/security
2. Under "Less secure app access" → Turn ON
3. Test EmailJS again

**NOTE:** This is less secure. Better to use proper OAuth2 scopes.

---

## Verify Fix is Working

### Test 1: Newsletter Signup
1. Go to your website homepage
2. Enter test email in newsletter form
3. Submit
4. Check faeriepoetics@gmail.com inbox
5. Should receive: "New Newsletter Subscriber" email ✅

### Test 2: Order Notification
1. Go to shop page
2. Add item to cart
3. Complete checkout
4. Check faeriepoetics@gmail.com inbox
5. Should receive: "New Order" email ✅

---

## If Still Not Working: Use EmailJS Support Token

### Generate New OAuth Token

1. **In EmailJS Dashboard → Email Services**
2. **Click "Edit" on Gmail service**
3. **Click "Re-authenticate"**
4. **Sign in with faeriepoetics@gmail.com**
5. **Grant ALL permissions when asked**
6. **Save**

### Update Template Settings

Make sure templates send TO the correct email:

**In each template:**
- Set "To Email" field to: `{{to_email}}`
- NOT hardcoded to faeriepoetics@gmail.com

Then in your code (already correct in `simple-email.js`):
```javascript
templateParams = {
  to_email: 'faeriepoetics@gmail.com',  // ✅ This sends to you
  user_email: data.email,                // Customer's email
  // ... other fields
};
```

---

## Required OAuth2 Scopes for EmailJS + Gmail

EmailJS needs these Google OAuth2 scopes:
- ✅ `https://www.googleapis.com/auth/gmail.send`
- ✅ `https://www.googleapis.com/auth/gmail.readonly`
- ✅ `https://www.googleapis.com/auth/gmail.compose`

**These are automatically requested when connecting Gmail to EmailJS, but you MUST approve them.**

---

## Emergency Backup: Switch to Different Email Service

If Gmail continues having scope issues:

### Option 1: Use Personal Email (Recommended Temporarily)
1. EmailJS Dashboard → Add New Service
2. Choose "Personal Email Service" instead of Gmail
3. Enter your email settings:
   - SMTP Server: smtp.gmail.com
   - Port: 587
   - Username: faeriepoetics@gmail.com
   - Password: (Use App Password - see below)

### How to Create Gmail App Password:
1. Go to: https://myaccount.google.com/apppasswords
2. Sign in with faeriepoetics@gmail.com
3. Select app: "Mail"
4. Select device: "Other (Custom name)"
5. Enter: "EmailJS Yaya Site"
6. Click "Generate"
7. Copy 16-character password
8. Use this in EmailJS Personal Email setup

### Option 2: Use SendGrid (Free Alternative)
1. Sign up at: https://sendgrid.com/
2. Free tier: 100 emails/day
3. Connect SendGrid to EmailJS
4. Update Service ID in code

---

## Quick Diagnostic Commands

Check current EmailJS status:
```javascript
// Run in browser console on your site
console.log('Service ID:', 'service_eodjffq');
console.log('User ID:', 'FWvhfYEosGwcS5rxq');
console.log('Templates:', {
  newsletter: 'template_b6rgdel',
  order: 'template_New_Order'
});

// Test EmailJS is loaded
console.log('EmailJS loaded:', typeof emailjs !== 'undefined');
```

---

## Current Configuration (From Your Code)

File: `simple-email.js`
```javascript
const EMAILJS_CONFIG = {
  serviceId: 'service_eodjffq',           // ✅ Correct
  newsletterTemplateId: 'template_b6rgdel',  // ✅ Correct
  orderTemplateId: 'template_New_Order',      // ✅ Correct
  userId: 'FWvhfYEosGwcS5rxq'             // ✅ Correct
};
```

**The configuration is correct. The issue is OAuth permissions in EmailJS dashboard.**

---

## Expected Timeline

1. Reconnect Gmail to EmailJS: **5 minutes**
2. Grant proper permissions: **1 minute**
3. Test emails: **2 minutes**
4. **Total: ~10 minutes**

---

## Success Indicators

✅ Test email sent from EmailJS dashboard  
✅ Newsletter signup sends email to faeriepoetics@gmail.com  
✅ Order confirmation sends email to faeriepoetics@gmail.com  
✅ No "insufficient authentication scopes" error  
✅ Emails appear in Gmail inbox (not spam)  

---

## Still Having Issues?

**Contact EmailJS Support:**
- Dashboard → Help → Contact Support
- Describe: "Gmail API insufficient authentication scopes error"
- They can manually fix OAuth permissions on their end

**Or contact me with:**
- Exact error message from browser console
- Screenshot of EmailJS dashboard Email Services page
- Result of test email from EmailJS dashboard

---

**Next Steps:**
1. Log in to EmailJS dashboard
2. Remove and reconnect Gmail service
3. Grant ALL permissions when asked
4. Test email delivery
5. Confirm fix working on live site

Let me know once you've reconnected Gmail and I can help verify it's working!

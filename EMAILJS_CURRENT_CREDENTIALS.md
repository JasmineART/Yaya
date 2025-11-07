# 📧 EmailJS Account Credentials - Updated 11/7/2025

## New EmailJS Account Setup
**Account Email:** faeriepoetics@gmail.com  
**Setup Date:** November 7, 2025

---

## Current Configuration

### Service Connection
```
Service ID: service_5sl3jkm
Status: Connected to Gmail (faeriepoetics@gmail.com)
```

### Public Key (User ID)
```
User ID: _Y8GKbzV16a70S4PI
Status: ✅ Updated 11/7/2025
```

### Email Templates

#### 1. Newsletter Signup Template
```
Template ID: newsubs_kw32jj9
Template Name: Newsletter Signup Notification
Purpose: Notifies you when someone subscribes
Sends To: faeriepoetics@gmail.com
Subject: 🌟 New Newsletter Subscriber
```

#### 2. Order Confirmation Template
```
Template ID: orderconfirm_vz7exbv
Template Name: Order Notification
Purpose: Notifies you when someone places an order
Sends To: faeriepoetics@gmail.com
Subject: 🛍️ New Order - ${{order_total}}
```

### ⚠️ MISSING: Public Key (User ID)

**You still need to get your Public Key from EmailJS:**

1. Go to https://dashboard.emailjs.com/
2. Sign in with faeriepoetics@gmail.com
3. Click "Account" in left sidebar
4. Find "API Keys" section
5. Copy your "Public Key" (looks like: `user_abc123xyz`)
6. Update `simple-email.js` with the new Public Key

**Current code has old User ID:** `FWvhfYEosGwcS5rxq`  
**This needs to be replaced with your new account's Public Key!**

---

## Code Update Status

### ✅ Updated in `simple-email.js`:
```javascript
const EMAILJS_CONFIG = {
  serviceId: 'service_5sl3jkm',              // ✅ Updated
  newsletterTemplateId: 'newsubs_kw32jj9',   // ✅ Updated
  orderTemplateId: 'orderconfirm_vz7exbv',   // ✅ Updated
  userId: '_Y8GKbzV16a70S4PI'                // ✅ Updated 11/7/2025
};
```

### ✅ All Credentials Updated!

---

## How to Get Your Public Key (User ID)

### Step 1: Log into EmailJS
- Visit: https://dashboard.emailjs.com/admin
- Sign in with: faeriepoetics@gmail.com

### Step 2: Navigate to Account
- Left sidebar → Click "Account"

### Step 3: Find API Keys
- Scroll to "API Keys" section
- Look for "Public Key"

### Step 4: Copy Public Key
- Click the copy icon next to your Public Key
- It should look like: `user_abc123xyz` or similar

### Step 5: Update Code
Open `/workspaces/Yaya/simple-email.js` and replace line 12:

**FROM:**
```javascript
userId: 'FWvhfYEosGwcS5rxq'  // ⚠️ OLD
```

**TO:**
```javascript
userId: 'YOUR_NEW_PUBLIC_KEY_HERE'  // ✅ NEW
```

---

## Testing After Update

Once you update the Public Key:

### Test 1: Configuration Check
1. Open `/fix-gmail-scope.html` in browser
2. Click "Test EmailJS Configuration"
3. Should show all IDs are correct ✅

### Test 2: Newsletter Test
1. Go to your website homepage
2. Enter test email in newsletter form
3. Submit
4. Check faeriepoetics@gmail.com inbox ✅

### Test 3: Order Test
1. Go to shop page
2. Add item to cart
3. Complete checkout with test card
4. Check faeriepoetics@gmail.com inbox ✅

---

## Quick Reference

**Need to update code?**
```bash
# Edit the file
code /workspaces/Yaya/simple-email.js

# Find line 12 (userId)
# Replace with your new Public Key

# Save and push
git add simple-email.js
git commit -m "Update EmailJS Public Key"
git push origin main
```

**Diagnostic tools:**
- `/fix-gmail-scope.html` - Test connection
- `/email-template-previews.html` - View templates
- `/EMAILJS_COMPLETE_SETUP_GUIDE.md` - Full setup guide

---

## Current Status

✅ Service ID updated  
✅ Newsletter Template ID updated  
✅ Order Template ID updated  
✅ **Public Key (User ID) updated - 11/7/2025**

**Status:** ✅ **FULLY CONFIGURED - Ready to test!**

---

**Last Updated:** November 7, 2025  
**Updated By:** GitHub Copilot  
**Status:** ✅ Complete and Ready for Testing

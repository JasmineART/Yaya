# 🔧 Complete Render & Stripe Configuration Guide
**Last Updated:** October 28, 2025  
**Service:** yaya-1dc3.onrender.com (srv-d3vpra7diees73ai05g0)

---

## 🔐 SECURITY FIRST: Never Store Secrets in Code

**⚠️ CRITICAL:** Secret keys must ONLY be stored in environment variables, never in Git, documentation, or client-side code.

---

## ⚡ Quick Setup Checklist

- [ ] Get Stripe Secret Key from Stripe Dashboard (see instructions below)
- [ ] Add `STRIPE_SECRET_LIVE_KEY` to Render environment variables
- [ ] Wait for Render to redeploy (2-3 minutes)
- [ ] Test health endpoint: `curl https://yaya-1dc3.onrender.com/_health`
- [ ] Verify `stripe.configured: true` in response
- [ ] Test checkout flow on pastelpoetics.com

---

## 1. Get Your Stripe Secret Key

### A. Access Stripe Dashboard
1. Log into https://dashboard.stripe.com/
2. Click **"Developers"** in top navigation
3. Click **"API keys"** in left sidebar
4. Ensure you're in **"Live mode"** (toggle in top right - should show blue "Live" badge)

### B. Reveal and Copy Secret Key
1. Find **"Secret key"** in the "Standard keys" section
2. Click **"Reveal live key token"**
3. The key starts with `sk_live_` followed by 103 characters
4. Total length: **107 characters**
5. Click the copy icon or select all and copy
6. **⚠️ Do NOT save this key anywhere except Render Dashboard**

---

## 2. Configure Render Environment Variables

### A. Access Render Dashboard
```
https://dashboard.render.com/web/srv-d3vpra7diees73ai05g0
```

### B. Add Stripe Secret Key
1. Click **"Environment"** tab in left sidebar
2. Click **"Add Environment Variable"** button
3. Enter the following:
   - **Key:** `STRIPE_SECRET_LIVE_KEY`
   - **Value:** Paste your Stripe secret key from step 1 above
4. Click **"Save Changes"**
5. ⏳ Render will automatically trigger a redeploy (2-3 minutes)

### C. Watch Deployment Logs
1. Click **"Logs"** tab
2. Watch for these messages:
   ```
   🔧 Server Configuration:
     Stripe: ✅ Configured
     STRIPE_SECRET_LIVE_KEY: ✅ Set (107 chars)
   🚀 Server running on port 10000
   💳 Ready to process payments: true
   ```

---

## 3. Verify Configuration

### Test 1: Health Check (Detailed Diagnostics)
```bash
curl https://yaya-1dc3.onrender.com/_health
```

**Expected Response:**
```json
{
  "ok": true,
  "environment": {
    "stripe": {
      "configured": true,
      "has_STRIPE_SECRET_LIVE_KEY": true,
      "key_length": 107,
      "expected_length": 107
    },
    "supabase": {
      "configured": false,
      "has_SUPABASE_URL": false,
      "has_SUPABASE_SERVICE_ROLE": false
    },
    "email": {
      "smtp_configured": false,
      "sendgrid_configured": false
    }
  },
  "status": {
    "ready_for_payments": true,
    "ready_for_orders": false,
    "ready_for_emails": false
  }
}
```

### Test 2: Root Endpoint (Quick Check)
```bash
curl https://yaya-1dc3.onrender.com/
```

**Expected Response:**
```json
{
  "ok": true,
  "server": "Yaya payments mock server",
  "configured": {
    "stripe": true,
    "supabase": false
  }
}
```

### Test 3: Create Stripe Session (Full Test)
```bash
curl -X POST https://yaya-1dc3.onrender.com/create-stripe-session \
  -H "Content-Type: application/json" \
  -H "Origin: https://pastelpoetics.com" \
  -d '{
    "items": [{"id":1,"name":"Test Product","price":10,"quantity":1}],
    "customer": {"name":"Test User","email":"test@test.com"},
    "total": 10
  }'
```

**Success Response:**
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_...",
  "id": "cs_live_..."
}
```

**Error Response (not configured):**
```json
{
  "error": "Stripe not configured"
}
```

---

## 4. Stripe Publishable Key (Client-Side)

### ✅ Already Configured
The publishable key is safe to include in client-side code and is already set in `checkout.html`:

**File:** `checkout.html` (line 19)
```javascript
stripePublishableKey: 'pk_live_51SM7yMRMDdiM5E9AoXPdpUxWXxK3h2ZlOwy2hbqwp4o2BHAr2bM30LKSuNv8AdeMJV0l6nfhvIa2Hzxny8VI9GQx00dDiIoUZ6'
```

**Note:** Publishable keys (starting with `pk_`) are designed to be public and safe to commit to Git.

---

## 📋 All Environment Variables

### REQUIRED for Payments

| Variable Name | Where to Get It | Status |
|---------------|-----------------|--------|
| `STRIPE_SECRET_LIVE_KEY` | Stripe Dashboard → Developers → API Keys | ⚠️ **SET THIS** |

### OPTIONAL but Recommended

| Variable Name | Purpose | Required? |
|---------------|---------|-----------|
| `NODE_ENV` | Set to `production` | Recommended |
| `PORT` | Server port (auto-set by Render) | Auto-configured |

### OPTIONAL: Order Storage

| Variable Name | Purpose | Get From |
|---------------|---------|----------|
| `SUPABASE_URL` | Database for orders | Supabase Dashboard |
| `SUPABASE_SERVICE_ROLE` | Admin key for Supabase | Supabase Dashboard |

### OPTIONAL: Email Notifications

**Option 1: SendGrid**
```
SENDGRID_API_KEY=your_key_from_sendgrid
EMAIL_FROM=orders@pastelpoetics.com
COMPANY_EMAIL=jasmine@pastelpoetics.com
```

**Option 2: SMTP (Gmail, etc.)**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
COMPANY_EMAIL=jasmine@pastelpoetics.com
```

---

## 🔍 Troubleshooting

### Problem: "Stripe not configured" Error

**Step 1: Check Health Endpoint**
```bash
curl -s https://yaya-1dc3.onrender.com/_health | python3 -m json.tool
```

**Diagnose the response:**
- `stripe.configured: false` → Environment variable issue
- `has_STRIPE_SECRET_LIVE_KEY: false` → Variable not set or wrong name
- `key_length: 0` → Empty value
- `key_length: < 107` → Truncated key or wrong key

**Step 2: Fix in Render**
1. Go to Render Dashboard → Environment
2. Verify variable name is **exactly** `STRIPE_SECRET_LIVE_KEY` (case-sensitive)
3. Click the edit icon (pencil)
4. Verify the value:
   - Starts with `sk_live_`
   - Has no leading/trailing spaces
   - Is exactly 107 characters
5. If wrong, delete and re-add
6. Click **"Save Changes"**
7. Wait 2-3 minutes for redeploy

**Step 3: Check Render Logs**
1. Click **"Logs"** tab
2. Look for startup messages:
   ```
   🔧 Server Configuration:
     Stripe: ✅ Configured
   ```

### Problem: Server Not Responding / 503 Errors

**Cause:** Render free tier hibernates after 15 minutes of inactivity

**Solution:**
```bash
# Trigger manual deployment
curl -X POST https://api.render.com/deploy/srv-d3vpra7diees73ai05g0?key=LzX1rEwy08w
```
Wait 2-3 minutes, then retry.

### Problem: CORS Errors from pastelpoetics.com

**Already Configured:** Server allows:
- https://pastelpoetics.com
- https://www.pastelpoetics.com

**Verify:**
1. Request must be from exactly `https://pastelpoetics.com` (no trailing slash)
2. Include header: `Origin: https://pastelpoetics.com`
3. Include header: `Content-Type: application/json`

---

## 🔐 Security Best Practices

### ✅ **DO:**
- **Store secret keys ONLY in environment variables** (Render Dashboard)
- **Use HTTPS for all production traffic** (enforced by default)
- **Keep publishable keys in client code** (designed to be public - start with `pk_`)
- **Regularly rotate API keys** if you suspect compromise
- **Use Stripe webhooks** with webhook secrets for secure event handling
- **Never log secret keys** in application logs or error messages
- **Review Render logs** to ensure secrets aren't accidentally printed

### ❌ **DON'T:**
- **Never commit secret keys to Git** (keys starting with `sk_` or `rk_`)
- **Never share secret keys** in documentation, chat, email, or screenshots
- **Never use test keys in production** (test keys start with `sk_test_`)
- **Never hardcode keys** in source files (always use `process.env`)
- **Never expose secret keys** in client-side JavaScript
- **Never include secret keys** in HTTP requests from browsers
- **Never store secret keys** in browser localStorage or cookies

### 🔑 Stripe Key Types Reference

| Key Type | Prefix | Safe for Git? | Safe for Client? | Where to Store |
|----------|--------|---------------|------------------|----------------|
| **Secret Key** | `sk_live_` | ❌ NEVER | ❌ NO | Server env vars ONLY |
| **Publishable Key** | `pk_live_` | ✅ YES | ✅ YES | Client code, Git |
| **Test Secret** | `sk_test_` | ❌ NEVER | ❌ NO | Dev env vars only |
| **Test Publishable** | `pk_test_` | ✅ YES | ✅ YES | Dev client code |
| **Webhook Secret** | `whsec_` | ❌ NEVER | ❌ NO | Server env vars only |
| **Restricted Key** | `rk_live_` | ❌ NEVER | ❌ NO | Server env vars only |

---

## 🚨 What To Do If a Secret Key is Compromised

### Immediate Actions:

**1. Roll the Key in Stripe Dashboard**
1. Go to https://dashboard.stripe.com/apikeys
2. Click **"Roll key"** next to the compromised key
3. Click **"Roll key"** to confirm
4. Copy the new key

**2. Update Render Environment Variable**
1. Go to Render Dashboard → Environment
2. Edit `STRIPE_SECRET_LIVE_KEY`
3. Paste the new key
4. Save changes
5. Wait for redeploy

**3. Review Stripe Activity**
- Check https://dashboard.stripe.com/logs
- Look for unexpected API calls
- Check for unauthorized payments

**4. If Committed to Git**
- **DO NOT** try to bypass GitHub's secret scanning
- The secret is already compromised
- Roll the key immediately (step 1 above)
- Remove from code and commit the fix
- Update Render with new key

---

## 📊 Current Configuration Status

| Component | Value | Status |
|-----------|-------|--------|
| **Render Service ID** | srv-d3vpra7diees73ai05g0 | ✅ Active |
| **Service URL** | https://yaya-1dc3.onrender.com | ✅ Live |
| **Production Domain** | https://pastelpoetics.com | ✅ Live |
| **Stripe Publishable Key** | pk_live_51SM7yMRMDdiM5E9AoXPdpUxW... | ✅ In Code |
| **Stripe Secret Key** | STRIPE_SECRET_LIVE_KEY | ⚠️ **SET IN RENDER** |
| **CORS Origins** | pastelpoetics.com, www.pastelpoetics.com | ✅ Configured |
| **Rate Limiting** | 60 requests/min | ✅ Enabled |
| **HTTPS** | Enforced | ✅ Enabled |

---

## 🎯 Post-Configuration Test Checklist

After setting `STRIPE_SECRET_LIVE_KEY` in Render:

- [ ] Check Render logs show "✅ Stripe: Configured"
- [ ] Test: `curl https://yaya-1dc3.onrender.com/_health`
- [ ] Verify `stripe.configured: true` in health response
- [ ] Test: Create stripe session (see Test 3 above)
- [ ] Visit https://pastelpoetics.com/checkout.html
- [ ] Add test item to cart
- [ ] Fill in shipping information
- [ ] Click "Continue to Payment"
- [ ] Verify redirect to Stripe checkout page
- [ ] Use Stripe test card: `4242 4242 4242 4242`
- [ ] Use future expiration date and any 3-digit CVC
- [ ] Complete test purchase
- [ ] Verify success page loads correctly

---

## 📞 Quick Reference Links

- **Render Dashboard:** https://dashboard.render.com/web/srv-d3vpra7diees73ai05g0
- **Render Logs:** https://dashboard.render.com/web/srv-d3vpra7diees73ai05g0/logs
- **Render Environment:** https://dashboard.render.com/web/srv-d3vpra7diees73ai05g0/env
- **Stripe Dashboard:** https://dashboard.stripe.com/
- **Stripe API Keys:** https://dashboard.stripe.com/apikeys
- **Stripe Logs:** https://dashboard.stripe.com/logs
- **Server Health Check:** https://yaya-1dc3.onrender.com/_health
- **Server Root:** https://yaya-1dc3.onrender.com/
- **Deploy Hook:** `curl -X POST https://api.render.com/deploy/srv-d3vpra7diees73ai05g0?key=LzX1rEwy08w`

---

## 🆘 Need Help?

**First: Check the health endpoint**
```bash
curl -s https://yaya-1dc3.onrender.com/_health | python3 -m json.tool
```

This will show you exactly what's configured and what's missing.

**Common Issues:**
1. **"Stripe not configured"** → Check health endpoint, verify env var in Render
2. **Server not responding** → Trigger manual deploy, wait for wake-up
3. **CORS errors** → Verify origin is exactly `https://pastelpoetics.com`
4. **Wrong key length** → Get fresh key from Stripe Dashboard

**Diagnostic Page:**
Visit https://pastelpoetics.com/payment-diagnostic.html for browser-based testing.

---

**✅ Next Step:** Set `STRIPE_SECRET_LIVE_KEY` in Render Dashboard (Section 2 above)

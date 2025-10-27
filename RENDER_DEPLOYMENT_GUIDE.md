# Render Deployment Guide - URGENT FIX

## ⚠️ CURRENT ISSUE
Your server is returning errors because the STRIPE_SECRET_KEY environment variable is not configured on Render.

## 🚀 QUICK FIX - Configure Environment Variables

### Step 1: Go to Your Render Dashboard
1. Visit https://dashboard.render.com/
2. Click on your service: **yaya-1dc3** (srv-d3vpra7diees73ai05g0)

### Step 2: Add Environment Variable
1. Click on **"Environment"** in the left sidebar
2. Click **"Add Environment Variable"**
3. Add this variable:
   - **Key**: `STRIPE_SECRET_KEY`
   - **Value**: `sk_live_51SM7yMRMDdiM5E9A...` (your Stripe secret key starting with sk_live_)
4. Click **"Save Changes"**

### Step 3: Deploy
After adding the environment variable, Render will automatically redeploy your service. Wait 2-3 minutes for deployment to complete.

## 📋 Additional Recommended Environment Variables

While you're in the Environment section, add these as well:

```
NODE_ENV=production
PORT=10000
```

## 🔍 Verify Deployment

After deployment completes (watch the "Logs" tab):

### Test 1: Check Server Status
```bash
curl https://yaya-1dc3.onrender.com/
```

Expected response:
```json
{"ok":true,"server":"Yaya payments mock server"}
```

### Test 2: Test Stripe Session Creation
```bash
curl -X POST https://yaya-1dc3.onrender.com/create-stripe-session \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"id":1,"name":"Test","price":10,"quantity":1}],
    "customer": {"name":"Test User","email":"test@example.com"},
    "total": 10
  }'
```

Expected response:
```json
{"url":"https://checkout.stripe.com/...","id":"cs_test_..."}
```

## 🎯 Deploy Server Code (If Needed)

If you haven't deployed the server code to Render yet:

### Option 1: Connect GitHub Repo (Recommended)
1. In Render dashboard, go to your service
2. Click **"Settings"**
3. Under **"Build & Deploy"**, connect your GitHub repo: `JasmineART/Yaya`
4. Set **Root Directory**: `server`
5. Set **Build Command**: `npm install`
6. Set **Start Command**: `npm start`
7. Click **"Save Changes"**

### Option 2: Manual Deploy via Deploy Hook
```bash
curl -X POST https://api.render.com/deploy/srv-d3vpra7diees73ai05g0?key=LzX1rEwy08w
```

## 📊 Monitor Deployment

1. Go to **Logs** tab in Render dashboard
2. Watch for:
   - `✓ Server is running on port 10000`
   - No error messages about missing STRIPE_SECRET_KEY

## 🐛 Common Issues

### Issue: "Stripe API key required"
**Fix**: Environment variable not set. Follow Step 2 above.

### Issue: Server not responding
**Fix**: Check Logs tab for deployment errors. Ensure all dependencies installed.

### Issue: CORS errors from browser
**Fix**: Already configured in server/index.js to allow pastelpoetics.com

## ✅ Next Steps After Server is Running

1. Test checkout flow at https://pastelpoetics.com/checkout.html
2. Use https://pastelpoetics.com/payment-diagnostic.html to verify all components
3. Try a test purchase with discount code (SUN10, FAIRY5, or MAGIC15)

## 🔐 Security Note

The Stripe secret key is now documented in this guide. After configuring Render:
- ✅ Render stores it securely in environment variables
- ✅ Never commit `.env` files to GitHub
- ✅ This guide should be kept private or deleted after setup

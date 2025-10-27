# Render.com Deployment Checklist

## ⚠️ Critical Issue: Server Not Processing Payments

If you're seeing the deploy hook URL as an error when submitting the checkout form, it means the server is returning an error response instead of creating a Stripe session.

## Required Environment Variables

Your Render service **MUST** have these environment variables configured:

### 1. Stripe Configuration (REQUIRED)
```
STRIPE_SECRET_KEY=sk_live_51SM7yMRMDdiM5E9A... (your full secret key)
```

Without this, the server will return: `{"error":"Stripe not configured"}`

### 2. Optional Environment Variables
```
SUPABASE_URL=your_supabase_url (optional - for order storage)
SUPABASE_SERVICE_ROLE=your_service_role_key (optional)
SMTP_HOST=smtp.gmail.com (optional - for emails)
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## How to Add Environment Variables to Render

1. Go to https://dashboard.render.com
2. Select your service: **yaya-1dc3** (srv-d3vpra7diees73ai05g0)
3. Click **Environment** in the left sidebar
4. Click **Add Environment Variable**
5. Add each variable:
   - Key: `STRIPE_SECRET_KEY`
   - Value: `sk_live_51SM7yMRMDdiM5E9A...` (your full Stripe secret key)
6. Click **Save Changes**
7. **Important:** The service will automatically redeploy after you save

## Verify Configuration

### Check Server Status
```bash
curl https://yaya-1dc3.onrender.com/
```
Expected response: `{"ok":true,"server":"Yaya payments mock server"}`

### Test Stripe Endpoint
```bash
curl -X POST https://yaya-1dc3.onrender.com/create-stripe-session \
  -H "Content-Type: application/json" \
  -d '{
    "items":[{"id":"test","name":"Test","price":10,"quantity":1}],
    "customer":{"name":"Test","email":"test@test.com"},
    "total":10
  }'
```

Expected response: `{"url":"https://checkout.stripe.com/...","id":"cs_test_..."}`

If you get `{"error":"Stripe not configured"}`, the STRIPE_SECRET_KEY variable is missing.

## Service URLs

- **Production URL:** https://yaya-1dc3.onrender.com
- **Dashboard:** https://dashboard.render.com/web/srv-d3vpra7diees73ai05g0
- **Deploy Hook:** https://api.render.com/deploy/srv-d3vpra7diees73ai05g0?key=LzX1rEwy08w

## Common Issues

### Issue: "Stripe not configured" error
**Solution:** Add STRIPE_SECRET_KEY environment variable to Render service

### Issue: CORS errors
**Solution:** Server is already configured for pastelpoetics.com. If testing locally, add your local URL to CORS origins in server/index.js

### Issue: Server responds slowly
**Solution:** Render free tier services spin down after inactivity. First request may take 30-60 seconds.

### Issue: Deploy hook URL appearing as error
**Solution:** This means the server returned an HTML error page instead of JSON. Check:
1. Is STRIPE_SECRET_KEY configured?
2. Is the service running? (Check Render dashboard)
3. Are there any deploy errors? (Check Render logs)

## Testing After Configuration

1. Open: https://pastelpoetics.com/test-checkout-flow.html
2. Click "Test Server" - should show success
3. Click "Test Stripe Checkout" - should create a session
4. Try actual checkout flow at: https://pastelpoetics.com/checkout.html

## Quick Deploy

To trigger a new deployment:
```bash
curl -X POST https://api.render.com/deploy/srv-d3vpra7diees73ai05g0?key=LzX1rEwy08w
```

## Next Steps

1. ✅ Add STRIPE_SECRET_KEY to Render environment variables
2. ✅ Wait for automatic redeploy (2-3 minutes)
3. ✅ Test server: `curl https://yaya-1dc3.onrender.com/`
4. ✅ Test checkout: Visit test-checkout-flow.html
5. ✅ Complete real purchase test

---

**Last Updated:** October 27, 2025

# Stripe Payment Setup for Static Sites (GitHub Pages)

## Current Issue
You're getting the error: **"Invalid stripe.redirectToCheckout parameter: line_items is not an accepted parameter"**

## Root Cause
- **GitHub Pages** is a static file host (no backend server)
- Stripe's `redirectToCheckout()` with `line_items` **requires a server** to create checkout sessions
- The current code tries to use server-side Stripe features on a static site

## Solutions for pastelpoetics.com

### ✅ SOLUTION 1: Deploy Server + Use GitHub Pages for Frontend (RECOMMENDED)

This is the best approach for full e-commerce functionality with discounts.

#### Step 1: Deploy the Server
Deploy the `/server` directory to a hosting platform:

**Option A: Render.com (Free)**
```bash
cd server
# Push to GitHub
# Connect to Render.com
# Set environment variable: STRIPE_SECRET_KEY=sk_live_...
```

**Option B: Railway.app (Free)**
```bash
cd server
railway init
railway up
# Set STRIPE_SECRET_KEY environment variable
```

**Option C: Heroku (Paid)**
```bash
cd server
heroku create yaya-payment-server
git push heroku main
heroku config:set STRIPE_SECRET_KEY=sk_live_...
```

#### Step 2: Configure Frontend
Add to your `checkout.html` or create `config.js`:
```html
<script>
window.YAYA_CONFIG = {
  serverUrl: 'https://your-server.onrender.com', // Your deployed server URL
  stripePublishableKey: 'pk_live_51SM7yM...'
};
</script>
```

#### Step 3: Update stripe-payments.js
The code will automatically use the server when `window.YAYA_CONFIG.serverUrl` is set.

**Benefits:**
- ✅ Full discount code support
- ✅ Multiple products per order
- ✅ Order tracking in database
- ✅ Email notifications
- ✅ Webhook support for order fulfillment

---

### ✅ SOLUTION 2: Use Stripe Payment Links (EASIEST for Static Sites)

Perfect for simple product sales without complex cart logic.

#### Step 1: Create Products in Stripe Dashboard
1. Go to https://dashboard.stripe.com/products
2. Create a product for each item:
   - Suncatcher Book - $25
   - Stickers - $5 each
   - etc.

#### Step 2: Create Payment Links
1. For each product, create a Payment Link
2. Copy the link (e.g., `https://buy.stripe.com/...`)

#### Step 3: Update Your Site
Replace checkout button with direct link:
```html
<a href="https://buy.stripe.com/live_YOUR_LINK" class="btn primary">
  Buy Now - $25
</a>
```

**Limitations:**
- ❌ No shopping cart (one product at a time)
- ❌ Discount codes must be created in Stripe Dashboard
- ✅ But: Super simple, no server needed!

---

### ✅ SOLUTION 3: Move to Netlify/Vercel with Serverless Functions

Use a platform that supports serverless functions.

#### Option A: Netlify

1. **Move from GitHub Pages to Netlify:**
   ```bash
   # Connect your GitHub repo to Netlify
   # Netlify will auto-deploy on push
   ```

2. **Create Netlify Function:**
   Create `netlify/functions/create-checkout-session.js`:
   ```javascript
   const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

   exports.handler = async (event) => {
     const { items, customer, discountAmount, total } = JSON.parse(event.body);
     
     const session = await stripe.checkout.sessions.create({
       payment_method_types: ['card'],
       mode: 'payment',
       line_items: items.map(item => ({
         price_data: {
           currency: 'usd',
           product_data: { name: item.name },
           unit_amount: Math.round(item.price * 100)
         },
         quantity: item.quantity
       })),
       success_url: 'https://pastelpoetics.com/success.html',
       cancel_url: 'https://pastelpoetics.com/cart.html'
     });
     
     return {
       statusCode: 200,
       body: JSON.stringify({ url: session.url, id: session.id })
     };
   };
   ```

3. **Update Frontend:**
   ```javascript
   window.YAYA_CONFIG = {
     serverUrl: '', // Netlify functions use relative paths
   };
   ```

4. **Update fetch URL in stripe-payments.js:**
   ```javascript
   const response = await fetch('/.netlify/functions/create-checkout-session', {
     // ...
   });
   ```

#### Option B: Vercel
Similar approach with Vercel Serverless Functions.

---

## Quick Fix for Testing RIGHT NOW

If you want to test the site immediately without server deployment, here's a temporary workaround:

### Create a Single-Product Checkout

1. **In Stripe Dashboard:**
   - Create a product
   - Create a price
   - Get the price ID (e.g., `price_1ABC123`)

2. **Update stripe-payments.js:**
   ```javascript
   async function createStripeCheckout(cartItems, customerInfo) {
     // Simple single-product checkout
     const { error } = await stripe.redirectToCheckout({
       lineItems: [{ price: 'price_1ABC123', quantity: 1 }], // Use price ID, not price_data
       mode: 'payment',
       successUrl: window.location.origin + '/success.html',
       cancelUrl: window.location.origin + '/cart.html',
       customerEmail: customerInfo.email
     });
     
     if (error) {
       alert(error.message);
     }
   }
   ```

**Note:** This only works for pre-defined products in Stripe Dashboard (no dynamic pricing or discounts).

---

## Recommended Path Forward

### For Production (pastelpoetics.com):

**BEST OPTION:** Solution 1 (Deploy Server)
- Deploy `/server` directory to Render.com (free tier)
- Takes 10-15 minutes
- Full e-commerce functionality
- Supports all discount codes
- Professional checkout experience

**QUICKEST OPTION:** Solution 2 (Payment Links)
- Create products in Stripe Dashboard
- Add "Buy Now" buttons to your site
- No server needed
- Works immediately

---

## Files Modified in This Fix

1. **stripe-payments.js** - Simplified for static site deployment
2. **payment.html** - Shows deployment options notice
3. **STRIPE_PAYMENT_SETUP.md** - This guide

---

## Testing After Setup

Once you deploy a server:

1. Add item to cart on pastelpoetics.com
2. Apply discount code (FAIRY5)
3. Go to checkout
4. Fill in details
5. Click "Continue to Payment"
6. Should redirect to Stripe checkout page
7. Complete test payment with: `4242 4242 4242 4242`

---

## Need Help?

- Check server logs for errors
- Verify environment variables are set
- Test with Stripe test mode first
- Review PAYMENT_FLOW_DOCUMENTATION.md

---

## Summary

**Current Problem:** GitHub Pages doesn't support server-side code
**Best Solution:** Deploy the `/server` directory to Render/Railway/Heroku
**Quick Solution:** Use Stripe Payment Links for "Buy Now" buttons
**Future-Proof:** Move to Netlify/Vercel with serverless functions

Choose the solution that fits your needs and technical comfort level!

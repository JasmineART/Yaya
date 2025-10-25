# Payment Processing Setup Guide

## Recommended Solution: Stripe (Industry Standard)

Stripe is the most trusted, secure, and free-to-start payment processor.

### Why Stripe?
- ✅ **Free to start** - No monthly fees, only pay per transaction
- ✅ **2.9% + 30¢ per successful charge** (industry standard)
- ✅ **Accepts all major cards** (Visa, Mastercard, Amex, Discover)
- ✅ **Bank transfers** (ACH debit in US - 0.8%, $5 cap)
- ✅ **PCI compliant** - Stripe handles all security
- ✅ **No merchant account needed**
- ✅ **Fast payouts** - 2 business days to your bank

## Step 1: Create Stripe Account

1. **Sign up at https://stripe.com/**
   - Use faeriepoetics@gmail.com
   - Business type: Individual / Sole Proprietor
   - Industry: Publishing / E-commerce

2. **Complete business profile:**
   - Business name: Pastel Poetics (or Yaya Starchild)
   - Website: Your domain
   - Phone number
   - Address

3. **Add bank account for payouts:**
   - Settings → Bank accounts and scheduling
   - Add your checking account details
   - Verify with micro-deposits (2-3 days)

## Step 2: Get API Keys

1. **Developers → API keys**
2. **Copy keys:**
   - **Publishable key** (starts with `pk_test_...`) - Safe for client-side
   - **Secret key** (starts with `sk_test_...`) - NEVER expose publicly

3. **Keep secret key secure!**
   - Store in environment variable
   - Never commit to Git
   - Only use server-side

## Step 3: Choose Integration Method

### Option A: Stripe Checkout (Easiest - Recommended)

Pre-built, hosted checkout page. No server required!

#### Setup:

1. **Stripe Dashboard → Products**
2. **Add products:**
   - Name: "Suncatcher Spirit (Signed Edition)"
   - Price: $19.99 (one-time)
   - Click "Add product"
   - Copy the **Price ID** (e.g., `price_abc123`)

3. **Repeat for all products:**
   - Suncatcher Spirit Paperback - $19.99
   - eBook - $9.99
   - Sticker Pack - $6.50
   - Tote Bag - $22.00

#### Integration Code:

Create file: `/workspaces/Yaya/stripe-config.js`

```javascript
// Stripe Configuration
const STRIPE_CONFIG = {
  publishableKey: 'pk_test_YOUR_KEY_HERE', // Your publishable key
  prices: {
    'signed-edition': 'price_ABC123', // Replace with your price IDs
    'paperback': 'price_DEF456',
    'ebook': 'price_GHI789',
    'stickers': 'price_JKL012',
    'tote': 'price_MNO345'
  }
};

// Initialize Stripe
const stripe = Stripe(STRIPE_CONFIG.publishableKey);

// Create checkout session
async function createCheckoutSession(items) {
  try {
    // Convert cart items to line items
    const lineItems = items.map(item => ({
      price: STRIPE_CONFIG.prices[item.id] || item.priceId,
      quantity: item.qty
    }));
    
    // Create checkout session
    const response = await fetch('/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lineItems })
    });
    
    const session = await response.json();
    
    // Redirect to Stripe Checkout
    const result = await stripe.redirectToCheckout({
      sessionId: session.id
    });
    
    if (result.error) {
      alert(result.error.message);
    }
  } catch (error) {
    console.error('Checkout error:', error);
    alert('Error creating checkout. Please try again.');
  }
}

export { stripe, createCheckoutSession, STRIPE_CONFIG };
```

### Option B: Stripe Payment Links (No Code!)

Simplest option - no coding required!

1. **Stripe Dashboard → Payment Links**
2. **Create payment link** for each product
3. **Copy the URL** (e.g., `https://buy.stripe.com/abc123`)
4. **Use as direct product links**

Update your product links:
```html
<a href="https://buy.stripe.com/abc123" class="btn primary">
  Buy Now - $19.99
</a>
```

## Step 4: Server-Side Setup (Required for Option A)

You'll need a simple server to create checkout sessions securely.

### Option 1: Firebase Cloud Functions (Recommended)

1. **Install Firebase CLI:**
```bash
npm install -g firebase-tools
firebase login
cd /workspaces/Yaya
firebase init functions
```

2. **Install Stripe in functions:**
```bash
cd functions
npm install stripe
```

3. **Create function:** `functions/index.js`
```javascript
const functions = require('firebase-functions');
const stripe = require('stripe')('sk_test_YOUR_SECRET_KEY'); // Your secret key

exports.createCheckoutSession = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }
  
  try {
    const { lineItems } = req.body;
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: 'https://yourdomain.com/success.html?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://yourdomain.com/cart.html',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'], // Adjust as needed
      },
      // Send email receipt
      customer_email: req.body.email,
    });
    
    res.json({ id: session.id });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

4. **Deploy:**
```bash
firebase deploy --only functions
```

5. **Update endpoint** in `stripe-config.js`:
```javascript
const response = await fetch('https://YOUR-PROJECT.cloudfunctions.net/createCheckoutSession', {
  // ...
});
```

### Option 2: Netlify Functions (Alternative)

1. **Create `netlify/functions/create-checkout.js`:**
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const { lineItems } = JSON.parse(event.body);
  
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.URL}/success.html`,
      cancel_url: `${process.env.URL}/cart.html`,
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({ id: session.id })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

2. **Deploy to Netlify**
3. **Set environment variables** in Netlify dashboard

## Step 5: Add Stripe to HTML

Add to `<head>` in checkout.html and cart.html:

```html
<!-- Stripe.js -->
<script src="https://js.stripe.com/v3/"></script>
<script type="module" src="stripe-config.js"></script>
```

## Step 6: Update Checkout Button

In `/workspaces/Yaya/cart.html`, update the checkout button:

```javascript
// In app.js, add this function:
async function proceedToStripeCheckout() {
  const cart = getCart();
  
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }
  
  // Show loading
  const btn = document.querySelector('.checkout-btn');
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
  btn.disabled = true;
  
  try {
    const { createCheckoutSession } = await import('./stripe-config.js');
    await createCheckoutSession(cart);
    // Stripe will redirect to checkout
  } catch (error) {
    console.error('Checkout error:', error);
    alert('Error loading checkout. Please try again.');
    btn.innerHTML = '<i class="fas fa-credit-card"></i> Proceed to Checkout';
    btn.disabled = false;
  }
}

// Update button click handler
document.querySelector('.checkout-btn')?.addEventListener('click', proceedToStripeCheckout);
```

## Step 7: Handle Success/Cancel Pages

Create `/workspaces/Yaya/success.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Order Successful! ✨</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container" style="text-align:center; padding:4rem 2rem;">
    <h1>✨ Order Successful! ✨</h1>
    <p class="lead">Thank you for your purchase! You'll receive a confirmation email shortly.</p>
    <div style="margin-top:2rem;">
      <a href="index.html" class="btn primary">Return Home</a>
      <a href="shop.html" class="btn ghost">Continue Shopping</a>
    </div>
  </div>
  
  <script type="module">
    // Clear cart after successful purchase
    localStorage.removeItem('yaya-cart');
    
    // Optional: Send order confirmation email
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      // You can fetch session details from Stripe if needed
      console.log('Order completed:', sessionId);
    }
  </script>
</body>
</html>
```

## Step 8: Accept Bank Transfers (ACH)

To accept direct bank account payments:

1. **Stripe Dashboard → Settings → Payment methods**
2. **Enable "ACH Direct Debit"**
3. **Fees: 0.8% capped at $5** (much lower than cards!)

Update checkout session:
```javascript
payment_method_types: ['card', 'us_bank_account'],
```

## Step 9: Test Mode

**Use test cards** (never use real cards in test mode):

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires authentication: `4000 0025 0000 3155`
- Any future expiry date
- Any 3-digit CVC
- Any 5-digit ZIP

## Step 10: Go Live!

When ready to accept real payments:

1. **Complete Stripe account activation**
2. **Switch to live keys:**
   - Use `pk_live_...` and `sk_live_...`
3. **Test thoroughly with real card**
4. **Enable live mode** in Stripe Dashboard

## Security Checklist

✅ **Never expose secret key** (sk_...) in client-side code
✅ **Always validate on server** before creating charges
✅ **Use HTTPS** (required by Stripe)
✅ **Let Stripe handle card data** (never touch card numbers)
✅ **Store session IDs**, not card details
✅ **Enable Stripe Radar** for fraud detection (free)

## Pricing Breakdown

**Stripe Fees:**
- Cards: 2.9% + $0.30 per transaction
- ACH: 0.8% capped at $5.00 per transaction
- International cards: +1.5%
- Currency conversion: +1%

**Example:**
- $19.99 book sale
- Stripe fee: $0.88
- You receive: $19.11
- Payout in 2 business days

## Alternative: PayPal

If you prefer PayPal:

1. **Create business account** at paypal.com
2. **Use PayPal Buttons:**

```html
<div id="paypal-button-container"></div>
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID"></script>
<script>
  paypal.Buttons({
    createOrder: function(data, actions) {
      return actions.order.create({
        purchase_units: [{
          amount: { value: '19.99' }
        }]
      });
    },
    onApprove: function(data, actions) {
      return actions.order.capture().then(function(details) {
        alert('Transaction completed!');
      });
    }
  }).render('#paypal-button-container');
</script>
```

**PayPal Fees:** 2.99% + $0.49 (slightly higher than Stripe)

## Troubleshooting

**"Invalid API key"**
- Verify you're using test keys in test mode
- Check for extra spaces in key

**CORS errors**
- Add CORS headers in Cloud Function
- Use correct function URL

**Payment fails**
- Check Stripe Dashboard logs
- Verify test card numbers
- Ensure amount is in cents (1999 for $19.99)

## Support

- Stripe Docs: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- Test your integration: https://stripe.com/docs/testing

## Next Steps

1. ✅ Set up products in Stripe Dashboard
2. ✅ Create Cloud Function for checkout
3. ✅ Test with test cards
4. ✅ Create success/cancel pages
5. ✅ Go live when ready!

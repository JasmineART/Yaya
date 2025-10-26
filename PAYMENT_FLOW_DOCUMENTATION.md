# Payment Flow Documentation - Yaya Starchild Store

## Overview
This document explains how the complete payment and discount system works, including the critical fixes implemented to resolve Stripe API errors and ensure proper discount code integration.

## Payment Architecture

### Client-Side Components
1. **checkout.html** - Shipping information collection page
2. **stripe-payments.js** - Stripe integration and payment initiation
3. **app.js** - Cart management and discount code logic

### Server-Side Components
1. **server/index.js** - Creates Stripe Checkout Sessions with full support for:
   - Multiple product line items
   - Discount codes (as negative line items)
   - Customer metadata
   - Shipping/billing address collection

## Complete Checkout Flow

### Step 1: Shopping Cart (`cart.html`)
- User adds products to cart
- User can apply discount codes: `SUN10`, `FAIRY5`, `MAGIC15`
- Discount validation happens client-side
- Approved discount saved to localStorage

### Step 2: Checkout Form (`checkout.html`)
- User enters shipping information:
  - Full Name
  - Email Address
  - Shipping Address (Street, City, State, ZIP)
- User sees order summary with applied discount
- **IMPORTANT**: No credit card fields on this page!
  - This is intentional for PCI compliance
  - All payment details collected securely by Stripe

### Step 3: Payment Processing (`stripe-payments.js`)
When user clicks "Continue to Payment":

1. **Collect Order Data**:
   ```javascript
   - Cart items from localStorage
   - Customer shipping information
   - Applied discount code (if any)
   ```

2. **Calculate Totals with Discount**:
   ```javascript
   - Subtotal = sum of all cart items
   - Discount amount = calculated based on code type
     - SUN10: 10% off entire order
     - FAIRY5: $5 flat discount
     - MAGIC15: 15% off orders $75+
   - Final Total = Subtotal - Discount
   ```

3. **Send to Server**:
   ```javascript
   POST /create-stripe-session
   {
     items: [{id, name, price, quantity, image}, ...],
     customer: {name, email, address, city, state, zip},
     discountAmount: 5.00,
     discountCode: "FAIRY5",
     total: 45.00,
     successUrl: "https://pastelpoetics.com/success.html",
     cancelUrl: "https://pastelpoetics.com/cart.html"
   }
   ```

### Step 4: Server Creates Stripe Session (`server/index.js`)

1. **Build Line Items** for Stripe Checkout:
   ```javascript
   // Products
   line_items = [
     {
       price_data: {
         currency: 'usd',
         product_data: {
           name: "Suncatcher Poetry Book",
           description: "Whimsical poetry collection",
           images: ["https://pastelpoetics.com/assets/suncatcher-cover.jpg"]
         },
         unit_amount: 2500  // $25.00 in cents
       },
       quantity: 1
     },
     // ... other items
   ]
   
   // Discount (if applicable)
   line_items.push({
     price_data: {
       currency: 'usd',
       product_data: {
         name: "Discount (FAIRY5)",
         description: "Applied discount code: FAIRY5"
       },
       unit_amount: -500  // -$5.00 in cents (NEGATIVE)
     },
     quantity: 1
   })
   ```

2. **Create Stripe Checkout Session**:
   ```javascript
   const session = await stripe.checkout.sessions.create({
     payment_method_types: ['card'],
     mode: 'payment',
     line_items: line_items,
     customer_email: customer.email,
     shipping_address_collection: {
       allowed_countries: ['US', 'CA', 'GB', 'AU']
     },
     billing_address_collection: 'required',
     metadata: {
       customer_name: "Jane Doe",
       discount_code: "FAIRY5",
       discount_amount: "5.00",
       order_source: "yaya_website"
     },
     success_url: "https://pastelpoetics.com/success.html?session_id={CHECKOUT_SESSION_ID}",
     cancel_url: "https://pastelpoetics.com/cart.html"
   });
   ```

3. **Return Session URL**:
   ```javascript
   res.json({url: session.url, id: session.id});
   ```

### Step 5: Redirect to Stripe (`stripe-payments.js`)
- Client receives session URL from server
- Redirects to Stripe's secure hosted checkout page
- **Stripe Checkout Page Includes**:
  - ✅ Card number input field
  - ✅ Expiration date (MM/YY)
  - ✅ CVC/CVV security code
  - ✅ Billing address collection
  - ✅ All products with prices
  - ✅ Discount line item (shown as negative)
  - ✅ Total amount to charge

### Step 6: Payment Completion
- Customer enters payment details on Stripe's page
- Stripe processes payment securely
- On success → redirect to `success.html?session_id=...`
- On cancel → redirect to `cart.html`

## Discount Code System

### Available Codes
| Code | Type | Value | Requirements |
|------|------|-------|--------------|
| `SUN10` | Percentage | 10% off | None |
| `FAIRY5` | Flat | $5.00 off | None |
| `MAGIC15` | Percentage | 15% off | Order $75+ |

### How Discounts Work

1. **Application** (`cart.html`):
   ```javascript
   // User enters code in discount input field
   // Clicks "Apply"
   // Code validated against DISCOUNTS object in app.js
   // If valid, saved to localStorage
   ```

2. **Calculation** (`app.js`):
   ```javascript
   function calculateDiscount(subtotal, discountCode) {
     const discount = DISCOUNTS[discountCode];
     
     // Percentage discount
     if (discount.type === 'percentage') {
       amount = subtotal * discount.value;
     }
     
     // Flat discount
     if (discount.type === 'flat') {
       amount = discount.value;
     }
     
     return { valid: true, amount: amount, description: discount.description };
   }
   ```

3. **Integration with Stripe** (`stripe-payments.js` → `server/index.js`):
   - Discount sent to server as part of checkout request
   - Server adds discount as **negative line item** in Stripe session
   - Stripe displays discount clearly on checkout page
   - Final charge = Subtotal - Discount

4. **Order Tracking**:
   - Discount code and amount saved in:
     - Stripe session metadata
     - Supabase orders table (if configured)
     - Email notifications

## Critical Fixes Implemented

### Issue 1: Stripe API Error
**Error**: `Invalid stripe.redirectToCheckout parameter: line_items is not an accepted parameter`

**Root Cause**: 
- Tried to pass `line_items` directly to `stripe.redirectToCheckout()`
- This parameter is NOT supported in client-side redirectToCheckout
- `line_items` can only be used when creating a session server-side

**Solution**:
- Create Stripe Checkout Session on server with line_items
- Server returns session URL
- Client redirects to that URL
- ✅ This is the correct Stripe implementation

### Issue 2: Missing Card Expiration Field
**Problem**: Checkout form had card number and CVC but no expiration date

**Root Cause**: 
- Attempted to collect card details on our own site
- This is a PCI compliance nightmare
- Manual card fields are incomplete and insecure

**Solution**:
- **Removed all card input fields** from checkout.html
- Let Stripe Checkout handle ALL payment details
- Benefits:
  - ✅ PCI compliant (Stripe handles sensitive data)
  - ✅ All fields included (number, expiration, CVC)
  - ✅ Secure payment processing
  - ✅ No SSL certificate required on our site
  - ✅ Better user experience

### Issue 3: Discount Code Not Applied to Payment
**Problem**: Discounts calculated client-side but not sent to Stripe

**Solution**:
- Pass discount info from client to server
- Server adds discount as negative line item
- Stripe shows discount on checkout page
- Final charge includes discount
- ✅ Customer sees discount clearly
- ✅ Correct amount charged

## Testing the Payment Flow

### Local Testing
1. Start local server: `cd /workspaces/Yaya && python3 -m http.server 8080`
2. Open http://localhost:8080
3. Add items to cart
4. Apply discount code (e.g., `FAIRY5`)
5. Go to checkout
6. Fill in shipping information
7. Click "Continue to Payment"
8. **IMPORTANT**: Requires live server running at configured URL

### Testing Discount Codes

**Test Case 1: Percentage Discount**
```
Cart: Suncatcher Book ($25)
Code: SUN10
Expected: $25 - $2.50 = $22.50
```

**Test Case 2: Flat Discount**
```
Cart: Sticker ($5) + Book ($25) = $30
Code: FAIRY5
Expected: $30 - $5 = $25
```

**Test Case 3: Minimum Order Discount**
```
Cart: 3 Books @ $25 = $75
Code: MAGIC15
Expected: $75 - $11.25 = $63.75

Cart: 2 Books @ $25 = $50
Code: MAGIC15
Expected: INVALID (minimum $75 not met)
```

### Verifying in Stripe Dashboard
1. Go to https://dashboard.stripe.com/test/payments
2. Find the checkout session
3. Verify line items include:
   - Products with correct prices
   - Discount as negative line item
   - Correct total amount
4. Check metadata for discount_code and discount_amount

## Environment Configuration

### Required Environment Variables (Server)
```bash
STRIPE_SECRET=sk_live_... # Your Stripe secret key
SUPABASE_URL=https://xxx.supabase.co # Optional: order storage
SUPABASE_SERVICE_ROLE=xxx # Optional: order storage
```

### Client Configuration
```javascript
// In checkout.html or firebase-config.js
window.YAYA_CONFIG = {
  stripePublishableKey: 'pk_live_51SM7yM...', // Your Stripe publishable key
  serverUrl: 'https://yaya-server.herokuapp.com' // Your server endpoint
};
```

## Security Considerations

### What We DON'T Store
- ❌ Credit card numbers
- ❌ CVV/CVC codes
- ❌ Expiration dates
- ❌ Any payment credentials

### What We DO Store
- ✅ Customer name and email
- ✅ Shipping address
- ✅ Order items and quantities
- ✅ Discount codes applied
- ✅ Stripe session ID (for reference)
- ✅ Order total

### PCI Compliance
- All payment data handled by Stripe (PCI Level 1 certified)
- No card data touches our servers
- Secure HTTPS connection to Stripe
- Customer payment info never exposed to our code

## Troubleshooting

### Problem: "Stripe not initialized"
**Solution**: Check that Stripe.js is loaded: `<script src="https://js.stripe.com/v3/"></script>`

### Problem: "Server error 500"
**Solution**: 
- Check server is running
- Verify STRIPE_SECRET environment variable is set
- Check server logs for detailed error

### Problem: "No checkout URL returned"
**Solution**:
- Verify server endpoint is correct in window.YAYA_CONFIG
- Check network tab for API call failures
- Ensure CORS is enabled on server

### Problem: Discount not showing on Stripe page
**Solution**:
- Verify discount code is valid
- Check that discount is saved to localStorage
- Verify server receives discountAmount in request
- Check Stripe Dashboard to see if negative line item was created

## Future Enhancements

### Potential Improvements
1. **PayPal Integration**: Add PayPal as alternative payment method
2. **Subscription Support**: Enable recurring payments for newsletter subscribers
3. **International Shipping**: Add more countries to shipping options
4. **Gift Cards**: Implement gift card purchase and redemption
5. **Referral Discounts**: Auto-apply discounts from referral links
6. **Multi-currency**: Support EUR, GBP, CAD pricing

### Monitoring & Analytics
- Track discount code usage rates
- Monitor cart abandonment
- Analyze payment success/failure rates
- Customer lifetime value tracking

## Support & Maintenance

### Regular Checks
- ✅ Test checkout flow monthly
- ✅ Verify all discount codes work
- ✅ Check Stripe Dashboard for failed payments
- ✅ Review server logs for errors
- ✅ Update Stripe.js library when new version available

### Contact
For payment system issues:
- Check Stripe Dashboard first
- Review server logs
- Test with Stripe test cards
- Contact Stripe support if needed

---

**Last Updated**: October 26, 2025
**Version**: 2.0 (Post-fix implementation)
**Status**: ✅ Production Ready

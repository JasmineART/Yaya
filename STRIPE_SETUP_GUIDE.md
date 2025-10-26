# Stripe Payment Setup Guide 💳

## Step 1: Access Your Stripe Dashboard

1. **Login to Stripe**: Go to [https://dashboard.stripe.com/login](https://dashboard.stripe.com/login)
   - Email: `faeriepoetics@gmail.com`
   - Password: `Shinystar4!`

## Step 2: Get Your API Keys

1. **Navigate to API Keys**:
   - In the left sidebar, click on "Developers"
   - Click on "API keys"

2. **Copy Your Publishable Key**:
   - Find the "Publishable key" (starts with `pk_test_` or `pk_live_`)
   - Click "Reveal test key token" if it's hidden
   - Copy this key - you'll need it in Step 3

## Step 3: Configure Your Website

1. **Update stripe-payments.js**:
   - Open the file `stripe-payments.js`
   - Replace `YOUR_STRIPE_PUBLISHABLE_KEY_HERE` with your actual publishable key
   - Example: `const stripe = Stripe('pk_test_51ABC123...');`

2. **Save the file** and you're ready to test!

## Step 4: Test Your Setup

1. **Use Test Card Numbers**:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Any future expiry date (e.g., 12/34)
   - Any 3-digit CVC

2. **Test the Flow**:
   - Add items to cart
   - Go to checkout
   - Fill in shipping info
   - Click "Complete Your Order"
   - Use test card details

## Step 5: Configure Webhooks (Optional)

For order confirmations and inventory updates:

1. **In Stripe Dashboard**:
   - Go to "Developers" → "Webhooks"
   - Click "Add endpoint"
   - URL: `https://yourusername.github.io/webhook` (if needed later)
   - Events: Select `checkout.session.completed`

## Important Notes

- **Test Mode**: Start with test keys (pk_test_...)
- **Security**: Never commit secret keys to your repository
- **Live Mode**: Switch to live keys when ready for real payments
- **Success URL**: Currently set to `success.html?session_id={CHECKOUT_SESSION_ID}`

## Current Integration Features

✅ **Client-side Stripe Checkout**
✅ **Cart integration** 
✅ **Success page with order details**
✅ **Email notifications via EmailJS**
✅ **Automatic cart clearing after payment**

## File Structure

```
stripe-payments.js    # Main Stripe integration
success.html         # Payment success page  
checkout.html        # Updated with Stripe button
```

## Ready to Go Live?

When you're ready for real payments:
1. Complete Stripe account verification
2. Switch to live API keys (pk_live_...)
3. Test thoroughly with small amounts
4. Update webhook URLs if using server features

**Need Help?** Check the Stripe documentation or contact support!
/**
 * Simple Stripe Payment Integration
 * Client-side only - no backend server needed
 * Perfect for small poetry business
 */

// Stripe configuration
const STRIPE_CONFIG = {
  publishableKey: 'pk_live_51SM7yMRMDdiM5E9AoXPdpUxWXxK3h2ZlOwy2hbqwp4o2BHAr2bM30LKSuNv8AdeMJV0l6nfhvIa2Hzxny8VI9GQx00dDiIoUZ6', // Live Stripe key
  currency: 'usd',
  companyName: 'Yaya Starchild Poetry',
  companyDescription: 'Pastel Poetics & Magical Creations'
};

// Initialize Stripe
let stripe = null;

/**
 * Initialize Stripe when page loads
 */
async function initializeStripe() {
  try {
    if (typeof Stripe === 'undefined') {
      console.error('❌ Stripe.js not loaded');
      return false;
    }

    stripe = Stripe(STRIPE_CONFIG.publishableKey);
    console.log('✅ Stripe initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Stripe initialization error:', error);
    return false;
  }
}

/**
 * Create Stripe checkout session for cart items
 * @param {Array} cartItems - Items from cart
 * @param {Object} customerInfo - Customer details
 */
async function createStripeCheckout(cartItems, customerInfo) {
  try {
    if (!stripe) {
      throw new Error('Stripe not initialized');
    }

    // Convert cart items to Stripe line items
    const lineItems = cartItems.map(item => ({
      price_data: {
        currency: STRIPE_CONFIG.currency,
        product_data: {
          name: item.name,
          description: item.description || '',
          images: item.image ? [window.location.origin + '/' + item.image] : []
        },
        unit_amount: Math.round(parseFloat(item.price) * 100) // Convert to cents
      },
      quantity: item.quantity
    }));

    // Calculate total for verification
    const total = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

    console.log('🛒 Creating checkout for:', { lineItems, total, customer: customerInfo });

    // Create checkout session
    const { error } = await stripe.redirectToCheckout({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${window.location.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${window.location.origin}/cart.html`,
      customer_email: customerInfo.email,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA']
      },
      billing_address_collection: 'required',
      metadata: {
        customer_name: customerInfo.name,
        order_source: 'yaya_website'
      }
    });

    if (error) {
      throw error;
    }

  } catch (error) {
    console.error('❌ Stripe checkout error:', error);
    alert(`Payment error: ${error.message}`);
    throw error;
  }
}

/**
 * Handle checkout button click
 */
async function handleStripeCheckout() {
  try {
    // Get cart items
    const cart = getCartItems(); // This function exists in your app.js
    if (!cart || cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    // Get customer info from form
    const customerInfo = {
      name: document.getElementById('name')?.value || 'Guest Customer',
      email: document.getElementById('email')?.value || ''
    };

    if (!customerInfo.email) {
      alert('Please enter your email address');
      return;
    }

    // Show loading state
    const checkoutBtn = document.getElementById('stripe-checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.disabled = true;
      checkoutBtn.textContent = 'Processing...';
    }

    // Send order notification email before payment
    if (window.sendOrderNotification) {
      const total = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
      await window.sendOrderNotification({
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        total: total.toFixed(2),
        items: cart,
        shippingAddress: 'To be collected during checkout'
      });
    }

    // Create Stripe checkout
    await createStripeCheckout(cart, customerInfo);

  } catch (error) {
    console.error('❌ Checkout error:', error);
    
    // Restore button state
    const checkoutBtn = document.getElementById('stripe-checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.disabled = false;
      checkoutBtn.textContent = 'Pay with Stripe';
    }
  }
}

/**
 * Make functions available globally
 */
window.initializeStripe = initializeStripe;
window.createStripeCheckout = createStripeCheckout;
window.handleStripeCheckout = handleStripeCheckout;

// Auto-initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  if (typeof Stripe !== 'undefined') {
    initializeStripe();
  }
});

console.log('💳 Stripe payment system loaded');
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

    // Build a compact items payload for the server-side session creation.
    const serverItems = (cartItems || []).map((item, idx) => ({
      id: Number(item.id) || (idx + 1),
      qty: Number(item.quantity || item.qty) || 1,
      price: Number(item.price) || 0,
      title: item.name || item.title || `Item ${idx + 1}`
    }));

    const total = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * (item.quantity || item.qty || 1)), 0);
    console.log('🛒 Creating checkout via server:', { serverItems, total, customer: customerInfo });

    const serverBase = (window.YAYA_CONFIG && window.YAYA_CONFIG.serverUrl) ? window.YAYA_CONFIG.serverUrl : '';
    const resp = await fetch(`${serverBase}/create-stripe-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: serverItems,
        successUrl: `${window.location.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/cart.html`
      })
    });

    const json = await resp.json();
    if (!resp.ok) {
      const msg = (json && (json.error || (json.errors && json.errors.map(e=>e.msg).join(', ')))) || `Server error: ${resp.status}`;
      throw new Error(msg);
    }

    if (json.url) {
      window.location = json.url;
      return;
    }

    if (!json.id) {
      throw new Error('No Checkout Session id returned from server');
    }

    const { error } = await stripe.redirectToCheckout({ sessionId: json.id });
    if (error) throw error;

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
      email: document.getElementById('email')?.value || '',
      address: document.getElementById('address')?.value || '',
      city: document.getElementById('city')?.value || '',
      state: document.getElementById('state')?.value || '',
      zip: document.getElementById('zip')?.value || ''
    };

    // Validation
    if (!customerInfo.email) {
      alert('Please enter your email address');
      return;
    }
    
    if (!customerInfo.name.trim()) {
      alert('Please enter your full name');
      return;
    }
    
    if (!customerInfo.address.trim() || !customerInfo.city.trim() || !customerInfo.state.trim() || !customerInfo.zip.trim()) {
      alert('Please fill in all shipping address fields');
      return;
    }

    // Show loading state
    const checkoutBtn = document.getElementById('stripe-checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.disabled = true;
      checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    }

    // Send order notification email before payment
    if (window.sendOrderNotification) {
      const total = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
      const fullAddress = `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} ${customerInfo.zip}`;
      
      await window.sendOrderNotification({
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        total: total.toFixed(2),
        items: cart,
        shippingAddress: fullAddress
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
      checkoutBtn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Complete Your Order';
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
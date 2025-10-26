/**
 * Simple Stripe Payment Integration
 * Client-side only - no backend server needed
 * Perfect for small poetry business
 */

// Stripe configuration
const STRIPE_CONFIG = {
  // Prefer a key injected via `window.YAYA_CONFIG` for environment-specific deployments.
  publishableKey: (window.YAYA_CONFIG && window.YAYA_CONFIG.stripePublishableKey) || 'pk_live_51SM7yMRMDdiM5E9AoXPdpUxWXxK3h2ZlOwy2hbqwp4o2BHAr2bM30LKSuNv8AdeMJV0l6nfhvIa2Hzxny8VI9GQx00dDiIoUZ6', // Live Stripe key (fallback)
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

    // Calculate totals and apply any discounts
    let subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * (item.quantity || item.qty || 1)), 0);
    let total = subtotal;
    let discountAmount = 0;
    
    // Check for applied discount from app.js
    const appliedDiscount = window.getAppliedDiscount ? window.getAppliedDiscount() : null;
    if (appliedDiscount && appliedDiscount.code && window.calculateDiscount) {
      const discountResult = window.calculateDiscount(subtotal, appliedDiscount.code);
      if (discountResult.valid) {
        discountAmount = discountResult.amount;
        total = subtotal - discountAmount;
        console.log('💰 Discount applied:', { code: appliedDiscount.code, amount: discountAmount, newTotal: total });
      }
    }

    // For client-side checkout with discounts, we need to use Stripe's embedded checkout
    // Create line items including discount as a separate item if applicable
    const lineItems = [];
    
    // Add product items
    cartItems.forEach(item => {
      lineItems.push({
        price_data: {
          currency: STRIPE_CONFIG.currency,
          product_data: {
            name: item.name || item.title || 'Product',
            description: item.description || '',
            images: item.image ? [window.location.origin + '/' + item.image] : []
          },
          unit_amount: Math.round(parseFloat(item.price) * 100) // Convert to cents
        },
        quantity: item.quantity || item.qty || 1
      });
    });

    // Add discount as a negative line item if applicable
    if (discountAmount > 0 && appliedDiscount) {
      lineItems.push({
        price_data: {
          currency: STRIPE_CONFIG.currency,
          product_data: {
            name: `Discount (${appliedDiscount.code})`,
            description: `Applied discount code: ${appliedDiscount.code}`
          },
          unit_amount: -Math.round(discountAmount * 100) // Negative amount for discount
        },
        quantity: 1
      });
    }

    console.log('🛒 Creating checkout session:', { lineItems, total, customer: customerInfo });

    // Use the server endpoint to create a proper Stripe Checkout Session
    // This approach works correctly and supports all features including discounts
    
    const serverUrl = window.YAYA_CONFIG?.serverUrl || '';
    const response = await fetch(`${serverUrl}/create-stripe-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name || item.title,
          price: parseFloat(item.price),
          quantity: item.quantity || item.qty || 1,
          image: item.image
        })),
        customer: customerInfo,
        discountAmount: discountAmount,
        discountCode: appliedDiscount?.code || '',
        total: total,
        successUrl: `${window.location.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/cart.html`
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error ${response.status}: ${errorText}`);
    }

    const session = await response.json();
    console.log('✅ Checkout session created:', session);

    // Redirect to Stripe Checkout
    if (session.url) {
      // Direct URL redirect (newer Stripe approach)
      window.location.href = session.url;
    } else if (session.id) {
      // Session ID redirect (older Stripe approach)
      const { error } = await stripe.redirectToCheckout({ sessionId: session.id });
      if (error) {
        throw new Error(`Stripe redirect error: ${error.message}`);
      }
    } else {
      throw new Error('No checkout URL or session ID returned from server');
    }    // Fallback: Client-side payment form
    // Since redirectToCheckout with line_items isn't supported, we'll create a payment form
    console.log('💳 Using client-side payment form approach');
    
    // Store order details for the payment form
    window.sessionStorage.setItem('pendingOrder', JSON.stringify({
      items: cartItems,
      customer: customerInfo,
      total: total,
      discountAmount: discountAmount,
      discountCode: appliedDiscount?.code || ''
    }));
    
    // For now, alert the user - in production you'd integrate Stripe Elements
    alert(`Order Total: $${total.toFixed(2)}${discountAmount > 0 ? ` (Discount: -$${discountAmount.toFixed(2)})` : ''}\n\nClick OK to proceed to payment form.`);
    
    // Redirect to a payment page with Stripe Elements
    // You would create a separate payment.html page with embedded Stripe Elements
    window.location.href = '/payment.html';
    
    console.log('� Order prepared:', { total, discountAmount, items: cartItems.length });
    
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
      checkoutBtn.innerHTML = '<i class="fas fa-credit-card"></i> Continue to Payment';
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
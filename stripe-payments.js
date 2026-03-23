/**
 * Stripe Payment Integration for Static Sites (GitHub Pages)
 * Uses Stripe Payment Element for client-side payment processing
 */

// Stripe configuration
const STRIPE_CONFIG = {
  publishableKey: (window.YAYA_CONFIG && window.YAYA_CONFIG.stripePublishableKey) || 'pk_live_51SM7yMRMDdiM5E9AoXPdpUxWXxK3h2ZlOwy2hbqwp4o2BHAr2bM30LKSuNv8AdeMJV0l6nfhvIa2Hzxny8VI9GQx00dDiIoUZ6',
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
 * Store order metadata in Firebase for later retrieval
 */
async function storeOrderMetadata(cartItems, customerInfo, orderDetails) {
  try {
    const orderData = {
      customerInfo: {
        name: customerInfo.name,
        email: customerInfo.email,
        address: customerInfo.address,
        city: customerInfo.city,
        state: customerInfo.state,
        zip: customerInfo.zip
      },
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name || item.title,
        price: parseFloat(item.price),
        quantity: item.quantity || item.qty || 1,
        image: item.image
      })),
      orderDetails: {
        subtotal: orderDetails.subtotal,
        discountAmount: orderDetails.discountAmount || 0,
        discountCode: orderDetails.discountCode || '',
        shipping: orderDetails.shipping,
        tax: orderDetails.tax,
        total: orderDetails.total
      },
      timestamp: new Date(),
      status: 'pending_payment',
      emailSent: false
    };

    // Store in Firebase if available
    if (window.firebaseDB && window.firebaseCollection && window.firebaseAddDoc) {
      try {
        const docRef = await window.firebaseAddDoc(window.firebaseCollection(window.firebaseDB, 'orders'), {
          ...orderData,
          timestamp: window.firebaseServerTimestamp ? window.firebaseServerTimestamp() : new Date()
        });
        console.log('📦 Order metadata stored in Firebase with ID:', docRef.id);
        
        // Store in sessionStorage as backup
        sessionStorage.setItem('pendingOrderId', docRef.id);
        sessionStorage.setItem('pendingOrder', JSON.stringify(orderData));
        
        return docRef.id;
      } catch (firebaseError) {
        console.warn('Firebase storage failed, using sessionStorage:', firebaseError);
      }
    }

    // Fallback to sessionStorage only
    console.log('📦 Storing order metadata in sessionStorage (Firebase not available)');
    sessionStorage.setItem('pendingOrder', JSON.stringify(orderData));
    return null;
  } catch (error) {
    console.error('❌ Failed to store order metadata:', error);
    // Final fallback to sessionStorage only
    const orderData = {
      customerInfo: customerInfo,
      items: cartItems,
      orderDetails: orderDetails,
      timestamp: Date.now(),
      status: 'pending_payment'
    };
    sessionStorage.setItem('pendingOrder', JSON.stringify(orderData));
    return null;
  }
}

/**
 * Create Stripe checkout
 * Uses server if configured, otherwise shows payment options
 */
async function createStripeCheckout(cartItems, customerInfo) {
  try {
    if (!stripe) {
      throw new Error('Stripe not initialized');
    }

    // Calculate totals and apply discounts
    let subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * (item.quantity || item.qty || 1)), 0);
    let discountAmount = 0;
    let discountedSubtotal = subtotal;
    
    // Check for applied discount
    const appliedDiscount = window.getAppliedDiscount ? window.getAppliedDiscount() : null;
    if (appliedDiscount && appliedDiscount.code && window.calculateDiscount) {
      const discountResult = window.calculateDiscount(subtotal, appliedDiscount.code, cartItems);
      if (discountResult.valid) {
        discountAmount = discountResult.amount;
        discountedSubtotal = subtotal - discountAmount;
        console.log('💰 Discount applied:', { code: appliedDiscount.code, amount: discountAmount, newSubtotal: discountedSubtotal });
      }
    }

  // Calculate shipping and tax (configurable via window.YAYA_CONFIG)
  // Use the discounted subtotal as the taxable/shippable base
  const cfg = window.YAYA_CONFIG || {};
    // taxRate: decimal (e.g. 0.085 for 8.5%). Accept either `taxRate` (decimal) or `taxPercent` (0-100).
    const taxRate = (typeof cfg.taxRate !== 'undefined') ? Number(cfg.taxRate) : ((typeof cfg.taxPercent !== 'undefined') ? Number(cfg.taxPercent) / 100 : 0);
    // Tax should be calculated on the discounted subtotal
    let tax = +(discountedSubtotal * (taxRate || 0));
    tax = Math.round(tax * 100) / 100; // round to 2 decimals
    // shipping in dollars. Accept `shipping` (dollars) or `shippingCents` (integer cents)
    let shipping = 0;
    if (typeof cfg.shipping !== 'undefined') shipping = Number(cfg.shipping);
    else if (typeof cfg.shippingCents !== 'undefined') shipping = Number(cfg.shippingCents) / 100;
    // free shipping over threshold (dollars) - compare against discounted subtotal
    if (typeof cfg.freeShippingOver !== 'undefined' && discountedSubtotal >= Number(cfg.freeShippingOver)) shipping = 0;

    const total = +(Math.round((discountedSubtotal + shipping + tax) * 100) / 100);

  console.log('🛒 Processing checkout:', { originalSubtotal: subtotal.toFixed(2), discountAmount: discountAmount.toFixed(2), discountedSubtotal: discountedSubtotal.toFixed(2), shipping: shipping.toFixed(2), tax: tax.toFixed(2), total: total.toFixed(2), items: cartItems.length });

    // Check if server URL is configured
    const serverUrl = window.YAYA_CONFIG?.serverUrl;
    
    if (serverUrl) {
      // Use server-side Stripe Checkout (full features)
      console.log('📡 Using server-side checkout:', serverUrl);
      
      // Store order metadata before redirecting to Stripe
      const orderId = await storeOrderMetadata(cartItems, customerInfo, {
        subtotal: discountedSubtotal,
        discountAmount: discountAmount,
        discountCode: appliedDiscount?.code || '',
        shipping: shipping,
        tax: tax,
        total: total
      });
      
      try {
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
              image: item.image,
              description: item.description || ''
            })),
            customer: customerInfo,
            discountAmount: discountAmount,
            discountCode: appliedDiscount?.code || '',
            shipping: shipping,
            tax: tax,
            taxRate: taxRate,
            subtotal: subtotal,
            total: total,
            successUrl: `${window.location.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${window.location.origin}/cart.html`
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server responded with ${response.status}: ${errorText}`);
        }

        const session = await response.json();
        console.log('✅ Checkout session created:', session);

        // Redirect to Stripe Checkout
        if (session.url) {
          console.log('🔗 Redirecting to Stripe Checkout...');
          window.location.href = session.url;
          return;
        } else if (session.id) {
          const { error } = await stripe.redirectToCheckout({ sessionId: session.id });
          if (error) throw error;
          return;
        } else {
          throw new Error('Server did not return checkout URL');
        }
      } catch (serverError) {
        console.error('❌ Server checkout failed:', serverError);
        throw new Error(`Server checkout failed: ${serverError.message}`);
      }
    } else {
      // No server configured - show payment options page
      console.log('⚠️ No server configured, redirecting to payment options...');
      
      // Store order metadata before redirecting
      const orderId = await storeOrderMetadata(cartItems, customerInfo, {
        subtotal: discountedSubtotal,
        discountAmount: discountAmount,
        discountCode: appliedDiscount?.code || '',
        shipping: shipping,
        tax: tax,
        total: total
      });
      
      window.location.href = 'payment.html';
    }
    
  } catch (error) {
    console.error('❌ Checkout error:', error);
    alert(`Payment error: ${error.message}\n\nPlease try again or contact support.`);
    throw error;
  }
}

/**
 * Handle checkout button click
 */
async function handleStripeCheckout() {
  try {
    // Get cart items
    const cart = getCartItems();
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
    
    // Track analytics event for checkout initiation
    if (window.analyticsTracker) {
      const cartTotal = cart.reduce((sum, item) => {
        const qty = item.quantity || item.qty || 1;
        return sum + ((parseFloat(item.price) || 0) * qty);
      }, 0);
      window.analyticsTracker.trackEcommerce('begin_checkout', {
        cart_items: cart.length,
        cart_value: cartTotal,
        customer_email: customerInfo.email
      });
    }

    // Show loading state
    const checkoutBtn = document.getElementById('stripe-checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.disabled = true;
      checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    }

    // Send order notification email (if available)
    if (window.sendOrderNotification) {
      try {
        const total = cart.reduce((sum, item) => sum + (parseFloat(item.price) * (item.quantity || item.qty || 1)), 0);
        const fullAddress = `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} ${customerInfo.zip}`;
        
        await window.sendOrderNotification({
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          total: total.toFixed(2),
          items: cart,
          shippingAddress: fullAddress
        });
      } catch (emailError) {
        console.warn('Email notification failed:', emailError);
        // Continue with checkout even if email fails
      }
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

console.log('💳 Stripe payment system loaded (static site mode)');

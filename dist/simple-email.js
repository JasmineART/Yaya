/**
 * Ultra-Simple Email Solution using EmailJS
 * No backend required, works immediately
 * 
 * Setup: Just need EmailJS account (free)
 */

// EmailJS configuration - Complete setup
const EMAILJS_CONFIG = {
  serviceId: 'service_5sl3jkm',        // ✅ Your Gmail service ID (Updated 11/7/2025)
  newsletterTemplateId: 'newsubs_kw32jj9',  // ✅ Newsletter template ID
  orderTemplateId: 'orderconfirm_vz7exbv',     // ✅ Order confirmation template ID
  userId: '_Y8GKbzV16a70S4PI'          // ✅ Your User ID (Public Key) - Updated 11/7/2025
};

/**
 * Send notification email (only for orders and newsletter signups)
 * @param {string} type - Email type: 'newsletter' or 'order'
 * @param {object} data - Email data
 */
async function sendNotificationEmail(type, data) {
  try {
    // Only send emails for orders and newsletter signups
    if (type !== 'newsletter' && type !== 'order') {
      console.log(`📝 ${type} notifications disabled - only saving to database`);
      return { success: true, skipped: true };
    }

    // Load EmailJS if not already loaded
    if (typeof emailjs === 'undefined') {
      await loadEmailJS();
    }

    // Prepare template parameters based on type
    let templateParams = {
      to_email: 'faeriepoetics@gmail.com',
      from_name: 'Yaya Starchild Website',
      reply_to: 'faeriepoetics@gmail.com',
      timestamp: new Date().toLocaleString()
    };

    let templateId;
    
    switch (type) {
      case 'newsletter':
        // Newsletter signup notification sent to faeriepoetics@gmail.com
        templateParams = {
          to_email: 'faeriepoetics@gmail.com',
          user_email: data.email,
          page: data.source || 'Website', 
          timestamp: templateParams.timestamp,
          from_name: 'Yaya Starchild Website',
          reply_to: data.email  // Allow replying to the subscriber
        };
        templateId = EMAILJS_CONFIG.newsletterTemplateId;
        console.log('📧 Sending newsletter signup notification to faeriepoetics@gmail.com');
        break;

      case 'order':
        // Order notification sent to faeriepoetics@gmail.com
        const itemsList = data.items.map(item => `${item.name} x${item.quantity} - $${item.price}`).join('\n');
        templateParams = {
          to_email: 'faeriepoetics@gmail.com',
          customer_name: data.customerName,
          customer_email: data.customerEmail,
          order_total: data.total,
          order_items: itemsList,
          shipping_address: data.shippingAddress,
          timestamp: templateParams.timestamp,
          from_name: 'Yaya Starchild Website',
          reply_to: data.customerEmail  // Allow replying to customer
        };
        templateId = EMAILJS_CONFIG.orderTemplateId;
        console.log('📧 Sending order notification to faeriepoetics@gmail.com');
        break;

      default:
        throw new Error('Invalid email type for notifications');
    }

    // Send email via EmailJS using appropriate template
    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      templateId,
      templateParams,
      EMAILJS_CONFIG.userId
    );

    console.log(`✅ ${type} notification sent successfully:`, response);
    return { success: true, messageId: response.text };

  } catch (error) {
    console.error(`❌ ${type} notification error:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Load EmailJS library dynamically
 */
function loadEmailJS() {
  return new Promise((resolve, reject) => {
    if (typeof emailjs !== 'undefined') {
      // EmailJS already loaded, initialize it
      try {
        emailjs.init(EMAILJS_CONFIG.userId);
        console.log('✅ EmailJS already loaded and initialized');
        resolve();
      } catch (error) {
        console.error('❌ EmailJS init error:', error);
        reject(error);
      }
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    script.onload = () => {
      try {
        // Initialize EmailJS after loading
        if (typeof emailjs === 'undefined') {
          throw new Error('EmailJS library loaded but emailjs object not found');
        }
        emailjs.init(EMAILJS_CONFIG.userId);
        console.log('✅ EmailJS library loaded and initialized');
        resolve();
      } catch (error) {
        console.error('❌ EmailJS initialization error:', error);
        reject(error);
      }
    };
    script.onerror = () => {
      const error = new Error('Failed to load EmailJS library from CDN');
      console.error('❌', error.message);
      reject(error);
    };
    document.head.appendChild(script);
  });
}

// Convenience functions
async function sendNewsletterSignup(email, source = 'website') {
  try {
    // Validate email first
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Invalid email address' };
    }
    
    // Send email notification for new subscribers
    return await sendNotificationEmail('newsletter', { email, source });
  } catch (error) {
    console.error('❌ sendNewsletterSignup error:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

async function sendCommentNotification(name, text, email = '') {
  // Comments only go to database - no email notifications
  console.log('📝 Comment received - saving to Firebase only (no email)');
  return { success: true, savedToDatabase: true, emailSkipped: true };
}

async function sendOrderNotification(orderData) {
  // Send email notification for new orders
  return sendNotificationEmail('order', orderData);
}

// Make functions available globally for all scripts
window.sendNewsletterSignup = sendNewsletterSignup;
window.sendCommentNotification = sendCommentNotification;
window.sendOrderNotification = sendOrderNotification;

// Also make them available as global functions (no window prefix needed)
globalThis.sendNewsletterSignup = sendNewsletterSignup;
globalThis.sendCommentNotification = sendCommentNotification;
globalThis.sendOrderNotification = sendOrderNotification;

console.log('✅ EmailJS functions loaded globally');

// Initialize EmailJS if library is already loaded
if (typeof emailjs !== 'undefined') {
  try {
    emailjs.init(EMAILJS_CONFIG.userId);
    console.log('✅ EmailJS initialized with User ID:', EMAILJS_CONFIG.userId);
  } catch (error) {
    console.warn('⚠️ EmailJS initialization warning:', error.message);
  }
}
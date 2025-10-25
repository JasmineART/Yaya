/**
 * Ultra-Simple Email Solution using EmailJS
 * No backend required, works immediately
 * 
 * Setup: Just need EmailJS account (free)
 */

// EmailJS configuration - Complete setup
const EMAILJS_CONFIG = {
  serviceId: 'service_eodjffq',        // ✅ Your Gmail service ID
  newsletterTemplateId: 'template_b6rgdel',  // ✅ Newsletter template ID
  orderTemplateId: 'template_New_Order',     // ✅ Fixed: Added template_ prefix
  userId: 'FWvhfYEosGwcS5rxq'          // ✅ Your User ID (Public Key)
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
        // Match your existing newsletter template structure
        templateParams = {
          user_email: data.email,
          page: data.source || 'Website', 
          timestamp: templateParams.timestamp
        };
        templateId = EMAILJS_CONFIG.newsletterTemplateId;
        break;

      case 'order':
        // Prepare order template parameters
        const itemsList = data.items.map(item => `${item.name} x${item.quantity} - $${item.price}`).join('\n');
        templateParams = {
          customer_name: data.customerName,
          customer_email: data.customerEmail,
          order_total: data.total,
          order_items: itemsList,
          shipping_address: data.shippingAddress,
          timestamp: templateParams.timestamp
        };
        templateId = EMAILJS_CONFIG.orderTemplateId;
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
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load EmailJS'));
    document.head.appendChild(script);
  });
}

// Convenience functions
async function sendNewsletterSignup(email, source = 'website') {
  // Send email notification for new subscribers
  return sendNotificationEmail('newsletter', { email, source });
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
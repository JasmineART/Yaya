/**
 * Ultra-Simple Email Solution using EmailJS
 * No backend required, works immediately
 * 
 * Setup: Just need EmailJS account (free)
 */

// EmailJS configuration - Complete setup
const EMAILJS_CONFIG = {
  serviceId: 'service_5sl3jkm',        // ✅ Your Gmail service ID (Updated 11/7/2025)
  orderTemplateId: 'orderconfirm_vz7exbv',     // ✅ Order confirmation template ID
  userId: '_Y8GKbzV16a70S4PI'          // ✅ Your User ID (Public Key) - Updated 11/7/2025
};

/**
 * Send notification email (only for orders)
 * @param {string} type - Email type: 'order'
 * @param {object} data - Email data
 */
async function sendNotificationEmail(type, data) {
  try {
    console.log(`📧 sendNotificationEmail called:`, { type, data });
    
    // Validate data exists
    if (!data || typeof data !== 'object') {
      console.warn(`⚠️  ${type} notification skipped - invalid data:`, data);
      return { success: false, error: 'Invalid data provided' };
    }

    // Ensure EmailJS is loaded
    if (typeof emailjs === 'undefined') {
      console.error('❌ EmailJS not loaded - checking if library exists in window');
      console.log('Available email functions:', Object.keys(window).filter(key => key.toLowerCase().includes('email')));
      return { success: false, error: 'EmailJS library not loaded' };
    }
    
    console.log('✅ EmailJS library is available');

    // Prepare template parameters based on email type
    let templateParams = {
      timestamp: new Date().toLocaleString('en-US', { 
        timeZone: 'America/Los_Angeles',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    let templateId;

    switch(type) {
      case 'order':
        // Validate required order data
        if (!data.items || !data.customerName || !data.customerEmail || !data.total) {
          console.warn('⚠️  Order notification skipped - missing required fields:', {
            hasItems: !!data.items,
            hasCustomerName: !!data.customerName,
            hasCustomerEmail: !!data.customerEmail,
            hasTotal: !!data.total
          });
          return { success: false, error: 'Missing required order fields' };
        }
        
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
        console.warn(`⚠️  Unknown email type: ${type}`);
        return { success: false, error: 'Invalid email type for notifications' };
    }

    // Send email via EmailJS using appropriate template
    console.log('📤 About to send email via EmailJS with:', {
      serviceId: EMAILJS_CONFIG.serviceId,
      templateId: templateId,
      templateParams: templateParams,
      userId: EMAILJS_CONFIG.userId
    });
    
    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      templateId,
      templateParams,
      EMAILJS_CONFIG.userId
    );

    console.log(`✅ ${type} notification sent successfully:`, response);
    console.log('📧 Full EmailJS response:', JSON.stringify(response, null, 2));
    return { success: true, messageId: response.text, fullResponse: response };

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
window.sendCommentNotification = sendCommentNotification;
window.sendOrderNotification = sendOrderNotification;

// Also make them available as global functions (no window prefix needed)
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
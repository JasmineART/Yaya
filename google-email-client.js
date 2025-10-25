/**
 * Google Cloud Email Client
 * 
 * Secure email sending via Google Cloud Functions
 * No API keys exposed to the client - all authentication handled server-side
 */

// Cloud Function URL (will be provided after deployment)
// Replace with your actual deployed function URL
const CLOUD_FUNCTION_URL = process.env.CLOUD_FUNCTION_URL || 
  'https://us-central1-yaya-starchild-email.cloudfunctions.net/sendEmail';

/**
 * Send email via Google Cloud Function
 * 
 * @param {string} type - Email type: 'newsletter', 'comment', or 'order'
 * @param {object} data - Email data specific to the type
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
async function sendEmailViaCloud(type, data) {
  try {
    console.log(`Sending ${type} email...`);
    
    const response = await fetch(CLOUD_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type, data })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } else {
      throw new Error(result.error || 'Failed to send email');
    }
    
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send newsletter signup notification
 * 
 * @param {string} email - Subscriber email address
 * @param {string} source - Source page (optional)
 */
async function sendNewsletterSignup(email, source = 'website') {
  return sendEmailViaCloud('newsletter', {
    email,
    source
  });
}

/**
 * Send comment notification
 * 
 * @param {string} name - Commenter name
 * @param {string} text - Comment text
 * @param {string} email - Commenter email (optional)
 */
async function sendCommentNotification(name, text, email = '') {
  return sendEmailViaCloud('comment', {
    name,
    text,
    email
  });
}

/**
 * Send order notification
 * 
 * @param {object} orderData - Order details
 * @param {string} orderData.customerName - Customer name
 * @param {string} orderData.customerEmail - Customer email
 * @param {number} orderData.total - Order total
 * @param {Array} orderData.items - Order items
 * @param {string} orderData.shippingAddress - Shipping address
 */
async function sendOrderNotification(orderData) {
  return sendEmailViaCloud('order', {
    customerName: orderData.customerName,
    customerEmail: orderData.customerEmail,
    total: orderData.total,
    items: orderData.items,
    shippingAddress: orderData.shippingAddress
  });
}

// Make functions available globally for inline event handlers
window.sendEmailViaCloud = sendEmailViaCloud;
window.sendNewsletterSignup = sendNewsletterSignup;
window.sendCommentNotification = sendCommentNotification;
window.sendOrderNotification = sendOrderNotification;

export { 
  sendEmailViaCloud, 
  sendNewsletterSignup, 
  sendCommentNotification, 
  sendOrderNotification 
};

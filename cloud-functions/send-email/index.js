const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const functions = require('@google-cloud/functions-framework');

// Initialize Secret Manager
const secretClient = new SecretManagerServiceClient();

// Cache credentials to avoid repeated Secret Manager calls
let gmailTransporter = null;

/**
 * Get secret from Google Cloud Secret Manager
 */
async function getSecret(secretName) {
  try {
    const projectId = process.env.GCP_PROJECT || 'yaya-starchild-email';
    const [version] = await secretClient.accessSecretVersion({
      name: `projects/${projectId}/secrets/${secretName}/versions/latest`,
    });
    
    const payload = version.payload.data.toString();
    return JSON.parse(payload);
  } catch (error) {
    console.error(`Error fetching secret ${secretName}:`, error);
    throw error;
  }
}

/**
 * Initialize Gmail transporter with OAuth2
 */
async function getGmailTransporter() {
  if (gmailTransporter) {
    return gmailTransporter;
  }
  
  try {
    console.log('Initializing Gmail transporter...');
    
    // Get credentials from Secret Manager
    const credentials = await getSecret('gmail-credentials');
    
    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      credentials.client_id,
      credentials.client_secret,
      credentials.redirect_uris?.[0] || 'urn:ietf:wg:oauth:2.0:oob'
    );
    
    // Set refresh token
    oauth2Client.setCredentials({
      refresh_token: credentials.refresh_token
    });
    
    // Get fresh access token
    const { token: accessToken } = await oauth2Client.getAccessToken();
    
    // Create Nodemailer transporter
    gmailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'faeriepoetics@gmail.com',
        clientId: credentials.client_id,
        clientSecret: credentials.client_secret,
        refreshToken: credentials.refresh_token,
        accessToken: accessToken
      }
    });
    
    console.log('✅ Gmail transporter initialized');
    return gmailTransporter;
    
  } catch (error) {
    console.error('❌ Error initializing Gmail transporter:', error);
    throw error;
  }
}

/**
 * Generate email HTML templates
 */
function getEmailTemplate(type, data) {
  const templates = {
    newsletter: {
      subject: '✨ New Newsletter Subscriber',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .info { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #667eea; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ New Newsletter Subscriber</h1>
            </div>
            <div class="content">
              <div class="info">
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Source:</strong> ${data.source || 'Website'}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
              </div>
              <p>Add this subscriber to your mailing list!</p>
            </div>
          </div>
        </body>
        </html>
      `
    },
    
    comment: {
      subject: `💬 New Comment from ${data.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .comment-box { background: white; padding: 20px; margin: 15px 0; border-left: 4px solid #667eea; font-style: italic; }
            .info { background: white; padding: 15px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💬 New Reader Comment</h1>
            </div>
            <div class="content">
              <div class="info">
                <p><strong>From:</strong> ${data.name}</p>
                <p><strong>Email:</strong> ${data.email || 'Not provided'}</p>
              </div>
              <div class="comment-box">
                <p>${data.text.replace(/\n/g, '<br>')}</p>
              </div>
              <p><small>Received: ${new Date().toLocaleString()}</small></p>
            </div>
          </div>
        </body>
        </html>
      `
    },
    
    order: {
      subject: `🛒 New Order - $${data.total}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .order-info { background: white; padding: 15px; margin: 10px 0; }
            .total { font-size: 24px; color: #667eea; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #667eea; color: white; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛒 New Order Received!</h1>
              <p class="total">$${data.total}</p>
            </div>
            <div class="content">
              <div class="order-info">
                <h3>Customer Information</h3>
                <p><strong>Name:</strong> ${data.customerName}</p>
                <p><strong>Email:</strong> ${data.customerEmail}</p>
              </div>
              
              <div class="order-info">
                <h3>Order Items</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${data.items.map(item => `
                      <tr>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>$${item.price}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
              
              <div class="order-info">
                <h3>Shipping Address</h3>
                <p>${data.shippingAddress.replace(/\n/g, '<br>')}</p>
              </div>
              
              <p><small>Order placed: ${new Date().toLocaleString()}</small></p>
            </div>
          </div>
        </body>
        </html>
      `
    }
  };
  
  return templates[type] || null;
}

/**
 * Main Cloud Function - HTTP endpoint for sending emails
 */
functions.http('sendEmail', async (req, res) => {
  // CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  // Only allow POST
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method Not Allowed' });
    return;
  }
  
  try {
    const { type, data } = req.body;
    
    // Validate request
    if (!type || !data) {
      res.status(400).json({ success: false, error: 'Missing type or data' });
      return;
    }
    
    console.log(`Processing ${type} email...`);
    
    // Get email template
    const template = getEmailTemplate(type, data);
    if (!template) {
      res.status(400).json({ success: false, error: 'Invalid email type' });
      return;
    }
    
    // Get Gmail transporter
    const transporter = await getGmailTransporter();
    
    // Prepare mail options
    const mailOptions = {
      from: 'Yaya Starchild Website <faeriepoetics@gmail.com>',
      to: 'faeriepoetics@gmail.com',
      subject: template.subject,
      html: template.html
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully:', info.messageId);
    
    res.status(200).json({
      success: true,
      messageId: info.messageId
    });
    
  } catch (error) {
    console.error('❌ Error sending email:', error);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Export for local testing
module.exports = { getSecret, getGmailTransporter, getEmailTemplate };

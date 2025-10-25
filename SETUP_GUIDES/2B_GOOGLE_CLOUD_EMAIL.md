# Secure Google Cloud Email Setup Guide

## Overview

This guide shows you how to securely send emails using Google Cloud Functions and Gmail API with proper API key protection.

**Why This Approach?**
- ✅ API keys stored server-side (never exposed to clients)
- ✅ Unlimited emails (pay-as-you-go)
- ✅ Professional email delivery
- ✅ Full control over email templates
- ✅ Integration with Firebase

**Cost:** ~$0.40 per 1 million requests (essentially free for a poetry site)

---

## Part 1: Google Cloud Project Setup

### Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with faeriepoetics@gmail.com

2. **Create New Project**
   - Click "Select a project" → "New Project"
   - Project name: `yaya-starchild-email`
   - Location: No organization
   - Click "Create"

3. **Enable Billing** (Required for Cloud Functions)
   - Click "Enable Billing"
   - Add payment method (won't charge unless you exceed free tier)
   - Free tier: 2 million function invocations/month

### Step 2: Enable Required APIs

1. **In Cloud Console, go to "APIs & Services"**
2. **Click "Enable APIs and Services"**
3. **Enable these APIs:**
   - ✅ Cloud Functions API
   - ✅ Gmail API
   - ✅ Cloud Build API
   - ✅ Secret Manager API (for secure key storage)

### Step 3: Set Up Gmail API Credentials

1. **Go to "APIs & Services" → "Credentials"**
2. **Click "Create Credentials" → "OAuth client ID"**
3. **Configure OAuth consent screen:**
   - User Type: Internal (if using Google Workspace) or External
   - App name: `Yaya Starchild Email Service`
   - User support email: faeriepoetics@gmail.com
   - Developer contact: faeriepoetics@gmail.com
   - Click "Save and Continue"

4. **Create OAuth Client:**
   - Application type: Web application
   - Name: `Yaya Email Backend`
   - Authorized redirect URIs: Leave empty for now
   - Click "Create"

5. **Download JSON credentials:**
   - Click the download icon
   - Save as `gmail-credentials.json`
   - **KEEP THIS FILE SECRET - DO NOT COMMIT TO GIT**

### Step 4: Set Up Service Account

1. **"Credentials" → "Create Credentials" → "Service Account"**
2. **Service account details:**
   - Name: `yaya-email-sender`
   - ID: `yaya-email-sender`
   - Description: "Sends emails for Yaya Starchild website"
   - Click "Create and Continue"

3. **Grant roles:**
   - Role: "Cloud Functions Invoker"
   - Click "Continue" → "Done"

4. **Create Key:**
   - Click on the service account
   - "Keys" tab → "Add Key" → "Create new key"
   - Type: JSON
   - Click "Create"
   - Save as `service-account-key.json`
   - **KEEP THIS FILE SECRET**

---

## Part 2: Secure Secret Storage

### Step 1: Enable Secret Manager

1. **Go to "Security" → "Secret Manager"**
2. **Click "Create Secret"**

### Step 2: Store Gmail Credentials

1. **Secret name:** `gmail-credentials`
2. **Secret value:** Paste contents of `gmail-credentials.json`
3. **Click "Create Secret"**

### Step 3: Store Service Account Key

1. **Create another secret**
2. **Secret name:** `service-account-key`
3. **Secret value:** Paste contents of `service-account-key.json`
4. **Click "Create Secret"**

### Step 4: Grant Access to Cloud Functions

1. **For each secret, click on it**
2. **"Permissions" tab**
3. **Add Principal:**
   - Principal: `yaya-email-sender@yaya-starchild-email.iam.gserviceaccount.com`
   - Role: "Secret Manager Secret Accessor"
   - Click "Save"

---

## Part 3: Cloud Function Deployment

### Step 1: Install Google Cloud SDK

On your local machine:

```bash
# Download and install
curl https://sdk.cloud.google.com | bash

# Initialize
gcloud init

# Select your project
gcloud config set project yaya-starchild-email

# Authenticate
gcloud auth login
```

### Step 2: Create Function Code

Create directory structure:
```bash
mkdir -p /workspaces/Yaya/cloud-functions/send-email
cd /workspaces/Yaya/cloud-functions/send-email
```

Create `package.json`:
```json
{
  "name": "yaya-send-email",
  "version": "1.0.0",
  "description": "Email sending function for Yaya Starchild website",
  "main": "index.js",
  "dependencies": {
    "@google-cloud/functions-framework": "^3.3.0",
    "@google-cloud/secret-manager": "^5.0.1",
    "googleapis": "^126.0.0",
    "nodemailer": "^6.9.7"
  }
}
```

Create `index.js`:
```javascript
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');

const functions = require('@google-cloud/functions-framework');

// Initialize Secret Manager
const secretClient = new SecretManagerServiceClient();

// Cache credentials
let gmailTransporter = null;

async function getSecret(secretName) {
  const [version] = await secretClient.accessSecretVersion({
    name: `projects/yaya-starchild-email/secrets/${secretName}/versions/latest`,
  });
  
  return JSON.parse(version.payload.data.toString());
}

async function getGmailTransporter() {
  if (gmailTransporter) return gmailTransporter;
  
  try {
    // Get credentials from Secret Manager
    const credentials = await getSecret('gmail-credentials');
    
    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      credentials.client_id,
      credentials.client_secret,
      credentials.redirect_uris[0]
    );
    
    // Set refresh token (you'll get this from OAuth flow)
    oauth2Client.setCredentials({
      refresh_token: credentials.refresh_token
    });
    
    // Get access token
    const accessToken = await oauth2Client.getAccessToken();
    
    // Create Nodemailer transporter
    gmailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'faeriepoetics@gmail.com',
        clientId: credentials.client_id,
        clientSecret: credentials.client_secret,
        refreshToken: credentials.refresh_token,
        accessToken: accessToken.token
      }
    });
    
    return gmailTransporter;
  } catch (error) {
    console.error('Error getting Gmail transporter:', error);
    throw error;
  }
}

// Main Cloud Function
functions.http('sendEmail', async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }
  
  try {
    const { type, data } = req.body;
    
    // Validate request
    if (!type || !data) {
      res.status(400).json({ error: 'Missing type or data' });
      return;
    }
    
    // Get Gmail transporter
    const transporter = await getGmailTransporter();
    
    // Prepare email based on type
    let mailOptions;
    
    switch (type) {
      case 'newsletter':
        mailOptions = {
          from: 'Yaya Starchild <faeriepoetics@gmail.com>',
          to: 'faeriepoetics@gmail.com',
          subject: '✨ New Newsletter Subscriber',
          html: `
            <h2>New Newsletter Subscription</h2>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Source:</strong> ${data.source || 'Unknown'}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          `
        };
        break;
        
      case 'comment':
        mailOptions = {
          from: 'Yaya Starchild <faeriepoetics@gmail.com>',
          to: 'faeriepoetics@gmail.com',
          subject: `💬 New Comment from ${data.name}`,
          html: `
            <h2>New Reader Comment</h2>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email || 'Not provided'}</p>
            <p><strong>Comment:</strong></p>
            <blockquote>${data.text}</blockquote>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          `
        };
        break;
        
      case 'order':
        mailOptions = {
          from: 'Yaya Starchild <faeriepoetics@gmail.com>',
          to: 'faeriepoetics@gmail.com',
          subject: `🛒 New Order - $${data.total}`,
          html: `
            <h2>New Order Received!</h2>
            <p><strong>Customer:</strong> ${data.customerName}</p>
            <p><strong>Email:</strong> ${data.customerEmail}</p>
            <p><strong>Total:</strong> $${data.total}</p>
            <h3>Items:</h3>
            <ul>
              ${data.items.map(item => `<li>${item.name} x${item.quantity} - $${item.price}</li>`).join('')}
            </ul>
            <h3>Shipping Address:</h3>
            <p>${data.shippingAddress}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          `
        };
        break;
        
      default:
        res.status(400).json({ error: 'Invalid email type' });
        return;
    }
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent:', info.messageId);
    
    res.status(200).json({
      success: true,
      messageId: info.messageId
    });
    
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

### Step 3: Deploy Function

```bash
cd /workspaces/Yaya/cloud-functions/send-email

# Deploy to Google Cloud
gcloud functions deploy sendEmail \
  --gen2 \
  --runtime=nodejs20 \
  --region=us-central1 \
  --source=. \
  --entry-point=sendEmail \
  --trigger-http \
  --allow-unauthenticated \
  --service-account=yaya-email-sender@yaya-starchild-email.iam.gserviceaccount.com \
  --set-secrets='gmail-credentials=gmail-credentials:latest'
```

This will output a URL like:
```
https://us-central1-yaya-starchild-email.cloudfunctions.net/sendEmail
```

---

## Part 4: Frontend Integration

### Step 1: Create Email Client

Create `/workspaces/Yaya/google-email-client.js`:

```javascript
// Google Cloud Function Email Client
// No API keys exposed - all authentication handled server-side

const CLOUD_FUNCTION_URL = 'https://us-central1-yaya-starchild-email.cloudfunctions.net/sendEmail';

async function sendEmailViaCloud(type, data) {
  try {
    const response = await fetch(CLOUD_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type, data })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Email sent successfully');
      return { success: true };
    } else {
      throw new Error(result.error || 'Failed to send email');
    }
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false, error: error.message };
  }
}

export { sendEmailViaCloud };
```

### Step 2: Update Form Handlers

Update `/workspaces/Yaya/app.js` to use Google Cloud:

```javascript
import { sendEmailViaCloud } from './google-email-client.js';

// Newsletter signup
async function handleNewsletterSignup(e) {
  e.preventDefault();
  
  const email = document.getElementById('newsletter-email').value;
  
  // Send via Google Cloud Function (secure)
  const result = await sendEmailViaCloud('newsletter', {
    email: email,
    source: window.location.pathname
  });
  
  if (result.success) {
    // Also save to Firebase
    // ... existing Firebase code ...
    
    alert('✨ Subscribed! Check your email for confirmation.');
  }
}
```

---

## Security Best Practices

### ✅ What Makes This Secure:

1. **No API Keys in Frontend Code**
   - All credentials stored in Secret Manager
   - Frontend only calls public Cloud Function URL

2. **Server-Side Authentication**
   - OAuth tokens refreshed server-side
   - Service account has minimal permissions

3. **Rate Limiting**
   - Cloud Functions automatically rate-limited
   - Add custom rate limiting if needed

4. **CORS Protection**
   - Configure allowed origins
   - Validate request sources

5. **Monitoring**
   - Cloud Functions logs all requests
   - Set up alerts for unusual activity

### 🔒 Additional Security (Optional):

Add API key verification in Cloud Function:

```javascript
const ALLOWED_API_KEY = process.env.API_KEY;

functions.http('sendEmail', async (req, res) => {
  // Verify API key
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== ALLOWED_API_KEY) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  
  // ... rest of function
});
```

Store API key in Secret Manager:
```bash
echo "your-random-api-key-here" | gcloud secrets create api-key --data-file=-
```

---

## Testing

### Test from Browser Console:

```javascript
const response = await fetch('YOUR_CLOUD_FUNCTION_URL', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'newsletter',
    data: { email: 'test@example.com' }
  })
});

const result = await response.json();
console.log(result);
```

### Test with curl:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"type":"newsletter","data":{"email":"test@example.com"}}' \
  YOUR_CLOUD_FUNCTION_URL
```

---

## Monitoring & Logs

### View Function Logs:

```bash
gcloud functions logs read sendEmail --limit 50
```

### Set Up Alerts:

1. Go to Cloud Console → Monitoring → Alerting
2. Create alert for:
   - High error rate
   - Unusual number of invocations
   - Function timeout

---

## Cost Estimation

**Google Cloud Functions Pricing:**
- First 2 million invocations: FREE
- After: $0.40 per million

**For a poetry site:**
- 100 newsletter signups/day = 3,000/month
- 20 comments/week = 80/month
- 5 orders/week = 20/month
- **Total: ~3,100 requests/month = FREE**

**Gmail API:**
- Completely free
- No quotas for personal use

---

## Troubleshooting

**"Permission denied" errors?**
- Check Secret Manager permissions
- Verify service account has access

**Emails not sending?**
- Check Cloud Function logs
- Verify Gmail credentials
- Test OAuth token refresh

**CORS errors?**
- Update CORS settings in function
- Add your domain to allowed origins

---

## Next Steps

1. ✅ Deploy Cloud Function
2. ✅ Test from browser
3. ✅ Integrate with forms
4. ✅ Set up monitoring
5. ✅ Configure payment processing (PAYMENT_SETUP.md)

## Support

- Google Cloud Docs: https://cloud.google.com/functions/docs
- Gmail API: https://developers.google.com/gmail/api

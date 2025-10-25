# Google Cloud Email Setup - README

## Overview

This directory contains a secure Google Cloud Function for sending emails from the Yaya Starchild website.

**Security Features:**
- ✅ No API keys in frontend code
- ✅ OAuth credentials stored in Google Secret Manager
- ✅ Server-side authentication only
- ✅ CORS protection
- ✅ Rate limiting built-in

## Quick Start

### Prerequisites

1. Google Cloud account with billing enabled
2. `gcloud` CLI installed
3. Gmail account: faeriepoetics@gmail.com

### Setup Steps

1. **Follow the complete guide:**
   See `/workspaces/Yaya/SETUP_GUIDES/2B_GOOGLE_CLOUD_EMAIL.md`

2. **Install dependencies:**
   ```bash
   cd cloud-functions/send-email
   npm install
   ```

3. **Deploy function:**
   ```bash
   npm run deploy
   ```
   
   Or manually:
   ```bash
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

4. **Get your function URL:**
   After deployment, you'll see:
   ```
   https://us-central1-yaya-starchild-email.cloudfunctions.net/sendEmail
   ```

5. **Update frontend:**
   In `/workspaces/Yaya/google-email-client.js`, update:
   ```javascript
   const CLOUD_FUNCTION_URL = 'YOUR_FUNCTION_URL_HERE';
   ```

## Usage

### From Frontend

```javascript
import { sendNewsletterSignup } from './google-email-client.js';

// Newsletter signup
const result = await sendNewsletterSignup('user@example.com', 'homepage');

if (result.success) {
  console.log('Email sent!');
}
```

### Email Types

1. **Newsletter Signup**
   ```javascript
   sendEmailViaCloud('newsletter', {
     email: 'user@example.com',
     source: 'homepage'
   });
   ```

2. **Comment Notification**
   ```javascript
   sendEmailViaCloud('comment', {
     name: 'John Doe',
     email: 'john@example.com',
     text: 'Love your poetry!'
   });
   ```

3. **Order Notification**
   ```javascript
   sendEmailViaCloud('order', {
     customerName: 'Jane Smith',
     customerEmail: 'jane@example.com',
     total: 19.99,
     items: [{ name: 'Suncatcher Spirit', quantity: 1, price: 19.99 }],
     shippingAddress: '123 Main St, City, ST 12345'
   });
   ```

## Testing

### Local Testing

Test the function locally before deploying:

```bash
# Start Functions Framework
npx @google-cloud/functions-framework --target=sendEmail --port=8080

# Send test request
curl -X POST http://localhost:8080 \
  -H "Content-Type: application/json" \
  -d '{"type":"newsletter","data":{"email":"test@example.com"}}'
```

### Browser Testing

```javascript
// Open browser console on your site
const response = await fetch('YOUR_CLOUD_FUNCTION_URL', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'newsletter',
    data: { email: 'test@example.com', source: 'test' }
  })
});

const result = await response.json();
console.log(result);
```

## Monitoring

### View Logs

```bash
# Recent logs
gcloud functions logs read sendEmail --limit 50

# Follow logs in real-time
gcloud functions logs read sendEmail --limit 10 --follow
```

### Cloud Console

1. Go to: https://console.cloud.google.com/functions
2. Click on `sendEmail` function
3. View:
   - Invocation count
   - Error rate
   - Execution time
   - Logs

## Cost

**Free Tier:**
- 2 million invocations/month
- 400,000 GB-seconds
- 200,000 GHz-seconds

**After Free Tier:**
- $0.40 per million invocations
- Minimal compute costs

**For this site:** Essentially FREE (< 5,000 invocations/month expected)

## Security

### Secrets in Secret Manager

1. **gmail-credentials** - OAuth credentials
2. **service-account-key** - Service account key (if needed)

### Best Practices

- ✅ Never commit credentials to Git
- ✅ Use Secret Manager for all sensitive data
- ✅ Rotate OAuth tokens periodically
- ✅ Monitor for unusual activity
- ✅ Set up billing alerts

## Troubleshooting

### Permission Denied

```bash
# Grant service account access to secrets
gcloud secrets add-iam-policy-binding gmail-credentials \
  --member="serviceAccount:yaya-email-sender@yaya-starchild-email.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### CORS Errors

Update CORS headers in `index.js`:
```javascript
res.set('Access-Control-Allow-Origin', 'https://yourdomain.com');
```

### OAuth Token Expired

Refresh token in Secret Manager:
1. Get new refresh token from OAuth playground
2. Update secret:
   ```bash
   echo '{"client_id":"...","refresh_token":"NEW_TOKEN"}' | \
   gcloud secrets versions add gmail-credentials --data-file=-
   ```

## Files

- `index.js` - Cloud Function code
- `package.json` - Dependencies and deploy script
- `README.md` - This file
- `.gcloudignore` - Files to exclude from deployment

## Support

- Google Cloud Functions: https://cloud.google.com/functions/docs
- Gmail API: https://developers.google.com/gmail/api
- Secret Manager: https://cloud.google.com/secret-manager/docs

## Next Steps

1. Deploy function
2. Test all email types
3. Integrate with website forms
4. Set up monitoring alerts
5. Configure payment processing

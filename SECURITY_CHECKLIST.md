# 🔒 Security Checklist - Google Cloud Email Setup

## ✅ What's Already Secured

### 1. **No API Keys in Frontend Code**
- ✅ All OAuth credentials stored in Google Secret Manager
- ✅ Frontend only calls public Cloud Function URL
- ✅ No sensitive data in JavaScript files

### 2. **Server-Side Authentication**
- ✅ OAuth tokens refreshed server-side only
- ✅ Service account with minimal permissions
- ✅ Gmail API accessed only from Cloud Function

### 3. **Secret Storage**
- ✅ Credentials in Google Secret Manager (encrypted at rest)
- ✅ Service account access controlled via IAM
- ✅ Automatic secret rotation support

### 4. **Git Protection**
- ✅ `.gitignore` configured to block credential files
- ✅ All `*-credentials.json` files excluded
- ✅ All `*-key.json` files excluded
- ✅ `.env` files excluded

### 5. **CORS Protection**
- ✅ CORS headers configured in Cloud Function
- ✅ Can restrict to specific domains (optional)

---

## 🔐 Security Best Practices

### Files That Should NEVER Be Committed:

```
❌ gmail-credentials.json
❌ service-account-key.json
❌ .env
❌ any file containing API keys
```

### What's Safe to Commit:

```
✅ firebase-config.js (Firebase API keys are public by design)
✅ google-email-client.js (only contains function URL)
✅ index.html, app.js (no secrets)
✅ cloud-functions/send-email/index.js (uses Secret Manager)
```

---

## 🛡️ Additional Security Measures (Optional)

### 1. Add API Key Verification

Add an API key to restrict who can call your Cloud Function:

**In Cloud Function (`index.js`):**
```javascript
const API_KEY = process.env.API_KEY; // Store in Secret Manager

functions.http('sendEmail', async (req, res) => {
  // Verify API key
  const providedKey = req.headers['x-api-key'];
  if (providedKey !== API_KEY) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  
  // ... rest of function
});
```

**Create API key secret:**
```bash
# Generate random API key
API_KEY=$(openssl rand -hex 32)

# Store in Secret Manager
echo $API_KEY | gcloud secrets create api-key --data-file=-

# Grant access to service account
gcloud secrets add-iam-policy-binding api-key \
  --member="serviceAccount:yaya-email-sender@yaya-starchild-email.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Update function to use secret
gcloud functions deploy sendEmail \
  --set-secrets="API_KEY=api-key:latest,gmail-credentials=gmail-credentials:latest"
```

**In Frontend (`google-email-client.js`):**
```javascript
// Store API key in environment variable
const API_KEY = 'your-random-api-key-here';

const response = await fetch(CLOUD_FUNCTION_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY
  },
  body: JSON.stringify({ type, data })
});
```

### 2. Restrict CORS to Your Domain

**In Cloud Function:**
```javascript
// Only allow requests from your domain
const ALLOWED_ORIGINS = [
  'https://yayas starchild.com',
  'https://www.yayastarchild.com',
  'http://localhost:8000' // For local testing
];

functions.http('sendEmail', async (req, res) => {
  const origin = req.headers.origin;
  
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
  } else {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  
  // ... rest of function
});
```

### 3. Rate Limiting

Prevent abuse by limiting requests per IP:

```javascript
const rateLimit = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const requests = rateLimit.get(ip) || [];
  
  // Filter requests from last hour
  const recentRequests = requests.filter(time => now - time < 3600000);
  
  // Allow max 10 requests per hour
  if (recentRequests.length >= 10) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimit.set(ip, recentRequests);
  return true;
}

functions.http('sendEmail', async (req, res) => {
  const ip = req.ip;
  
  if (!checkRateLimit(ip)) {
    res.status(429).json({ error: 'Rate limit exceeded' });
    return;
  }
  
  // ... rest of function
});
```

### 4. Input Validation

Prevent injection attacks:

```javascript
function sanitizeInput(input) {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .substring(0, 1000); // Limit length
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

functions.http('sendEmail', async (req, res) => {
  const { type, data } = req.body;
  
  // Validate email type
  if (!['newsletter', 'comment', 'order'].includes(type)) {
    res.status(400).json({ error: 'Invalid type' });
    return;
  }
  
  // Validate email address
  if (data.email && !validateEmail(data.email)) {
    res.status(400).json({ error: 'Invalid email address' });
    return;
  }
  
  // Sanitize text inputs
  if (data.text) {
    data.text = sanitizeInput(data.text);
  }
  
  // ... rest of function
});
```

---

## 📊 Monitoring & Alerts

### 1. Set Up Billing Alerts

```bash
# Go to Cloud Console → Billing → Budgets & alerts
# Create budget alert for $5/month (well above expected usage)
```

### 2. Monitor Function Logs

```bash
# View recent logs
gcloud functions logs read sendEmail --limit 50

# Watch logs in real-time
gcloud functions logs read sendEmail --follow

# Filter for errors
gcloud functions logs read sendEmail --filter="severity=ERROR"
```

### 3. Create Email Alerts

Set up alerts for:
- ❗ Function errors
- ❗ High invocation rate
- ❗ Billing threshold exceeded

Go to: https://console.cloud.google.com/monitoring/alerting

---

## 🔍 Security Audit Checklist

Before going live, verify:

- [ ] `.gitignore` includes all credential patterns
- [ ] No secrets committed to Git (check `git log --all -p | grep -i "client_secret"`)
- [ ] Secret Manager permissions correctly set
- [ ] Service account has minimal required permissions
- [ ] CORS configured for production domain
- [ ] Rate limiting implemented (optional but recommended)
- [ ] Input validation in place
- [ ] Monitoring alerts configured
- [ ] Billing alerts set up
- [ ] Test emails successfully delivered

---

## 🚨 Emergency Procedures

### If Credentials Are Compromised:

1. **Immediately revoke OAuth token:**
   ```bash
   # Go to: https://myaccount.google.com/permissions
   # Revoke access for "Yaya Email Service"
   ```

2. **Generate new credentials:**
   - Create new OAuth 2.0 Client ID
   - Get new refresh token
   - Update secret in Secret Manager

3. **Rotate service account key:**
   ```bash
   # Delete old key
   gcloud iam service-accounts keys list \
     --iam-account=yaya-email-sender@yaya-starchild-email.iam.gserviceaccount.com
   
   # Delete compromised key
   gcloud iam service-accounts keys delete KEY_ID \
     --iam-account=yaya-email-sender@yaya-starchild-email.iam.gserviceaccount.com
   ```

4. **Review access logs:**
   ```bash
   gcloud logging read "resource.type=cloud_function" --limit 100
   ```

### If Function Is Abused:

1. **Temporarily disable function:**
   ```bash
   gcloud functions delete sendEmail --region=us-central1
   ```

2. **Review logs for abuse patterns:**
   ```bash
   gcloud functions logs read sendEmail --limit 200
   ```

3. **Implement stricter rate limiting**

4. **Redeploy with additional security measures**

---

## 📝 Regular Security Maintenance

### Weekly:
- [ ] Check function error rate
- [ ] Review recent email logs

### Monthly:
- [ ] Review Secret Manager access logs
- [ ] Check billing for anomalies
- [ ] Update dependencies (`npm audit`)

### Quarterly:
- [ ] Rotate OAuth refresh token
- [ ] Review service account permissions
- [ ] Audit function code for security issues

---

## 🎯 Security Score

Your current setup:

| Security Measure | Status |
|-----------------|--------|
| Secrets in Secret Manager | ✅ Yes |
| No credentials in Git | ✅ Yes |
| Server-side auth | ✅ Yes |
| CORS protection | ✅ Basic |
| Rate limiting | ⚠️ Optional |
| Input validation | ⚠️ Recommended |
| Monitoring alerts | ⚠️ To configure |
| API key verification | ⚠️ Optional |

**Current Score: 5/8 (Good)**  
**Recommended Score: 7/8 (Excellent)**

---

## 📚 Resources

- [Google Cloud Security Best Practices](https://cloud.google.com/security/best-practices)
- [Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
- [OAuth 2.0 for Gmail](https://developers.google.com/gmail/api/auth/about-auth)
- [OWASP Security Guidelines](https://owasp.org/www-project-web-security-testing-guide/)

---

## ✅ Final Verification

Run this command to verify everything is secure:

```bash
# Check for any credential files in Git
git ls-files | grep -E '\.(json|key|pem)$'

# Should return: (empty) or only package.json
```

If any credential files appear, immediately:
```bash
git rm --cached filename
git commit -m "Remove credentials"
git push
```

Then regenerate those credentials and update Secret Manager.

---

**Remember:** Security is an ongoing process, not a one-time setup. Stay vigilant! 🛡️

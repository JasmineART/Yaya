# 🚀 Quick Reference - Secure Email Setup

## ⚡ One-Command Setup

```bash
cd /workspaces/Yaya && ./setup-google-email.sh
```

**Time:** 15 minutes  
**Result:** Secure email system fully deployed

---

## 📁 Key Files

| File | Purpose | Contains Secrets? |
|------|---------|-------------------|
| `/cloud-functions/send-email/index.js` | Cloud Function code | ❌ No (uses Secret Manager) |
| `/google-email-client.js` | Frontend client | ❌ No (only function URL) |
| `/SECURITY_CHECKLIST.md` | Security verification | ❌ No |
| `/.gitignore` | Protects credentials | ❌ No |
| Gmail credentials | OAuth tokens | ✅ **YES - NEVER COMMIT** |

---

## 🔐 Security Status

✅ **API Keys:** Stored in Google Secret Manager (encrypted)  
✅ **Frontend:** No secrets exposed  
✅ **Git Protection:** .gitignore configured  
✅ **Authentication:** Server-side OAuth 2.0 only  
✅ **Monitoring:** Google Cloud Logging enabled  

---

## 📧 Email Usage

### Newsletter Signup
```javascript
import { sendNewsletterSignup } from './google-email-client.js';
await sendNewsletterSignup('user@example.com', 'homepage');
```

### Comment Notification
```javascript
import { sendCommentNotification } from './google-email-client.js';
await sendCommentNotification('Name', 'Comment text', 'email@example.com');
```

### Order Notification
```javascript
import { sendOrderNotification } from './google-email-client.js';
await sendOrderNotification({
  customerName: 'Name',
  customerEmail: 'email@example.com',
  total: 19.99,
  items: [{ name: 'Book', quantity: 1, price: 19.99 }],
  shippingAddress: 'Address'
});
```

---

## 🧪 Testing

### Quick Test
```bash
curl -X POST YOUR_FUNCTION_URL \
  -H 'Content-Type: application/json' \
  -d '{"type":"newsletter","data":{"email":"test@example.com"}}'
```

### Browser Test
Open: `http://localhost:8000/firebase-test.html`

---

## 📊 Monitoring

```bash
# View recent logs
gcloud functions logs read sendEmail --limit 50

# Follow logs in real-time
gcloud functions logs read sendEmail --follow

# View Cloud Console
open https://console.cloud.google.com/functions
```

---

## 💰 Cost

**Free Tier:** 2,000,000 emails/month  
**Your Usage:** ~3,100/month  
**Your Cost:** **$0.00** ✅

---

## 🆘 Emergency Commands

### If credentials compromised:
```bash
# Revoke OAuth token
open https://myaccount.google.com/permissions

# Update secret
echo 'NEW_CREDENTIALS_JSON' | gcloud secrets versions add gmail-credentials --data-file=-
```

### If function is abused:
```bash
# Temporarily disable
gcloud functions delete sendEmail --region=us-central1

# Review logs
gcloud functions logs read sendEmail --limit 200
```

---

## 📚 Documentation

- **Complete Setup:** `/SETUP_GUIDES/2B_GOOGLE_CLOUD_EMAIL.md`
- **Security Checklist:** `/SECURITY_CHECKLIST.md`
- **Visual Overview:** `/google-cloud-email-overview.html`
- **Function README:** `/cloud-functions/send-email/README.md`

---

## ✅ Verification Checklist

Before going live:

- [ ] Function deployed successfully
- [ ] Test email received
- [ ] No credentials in Git
- [ ] .gitignore configured
- [ ] Secrets in Secret Manager
- [ ] Billing alerts set up
- [ ] Monitoring configured

---

**Project:** yaya-starchild-email  
**Email:** faeriepoetics@gmail.com  
**Region:** us-central1  
**Runtime:** Node.js 20

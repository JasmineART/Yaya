# Firebase Database Setup Guide

## Step 1: Create Firebase Project

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Sign in with your Google account (use the one associated with faeriepoetics@gmail.com)

2. **Create New Project**
   - Click "Add project"
   - Project name: `yaya-starchild-site` (or your choice)
   - Google Analytics: Optional (recommended for tracking)
   - Click "Create project"

## Step 2: Set Up Firestore Database

1. **In Firebase Console, go to "Firestore Database"**
   - Click "Create database"
   - Start in **Production mode** (we'll configure rules next)
   - Choose location: `us-central` or closest to your users
   - Click "Enable"

2. **Create Collections** (Database structure):
   ```
   Collections:
   ├── orders/           (customer orders)
   ├── newsletter/       (email subscribers)
   ├── comments/         (reader comments from about page)
   └── products/         (product inventory - optional)
   ```

## Step 3: Security Rules

In Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Newsletter submissions - allow create only
    match /newsletter/{email} {
      allow create: if request.auth == null 
                    && request.resource.data.email is string
                    && request.resource.data.email.matches('.*@.*\\..*');
      allow read, update, delete: if false; // Only admins via console
    }
    
    // Reader comments - allow create and read
    match /comments/{commentId} {
      allow create: if request.auth == null
                    && request.resource.data.name is string
                    && request.resource.data.text is string
                    && request.resource.data.name.size() > 0
                    && request.resource.data.text.size() > 0;
      allow read: if true;
      allow update, delete: if false;
    }
    
    // Orders - allow create only
    match /orders/{orderId} {
      allow create: if request.auth == null
                    && request.resource.data.email is string
                    && request.resource.data.items is list
                    && request.resource.data.total is number;
      allow read, update, delete: if false; // Only admins via console
    }
    
    // Products - read only for public
    match /products/{productId} {
      allow read: if true;
      allow write: if false; // Only admins via console
    }
  }
}
```

**Publish these rules** - Click "Publish"

## Step 4: Get Firebase Configuration

1. **Project Settings (gear icon) → General**
2. **Scroll to "Your apps" → Web app**
3. **Click the `</>` icon** to add web app
4. **Register app:**
   - App nickname: `Yaya Starchild Website`
   - Don't check Firebase Hosting
   - Click "Register app"

5. **Your Firebase configuration is already set up!**

Your project configuration:
```javascript
Project ID: yaya-starchild
Project Name: Yaya Starchild
```

## Step 5: ✅ Firebase Already Integrated!

**Good news:** The Firebase configuration file has already been created and integrated into your site!

**File created:** `/workspaces/Yaya/firebase-config.js`

Your actual configuration:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAckKED5ITmEOAtrrR1plBHpDvPbLpDGTc",
  authDomain: "yaya-starchild.firebaseapp.com",
  projectId: "yaya-starchild",
  storageBucket: "yaya-starchild.firebasestorage.app",
  messagingSenderId: "961392646015",
  appId: "1:961392646015:web:d2a2a91f3e40d68bb82c4a",
  measurementId: "G-Y32J55R36M"
};
```

## Step 6: ✅ HTML Files Already Updated!

Firebase has been integrated into all your pages:
- ✅ `index.html`
- ✅ `about.html`
- ✅ `shop.html`
- ✅ `product.html`
- ✅ `cart.html`
- ✅ `checkout.html`

## Step 7: Email Notifications Setup

Firebase alone doesn't send emails. You need to set up Firebase Cloud Functions:

1. **Enable Billing** (Free tier is generous):
   - Firebase Console → Upgrade to Blaze plan
   - Don't worry: You only pay for what you use beyond free tier
   - Free tier: 125K function invocations/month

2. **Install Firebase CLI:**
```bash
npm install -g firebase-tools
firebase login
firebase init functions
```

3. **Select your project** when prompted

4. **Install email extension:**
```bash
cd functions
npm install nodemailer
```

## Step 8: Security Best Practices

✅ **API Keys are safe for client-side** - Firebase API keys are public
✅ **Security Rules protect your data** - Rules are your firewall
✅ **Use environment variables for sensitive data**
✅ **Enable App Check** (optional, for bot protection):
   - Firebase Console → App Check → Register
   - Use reCAPTCHA v3 for web

## Step 9: Testing

Test in browser console:
```javascript
// Test newsletter submission
const { db, collection, addDoc } = await import('./firebase-config.js');

await addDoc(collection(db, 'newsletter'), {
  email: 'test@example.com',
  timestamp: new Date(),
  source: 'homepage'
});

console.log('✅ Newsletter subscription saved!');
```

## Step 10: Monitor Usage

- **Firebase Console → Usage and billing**
- Free tier limits:
  - Firestore: 50K reads/day, 20K writes/day
  - Storage: 1GB
  - Network: 10GB/month

## Next Steps

After Firebase is set up:
1. ✅ Configure email forwarding (see EMAIL_SETUP.md)
2. ✅ Set up payment processing (see PAYMENT_SETUP.md)
3. ✅ Integrate forms with Firebase (see FORM_INTEGRATION.md)

## Troubleshooting

**CORS errors?**
- Add your domain to authorized domains:
  - Firebase Console → Authentication → Settings → Authorized domains

**Can't write to database?**
- Check Security Rules
- Verify collection names match exactly

**Quota exceeded?**
- Check Firebase Console → Usage
- Upgrade to Blaze plan if needed (you control spending)

## Support

- Firebase Docs: https://firebase.google.com/docs
- Support: https://firebase.google.com/support

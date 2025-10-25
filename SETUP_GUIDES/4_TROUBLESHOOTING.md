# Troubleshooting Guide

Common issues and solutions for Firebase, Email, and Payment integration.

## 🔥 Firebase Issues

### Issue: "Permission Denied" when writing to database

**Cause:** Security rules are too restrictive

**Solution:**
1. Go to Firebase Console → Firestore → Rules
2. Verify rules match the guide exactly
3. Make sure you clicked "Publish" after updating rules
4. Wait 1-2 minutes for rules to propagate

**Test:**
```javascript
// Run in console to test write permission:
const { db, collection, addDoc } = await import('./firebase-config.js');
await addDoc(collection(db, 'newsletter'), { 
  email: 'test@test.com',
  timestamp: new Date()
});
// Should succeed without errors
```

---

### Issue: "Firebase not defined" error

**Cause:** Firebase scripts not loaded or wrong import

**Solution:**
1. Check that `firebase-config.js` exists
2. Verify you're using `type="module"` in script tag:
   ```html
   <script type="module" src="firebase-config.js"></script>
   ```
3. Make sure you're using await import:
   ```javascript
   const { db } = await import('./firebase-config.js');
   ```

---

### Issue: CORS errors with Firebase

**Cause:** Domain not whitelisted

**Solution:**
1. Firebase Console → Authentication → Settings
2. Add your domain to "Authorized domains"
3. Include both:
   - `localhost` (for dev)
   - Your production domain

---

### Issue: Quota exceeded

**Cause:** Hit free tier limits

**Check usage:**
1. Firebase Console → Usage and billing
2. See what's using quota

**Solutions:**
- Reduce writes (cache data client-side)
- Add indexes for faster queries
- Upgrade to Blaze plan (pay-as-you-go)

---

## 📧 Email Issues

### Issue: Emails not arriving

**Checklist:**
1. [ ] Check spam/junk folder
2. [ ] Verify EmailJS service is "Active" in dashboard
3. [ ] Confirm template IDs match exactly
4. [ ] Check EmailJS dashboard for delivery status
5. [ ] Verify email address is correct in template

**Debug:**
```javascript
// Test email manually:
emailjs.send(
  'YOUR_SERVICE_ID',
  'YOUR_TEMPLATE_ID',
  {
    user_email: 'test@example.com',
    timestamp: new Date().toLocaleString()
  },
  'YOUR_PUBLIC_KEY'
).then(
  (result) => console.log('✅ Success:', result),
  (error) => console.error('❌ Failed:', error)
);
```

---

### Issue: "Invalid or missing public key"

**Cause:** EmailJS not initialized correctly

**Solution:**
1. Verify public key is correct (Account → API Keys)
2. Check initialization:
   ```javascript
   emailjs.init('YOUR_PUBLIC_KEY'); // Must be called
   ```
3. Make sure EmailJS script is loaded before your code:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
   ```

---

### Issue: "Template not found"

**Cause:** Template ID doesn't match

**Solution:**
1. EmailJS Dashboard → Email Templates
2. Copy exact template ID
3. Update in your code - they're case-sensitive!

---

### Issue: Rate limit exceeded

**Cause:** Sent too many emails (200/month free tier)

**Solutions:**
- Wait until next month
- Upgrade to paid plan ($7/month = 1000 emails)
- Use alternative service for high-volume

---

## 💳 Payment Issues

### Issue: "Invalid API key"

**Cause:** Wrong key or extra spaces

**Solution:**
1. Go to Stripe Dashboard → Developers → API keys
2. Copy fresh keys (no spaces!)
3. Verify you're using:
   - **Publishable key** (pk_...) in client-side code
   - **Secret key** (sk_...) in server-side code
4. Check test vs live mode:
   - Development: Use `pk_test_...` and `sk_test_...`
   - Production: Use `pk_live_...` and `sk_live_...`

---

### Issue: "No such price" error

**Cause:** Price ID doesn't exist or typo

**Solution:**
1. Stripe Dashboard → Products
2. Click product → Copy exact Price ID
3. Update in your code:
   ```javascript
   prices: {
     'signed-edition': 'price_1234567890' // Use actual ID
   }
   ```

---

### Issue: Checkout redirects to 404 page

**Cause:** Success/cancel URLs are wrong

**Solution:**
1. Check URLs in checkout session creation:
   ```javascript
   success_url: 'https://yourdomain.com/success.html', // Must be full URL
   cancel_url: 'https://yourdomain.com/cart.html'
   ```
2. Use your actual domain (not localhost in production)
3. Create the success.html and cancel.html pages

---

### Issue: "This payment requires authentication"

**Cause:** Using test card that requires 3D Secure

**Solution:**
- This is normal! Stripe is simulating real auth flow
- Complete the test authentication
- Or use a simpler test card: `4242 4242 4242 4242`

---

### Issue: Payment succeeds but cart doesn't clear

**Cause:** Success page not clearing localStorage

**Solution:**
Add to success.html:
```javascript
<script>
  localStorage.removeItem('yaya-cart');
  if (typeof updateCartCount === 'function') {
    updateCartCount();
  }
</script>
```

---

### Issue: CORS errors with Stripe

**Cause:** Stripe API called from unauthorized domain

**Solution:**
1. Make sure you're using Stripe.js (not direct API):
   ```html
   <script src="https://js.stripe.com/v3/"></script>
   ```
2. For server calls, add CORS headers in Cloud Function:
   ```javascript
   res.set('Access-Control-Allow-Origin', '*');
   ```

---

### Issue: Bank verification taking too long

**Cause:** Normal - micro-deposits take 2-3 business days

**Solution:**
- Check your bank account in 2-3 days
- Look for two small deposits from Stripe
- Enter amounts in Stripe Dashboard to verify

---

## 🌐 General Issues

### Issue: "Script failed to load"

**Cause:** CDN blocked or offline

**Solution:**
1. Check internet connection
2. Try different network (disable VPN)
3. Open Network tab in DevTools
4. See which script failed
5. Try reloading page

---

### Issue: Features work on desktop but not mobile

**Cause:** Touch events or viewport issues

**Solution:**
1. Test in mobile browser DevTools (Chrome F12 → Toggle device)
2. Check console for mobile-specific errors
3. Verify viewport meta tag:
   ```html
   <meta name="viewport" content="width=device-width,initial-scale=1">
   ```

---

### Issue: Changes not appearing

**Cause:** Browser cache

**Solution:**
1. Hard refresh:
   - Chrome/Firefox: Ctrl+Shift+R (Cmd+Shift+R on Mac)
   - Safari: Cmd+Option+R
2. Or clear cache:
   - Chrome: DevTools → Network → Disable cache
   - Then reload page

---

### Issue: Console shows "Uncaught TypeError"

**Cause:** Element not found or wrong selector

**Solution:**
1. Check console for exact error line
2. Verify element exists:
   ```javascript
   const element = document.querySelector('#my-element');
   console.log(element); // Should not be null
   ```
3. Make sure scripts run after DOM loads:
   ```javascript
   document.addEventListener('DOMContentLoaded', () => {
     // Your code here
   });
   ```

---

## 🔐 Security Issues

### Issue: "API key exposed" warning

**Cause:** Publishable key in code (this is OK!)

**What's safe to expose:**
- ✅ Firebase API key (apiKey)
- ✅ Stripe publishable key (pk_...)
- ✅ EmailJS public key

**What to NEVER expose:**
- ❌ Stripe secret key (sk_...)
- ❌ Firebase service account key
- ❌ Email passwords

**If you exposed secret key:**
1. Go to Stripe/Firebase Dashboard immediately
2. Rotate/delete the compromised key
3. Generate new key
4. Update your code

---

### Issue: "Firebase security rules rejected"

**Cause:** Trying to do operation rules don't allow

**Solution:**
1. Check what operation failed (read/write/delete)
2. Review security rules
3. Test rules in Firebase Console → Rules playground
4. Common fix - make sure you're using correct collection name

---

## 📊 Performance Issues

### Issue: Site loads slowly

**Check:**
1. Network tab - what's taking longest?
2. File sizes:
   ```bash
   ls -lh assets/*.jpg assets/*.png
   ```

**Solutions:**
- Compress images (use TinyPNG.com)
- Enable browser caching
- Use WebP format for images
- Lazy load below-fold images

---

### Issue: Too many Firebase reads

**Cause:** Querying entire collections repeatedly

**Solution:**
1. Cache results in localStorage
2. Use `limit()` in queries:
   ```javascript
   const q = query(collection(db, 'products'), limit(10));
   ```
3. Only fetch when needed
4. Add indexes for complex queries

---

## 🆘 Emergency Fixes

### Issue: Site completely broken

**Quick recovery:**
1. Check browser console - what's the first error?
2. Revert last changes:
   ```bash
   git log --oneline
   git revert HEAD  # Undo last commit
   ```
3. Check Firebase status: https://status.firebase.google.com/
4. Check Stripe status: https://status.stripe.com/

---

### Issue: Payments not working during launch

**Triage:**
1. Check Stripe Dashboard - any errors?
2. Verify you switched to **live keys**
3. Check API key format (pk_live_... not pk_test_...)
4. Test with your own card first
5. Check success_url and cancel_url are correct

---

### Issue: Customer reports payment issue

**Response checklist:**
1. [ ] Check Stripe Dashboard for failed payment
2. [ ] Look at Stripe logs for that customer
3. [ ] Common causes:
   - Insufficient funds
   - Card declined by bank
   - Address verification failed
4. [ ] Ask customer to:
   - Try different card
   - Contact their bank
   - Check billing address matches card

---

## 📞 Getting Help

### Before asking for help:

1. [ ] Check this guide
2. [ ] Read official docs
3. [ ] Search the error message
4. [ ] Test in incognito mode
5. [ ] Check browser console

### When asking for help, include:

- Exact error message
- Browser and version
- Steps to reproduce
- Code snippet (if relevant)
- What you've tried already

### Support channels:

**Firebase:**
- Stack Overflow: tag `firebase`
- GitHub: https://github.com/firebase/
- Paid support: Available with Blaze plan

**EmailJS:**
- Email: support@emailjs.com
- Response time: 24-48 hours

**Stripe:**
- Support: https://support.stripe.com/
- Chat available in Dashboard
- Email: Very responsive

**General coding:**
- Stack Overflow
- MDN Web Docs: https://developer.mozilla.org/

---

## 🧪 Testing Commands

Run these in browser console to diagnose issues:

### Test Firebase connection:
```javascript
const { db } = await import('./firebase-config.js');
console.log('Firebase connected:', db);
```

### Test EmailJS:
```javascript
console.log('EmailJS loaded:', typeof emailjs !== 'undefined');
```

### Test Stripe:
```javascript
console.log('Stripe loaded:', typeof Stripe !== 'undefined');
```

### Test cart:
```javascript
console.log('Cart:', localStorage.getItem('yaya-cart'));
```

### Clear everything and start fresh:
```javascript
localStorage.clear();
location.reload();
```

---

## 🎯 Prevention Tips

**To avoid issues:**

1. ✅ Always test in incognito mode
2. ✅ Use browser DevTools Network tab
3. ✅ Check console before deploying
4. ✅ Test on multiple browsers
5. ✅ Keep API keys in separate config files
6. ✅ Never commit secrets to Git
7. ✅ Use environment variables for sensitive data
8. ✅ Test with real data before going live
9. ✅ Set up error monitoring (Sentry, LogRocket)
10. ✅ Keep backups of working code

---

**Still stuck? Re-read the setup guides step-by-step. 99% of issues are typos or skipped steps!**

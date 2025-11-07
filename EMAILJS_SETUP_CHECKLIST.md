# ✅ EmailJS Setup Checklist
## Quick Reference for faeriepoetics@gmail.com

Print this page and check off each step as you complete it.

---

## Part 1: Account & Service Setup (10 min)

- [ ] Go to https://www.emailjs.com/ → Sign Up
- [ ] Create account with: **faeriepoetics@gmail.com**
- [ ] Verify email (check inbox for verification link)
- [ ] Click "Email Services" → "Add New Service" → "Gmail"
- [ ] Sign in with faeriepoetics@gmail.com
- [ ] **GRANT ALL PERMISSIONS** when Google asks ⚠️
- [ ] Save Gmail service
- [ ] **Write down Service ID:** `service_________________`

---

## Part 2: Get Public Key (2 min)

- [ ] Click "Account" in left sidebar
- [ ] Find "API Keys" section
- [ ] Copy "Public Key" (User ID)
- [ ] **Write down Public Key:** `_____________________`

---

## Part 3: Newsletter Template (5 min)

- [ ] Click "Email Templates" → "Create New Template"
- [ ] Template Name: **Newsletter Signup Notification**
- [ ] From Name: **Yaya Starchild Website**
- [ ] Send To: **{{to_email}}** ← (use variable, not hardcoded email!)
- [ ] Reply To: **{{reply_to}}**
- [ ] Subject: **🌟 New Newsletter Subscriber**
- [ ] Copy email body HTML from guide (Part 4A, step 6)
- [ ] Paste into Content tab
- [ ] Save template
- [ ] **Write down Template ID:** `template_________________`
- [ ] Click "Send Test Email" → Send to faeriepoetics@gmail.com
- [ ] Check inbox - test email received? ✅

---

## Part 4: Order Template (5 min)

- [ ] Click "Email Templates" → "Create New Template"
- [ ] Template Name: **Order Notification**
- [ ] From Name: **Yaya Starchild Website**
- [ ] Send To: **{{to_email}}** ← (use variable!)
- [ ] Reply To: **{{reply_to}}**
- [ ] Subject: **🛍️ New Order - ${{order_total}}**
- [ ] Copy email body HTML from guide (Part 4B, step 6)
- [ ] Paste into Content tab
- [ ] Save template
- [ ] **Write down Template ID:** `template_________________`
- [ ] Click "Send Test Email" → Send to faeriepoetics@gmail.com
- [ ] Check inbox - test email received? ✅

---

## Part 5: Update Website Code (5 min)

- [ ] Open file: `/workspaces/Yaya/simple-email.js`
- [ ] Find `EMAILJS_CONFIG` section (around line 8)
- [ ] Replace with YOUR credentials:

```javascript
const EMAILJS_CONFIG = {
  serviceId: 'service_________________',     // ← Your Service ID
  newsletterTemplateId: 'template__________',  // ← Newsletter Template ID
  orderTemplateId: 'template__________',       // ← Order Template ID
  userId: '_____________________'          // ← Your Public Key
};
```

- [ ] Save file
- [ ] Push to GitHub:
  ```bash
  git add simple-email.js
  git commit -m "Update EmailJS credentials"
  git push origin main
  ```

---

## Part 6: Test Live Website (10 min)

### Newsletter Test:
- [ ] Go to https://pastelpoetics.com
- [ ] Scroll to footer newsletter form
- [ ] Enter test email
- [ ] Click "Join"
- [ ] Button shows "Subscribed!" ✅
- [ ] Check faeriepoetics@gmail.com inbox
- [ ] Received newsletter notification email? ✅

### Order Test:
- [ ] Go to https://pastelpoetics.com/shop.html
- [ ] Add any product to cart
- [ ] Go to checkout
- [ ] Fill in test information
- [ ] Complete payment (use Stripe test card)
- [ ] Check faeriepoetics@gmail.com inbox
- [ ] Received order notification email? ✅

---

## 🎯 Success Criteria

All checked? You're done! ✅

- ✅ EmailJS account created and verified
- ✅ Gmail service connected with ALL permissions
- ✅ Both templates created and tested
- ✅ Website code updated with credentials
- ✅ Live newsletter signup sends email
- ✅ Live order checkout sends email
- ✅ All emails arrive at faeriepoetics@gmail.com

---

## 📝 Your Credentials Summary

**Write your IDs here for reference:**

```
Service ID:           service_______________________

Public Key (User ID): _______________________________

Newsletter Template:  template_______________________

Order Template:       template_______________________
```

**Keep this information safe!** You'll need it if you ever need to update the code.

---

## 🆘 Quick Troubleshooting

**Error: "Insufficient authentication scopes"**
→ Reconnect Gmail in EmailJS Dashboard, grant ALL permissions

**Emails not received**
→ Check spam folder
→ Check EmailJS Dashboard → Usage to see if emails are sending

**Test button doesn't work**
→ Open browser console (F12) to see error messages
→ Verify EmailJS library is loaded on page

**Need more help?**
→ Open `/EMAILJS_COMPLETE_SETUP_GUIDE.md` for detailed instructions
→ Open `/fix-gmail-scope.html` in browser for diagnostic tool

---

## 📅 Setup Completed

- **Date:** _______________
- **Completed by:** _______________
- **Time taken:** _______________ minutes
- **Issues encountered:** _______________
- **Status:** ✅ Working / ⚠️ Needs attention

---

**Email quota:** 200 emails/month (free plan)  
**Current usage:** Check at https://dashboard.emailjs.com/admin  
**Upgrade if needed:** Plans start at $7/month for 1,000 emails

---

**🌟 All set! Your email notifications are now live! 🌟**

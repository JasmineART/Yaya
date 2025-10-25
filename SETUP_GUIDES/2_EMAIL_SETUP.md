# Email Form Submissions Setup Guide

## Option 1: EmailJS (Recommended - FREE & Easy)

EmailJS lets you send emails directly from client-side JavaScript without a backend server.

### Step 1: Create EmailJS Account

1. **Sign up at https://www.emailjs.com/**
   - Use faeriepoetics@gmail.com
   - Free plan: 200 emails/month

2. **Verify your email address**

### Step 2: Connect Your Email

1. **Go to "Email Services"** in EmailJS dashboard
2. **Click "Add New Service"**
3. **Choose "Gmail"**
4. **Click "Connect Account"** and authorize with faeriepoetics@gmail.com
5. **Service ID** will be created (e.g., `service_abc123`)
6. **Save** the service

### Step 3: Create Email Templates

1. **Go to "Email Templates"**
2. **Click "Create New Template"**

#### Template 1: Newsletter Signup
```
Template Name: newsletter_signup
Subject: New Newsletter Subscriber
To Email: faeriepoetics@gmail.com

Body:
New newsletter subscription!

Email: {{user_email}}
Subscribed from: {{page}}
Date: {{timestamp}}
```

#### Template 2: Contact Form / Comment
```
Template Name: reader_comment
Subject: New Reader Comment - {{user_name}}
To Email: faeriepoetics@gmail.com

Body:
New comment from {{user_name}}

Email: {{user_email}}
Message:
{{message}}

Posted on: {{page}}
Date: {{timestamp}}
```

#### Template 3: Order Confirmation (to you)
```
Template Name: new_order
Subject: New Order - ${{total}}
To Email: faeriepoetics@gmail.com

Body:
New order received!

Customer: {{customer_name}}
Email: {{customer_email}}
Total: ${{total}}

Items:
{{order_items}}

Shipping Address:
{{shipping_address}}

Date: {{timestamp}}
```

### Step 4: Get Your EmailJS Credentials

1. **Account → API Keys**
2. **Copy your Public Key** (e.g., `user_abc123xyz`)
3. **Note your Service ID** and **Template IDs**

### Step 5: Add EmailJS to Your Site

Create file: `/workspaces/Yaya/email-config.js`

```javascript
// EmailJS Configuration
const EMAILJS_CONFIG = {
  publicKey: 'YOUR_PUBLIC_KEY', // From Step 4
  serviceId: 'YOUR_SERVICE_ID', // e.g., service_abc123
  templates: {
    newsletter: 'newsletter_signup',
    comment: 'reader_comment',
    order: 'new_order'
  }
};

// Initialize EmailJS
(function() {
  emailjs.init(EMAILJS_CONFIG.publicKey);
})();

// Helper function to send email
async function sendEmail(templateId, params) {
  try {
    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      templateId,
      params
    );
    console.log('✅ Email sent successfully:', response);
    return { success: true, response };
  } catch (error) {
    console.error('❌ Email failed:', error);
    return { success: false, error };
  }
}

export { EMAILJS_CONFIG, sendEmail };
```

### Step 6: Add EmailJS Script to HTML

Add to `<head>` of all HTML files:

```html
<!-- EmailJS SDK -->
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
<script type="module" src="email-config.js"></script>
```

### Step 7: Update Form Handlers in app.js

Add these functions to `/workspaces/Yaya/app.js`:

```javascript
// Newsletter Form Handler
async function handleNewsletterSignup(e) {
  e.preventDefault();
  
  const emailInput = document.getElementById('newsletter-email');
  const email = emailInput.value.trim();
  
  if (!email) return;
  
  // Show loading state
  const button = e.target.querySelector('button');
  const originalText = button.innerHTML;
  button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  button.disabled = true;
  
  try {
    // Send email via EmailJS
    const { sendEmail } = await import('./email-config.js');
    const result = await sendEmail('newsletter_signup', {
      user_email: email,
      page: window.location.pathname,
      timestamp: new Date().toLocaleString()
    });
    
    if (result.success) {
      // Also save to Firebase (optional)
      if (window.db) {
        const { collection, addDoc } = await import('./firebase-config.js');
        await addDoc(collection(window.db, 'newsletter'), {
          email: email,
          timestamp: new Date(),
          source: window.location.pathname
        });
      }
      
      // Show success
      emailInput.value = '';
      button.innerHTML = '<i class="fas fa-check"></i> Subscribed!';
      setTimeout(() => {
        button.innerHTML = originalText;
        button.disabled = false;
      }, 3000);
    } else {
      throw new Error('Failed to send');
    }
  } catch (error) {
    console.error('Newsletter error:', error);
    button.innerHTML = '<i class="fas fa-exclamation"></i> Error';
    setTimeout(() => {
      button.innerHTML = originalText;
      button.disabled = false;
    }, 3000);
  }
}

// Comment Form Handler (for about.html)
async function handleCommentSubmit(e) {
  e.preventDefault();
  
  const nameInput = document.getElementById('comment-name');
  const textInput = document.getElementById('comment-text');
  
  const name = nameInput.value.trim();
  const text = textInput.value.trim();
  
  if (!name || !text) return;
  
  const button = e.target.querySelector('button');
  const originalText = button.innerHTML;
  button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';
  button.disabled = true;
  
  try {
    // Send email notification
    const { sendEmail } = await import('./email-config.js');
    await sendEmail('reader_comment', {
      user_name: name,
      user_email: '', // Optional: add email field to form
      message: text,
      page: 'About Page',
      timestamp: new Date().toLocaleString()
    });
    
    // Save to Firebase (optional)
    if (window.db) {
      const { collection, addDoc } = await import('./firebase-config.js');
      await addDoc(collection(window.db, 'comments'), {
        name: name,
        text: text,
        timestamp: new Date(),
        approved: false // Moderate before displaying
      });
    }
    
    // Show success
    nameInput.value = '';
    textInput.value = '';
    button.innerHTML = '<i class="fas fa-check"></i> Comment sent!';
    setTimeout(() => {
      button.innerHTML = originalText;
      button.disabled = false;
    }, 3000);
    
    alert('✨ Thank you for your reflection! It will appear after review.');
  } catch (error) {
    console.error('Comment error:', error);
    button.innerHTML = '<i class="fas fa-exclamation"></i> Error';
    setTimeout(() => {
      button.innerHTML = originalText;
      button.disabled = false;
    }, 3000);
  }
}

// Add event listeners when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  // Newsletter form
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', handleNewsletterSignup);
  }
  
  // Comment form
  const commentForm = document.getElementById('comment-form');
  if (commentForm) {
    commentForm.addEventListener('submit', handleCommentSubmit);
  }
});
```

## Option 2: Formspree (Alternative)

If you prefer Formspree:

1. **Sign up at https://formspree.io/**
2. **Free plan: 50 submissions/month**
3. **Create form endpoint**
4. **Use in HTML:**

```html
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
  <input type="email" name="email" required>
  <button type="submit">Subscribe</button>
</form>
```

## Option 3: Google Apps Script (Free, Unlimited)

Create a Google Apps Script to send emails:

1. **Go to https://script.google.com/**
2. **New Project**
3. **Paste this code:**

```javascript
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  
  MailApp.sendEmail({
    to: 'faeriepoetics@gmail.com',
    subject: 'New ' + data.type + ' Submission',
    body: JSON.stringify(data, null, 2)
  });
  
  return ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. **Deploy as Web App**
5. **Copy the web app URL**
6. **Use in your site:**

```javascript
fetch('YOUR_WEB_APP_URL', {
  method: 'POST',
  body: JSON.stringify({ type: 'newsletter', email: email })
});
```

## Testing

Test in browser console:

```javascript
// Test newsletter signup
const form = document.getElementById('newsletter-form');
const event = new Event('submit', { bubbles: true, cancelable: true });
form.dispatchEvent(event);
```

## Email Delivery Best Practices

1. ✅ **Add faeriepoetics@gmail.com to EmailJS whitelist**
2. ✅ **Check spam folder** initially
3. ✅ **Set up email filters** in Gmail to organize submissions
4. ✅ **Enable email notifications** on your phone
5. ✅ **Test with different email providers**

## Gmail Filters Setup

Create filters to organize incoming emails:

1. **Gmail → Settings → Filters**
2. **Create filters:**
   - Subject contains "Newsletter" → Label: Newsletter, Star
   - Subject contains "Comment" → Label: Comments, Star
   - Subject contains "Order" → Label: Orders, Star, Mark Important

## Troubleshooting

**Emails not arriving?**
- Check EmailJS dashboard for delivery status
- Verify service is connected
- Check Gmail spam folder
- Ensure template IDs match exactly

**Rate limits?**
- EmailJS free: 200/month
- Upgrade to $7/month for 1000 emails

## Next Steps

After email is working:
1. ✅ Set up payment processing (see PAYMENT_SETUP.md)
2. ✅ Test all forms thoroughly
3. ✅ Set up email templates for customer confirmations

## Support

- EmailJS Docs: https://www.emailjs.com/docs/
- EmailJS Support: support@emailjs.com

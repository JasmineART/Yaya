# 📧 Complete EmailJS Setup Guide for Yaya Starchild
## Fresh Account Setup from Scratch

**Account Email:** faeriepoetics@gmail.com  
**Website:** Yaya Starchild (pastelpoetics.com)  
**Estimated Time:** 20-30 minutes

---

## Part 1: Create EmailJS Account

### Step 1: Sign Up for EmailJS

1. **Go to EmailJS Website**
   - Visit: https://www.emailjs.com/
   - Click "Sign Up" (top right)

2. **Create Account**
   - Email: **faeriepoetics@gmail.com**
   - Password: Create a strong password (save it securely!)
   - Click "Sign Up"

3. **Verify Email**
   - Check faeriepoetics@gmail.com inbox
   - Click verification link in email from EmailJS
   - Click "Verify Email"

4. **Complete Profile** (optional but recommended)
   - Name: Yaya Starchild / Jasmine
   - Website: https://pastelpoetics.com
   - Save

✅ **Account created!** You'll be redirected to the dashboard.

---

## Part 2: Connect Gmail Service

### Step 2: Add Gmail Email Service

1. **In EmailJS Dashboard**
   - Left sidebar → Click "Email Services"
   - Click "Add New Service" button

2. **Select Gmail**
   - Find "Gmail" in the list
   - Click "Connect" or "Use Gmail"

3. **Connect Your Gmail Account**
   - Click "Connect Account" button
   - Sign in with: **faeriepoetics@gmail.com**
   - Password: (your Gmail password)

4. **⚠️ CRITICAL: Grant ALL Permissions**
   Google will show an authorization screen asking for permissions:
   
   ```
   EmailJS wants to access your Google Account
   
   This will allow EmailJS to:
   ☑️ Send email on your behalf
   ☑️ View and manage your email
   ☑️ Manage drafts and send emails
   ```
   
   **✅ Click "Allow" to grant ALL permissions**
   
   > **Important:** You MUST grant all permissions for emails to work.
   > This is what allows EmailJS to send emails through your Gmail.

5. **Save Gmail Service**
   - Service Name: "Gmail" (default is fine)
   - **Copy your Service ID** → It looks like: `service_abc1234`
   - Click "Create Service"

📝 **Write down your Service ID:** `service_____________`

✅ **Gmail connected!**

---

## Part 3: Get Your Public Key (User ID)

### Step 3: Find Your EmailJS Public Key

1. **In EmailJS Dashboard**
   - Left sidebar → Click "Account"
   - Look for "API Keys" section

2. **Copy Public Key**
   - Find "Public Key" (also called User ID)
   - It looks like: `user_abc123xyz` or similar
   - Click "Copy" button

📝 **Write down your Public Key:** `_________________`

✅ **You now have 2 important IDs to save!**

---

## Part 4: Create Email Templates

You need to create **2 email templates** for your site.

### Step 4A: Newsletter Signup Template

**What it does:** Sends you a notification when someone subscribes to your newsletter.

1. **In EmailJS Dashboard**
   - Left sidebar → Click "Email Templates"
   - Click "Create New Template" button

2. **Template Settings**
   - Template Name: `Newsletter Signup Notification`
   - Template ID: Leave as auto-generated (it will look like `template_abc1234`)

3. **From Configuration**
   ```
   From Name: Yaya Starchild Website
   From Email: {{from_name}} (leave the variable)
   Reply To: {{reply_to}}
   ```

4. **To Configuration**
   ```
   Send To: {{to_email}}
   ```
   
   > **Important:** Use `{{to_email}}` NOT a hardcoded email.
   > Your code will pass the actual email address.

5. **Subject Line**
   ```
   🌟 New Newsletter Subscriber
   ```

6. **Email Body** (Content tab)
   ```html
   <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #E89CC8 0%, #B88DD8 100%); color: white; border-radius: 15px;">
     
     <h1 style="text-align: center; color: white;">🌟 New Newsletter Subscriber!</h1>
     
     <div style="background: rgba(255, 255, 255, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;">
       <h2 style="margin-top: 0; color: white;">Subscriber Details</h2>
       <p style="font-size: 16px; line-height: 1.6;">
         <strong>Email:</strong> {{user_email}}<br>
         <strong>Subscribed from:</strong> {{page}}<br>
         <strong>Date:</strong> {{timestamp}}
       </p>
     </div>
     
     <div style="background: rgba(255, 255, 255, 0.1); padding: 15px; border-radius: 10px; margin: 20px 0;">
       <p style="margin: 0; font-size: 14px; opacity: 0.9;">
         💡 <strong>Next Steps:</strong><br>
         • Add this subscriber to your mailing list<br>
         • Consider sending a welcome email<br>
         • Update your subscriber count
       </p>
     </div>
     
     <p style="text-align: center; font-size: 12px; opacity: 0.8; margin-top: 30px;">
       Sent from Yaya Starchild Website<br>
       pastelpoetics.com
     </p>
   </div>
   ```

7. **Template Variables** (Auto-complete section)
   Make sure these variables exist:
   - `{{to_email}}` - Your email (faeriepoetics@gmail.com)
   - `{{user_email}}` - Subscriber's email
   - `{{page}}` - Page they subscribed from
   - `{{timestamp}}` - Date/time
   - `{{from_name}}` - Website name
   - `{{reply_to}}` - Subscriber's email (for replies)

8. **Save Template**
   - Click "Save" button
   - **Copy the Template ID** → It looks like: `template_abc1234`

📝 **Write down Newsletter Template ID:** `template_____________`

✅ **Newsletter template created!**

---

### Step 4B: Order Confirmation Template

**What it does:** Sends you a notification when someone places an order.

1. **In EmailJS Dashboard**
   - Email Templates → Click "Create New Template"

2. **Template Settings**
   - Template Name: `Order Notification`
   - Template ID: Leave as auto-generated

3. **From Configuration**
   ```
   From Name: Yaya Starchild Website
   From Email: {{from_name}}
   Reply To: {{reply_to}}
   ```

4. **To Configuration**
   ```
   Send To: {{to_email}}
   ```

5. **Subject Line**
   ```
   🛍️ New Order - ${{order_total}}
   ```

6. **Email Body** (Content tab)
   ```html
   <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #E89CC8 0%, #B88DD8 100%); color: white; border-radius: 15px;">
     
     <h1 style="text-align: center; color: white;">🛍️ New Order Received!</h1>
     
     <div style="background: rgba(255, 255, 255, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;">
       <h2 style="margin-top: 0; color: white;">Order Details</h2>
       <p style="font-size: 18px; line-height: 1.8;">
         <strong>Order Total:</strong> ${{order_total}}<br>
         <strong>Date:</strong> {{timestamp}}
       </p>
     </div>
     
     <div style="background: rgba(255, 255, 255, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;">
       <h2 style="margin-top: 0; color: white;">Customer Information</h2>
       <p style="font-size: 16px; line-height: 1.8;">
         <strong>Name:</strong> {{customer_name}}<br>
         <strong>Email:</strong> {{customer_email}}
       </p>
     </div>
     
     <div style="background: rgba(255, 255, 255, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;">
       <h2 style="margin-top: 0; color: white;">Items Ordered</h2>
       <pre style="background: rgba(0, 0, 0, 0.2); padding: 15px; border-radius: 8px; white-space: pre-wrap; font-size: 14px; line-height: 1.6;">{{order_items}}</pre>
     </div>
     
     <div style="background: rgba(255, 255, 255, 0.2); padding: 20px; border-radius: 10px; margin: 20px 0;">
       <h2 style="margin-top: 0; color: white;">Shipping Address</h2>
       <pre style="background: rgba(0, 0, 0, 0.2); padding: 15px; border-radius: 8px; white-space: pre-wrap; font-size: 14px; line-height: 1.6;">{{shipping_address}}</pre>
     </div>
     
     <div style="background: rgba(255, 255, 255, 0.1); padding: 15px; border-radius: 10px; margin: 20px 0;">
       <p style="margin: 0; font-size: 14px; opacity: 0.9;">
         💡 <strong>Next Steps:</strong><br>
         • Process the order through Stripe dashboard<br>
         • Prepare items for shipping<br>
         • Send customer a shipping confirmation<br>
         • Reply to customer at: {{customer_email}}
       </p>
     </div>
     
     <p style="text-align: center; font-size: 12px; opacity: 0.8; margin-top: 30px;">
       Sent from Yaya Starchild Website<br>
       pastelpoetics.com
     </p>
   </div>
   ```

7. **Template Variables**
   Make sure these variables exist:
   - `{{to_email}}` - Your email
   - `{{customer_name}}` - Customer's name
   - `{{customer_email}}` - Customer's email
   - `{{order_total}}` - Total amount
   - `{{order_items}}` - List of items
   - `{{shipping_address}}` - Shipping address
   - `{{timestamp}}` - Date/time
   - `{{from_name}}` - Website name
   - `{{reply_to}}` - Customer's email

8. **Save Template**
   - Click "Save"
   - **Copy the Template ID**

📝 **Write down Order Template ID:** `template_____________`

✅ **Order template created!**

---

## Part 5: Test Your Templates

### Step 5: Send Test Emails

1. **Test Newsletter Template**
   - Go to Email Templates
   - Click on "Newsletter Signup Notification"
   - Click "Send Test Email" button
   - Fill in test values:
     ```
     to_email: faeriepoetics@gmail.com
     user_email: test@example.com
     page: Homepage
     timestamp: 11/7/2025 10:30 AM
     from_name: Yaya Starchild Website
     reply_to: test@example.com
     ```
   - Click "Send"
   - Check faeriepoetics@gmail.com inbox ✅

2. **Test Order Template**
   - Go to Email Templates
   - Click on "Order Notification"
   - Click "Send Test Email" button
   - Fill in test values:
     ```
     to_email: faeriepoetics@gmail.com
     customer_name: Jane Doe
     customer_email: jane@example.com
     order_total: 24.99
     order_items: Suncatcher Spirit (Signed) x1 - $24.99
     shipping_address: 123 Main St, City, ST 12345
     timestamp: 11/7/2025 10:30 AM
     from_name: Yaya Starchild Website
     reply_to: jane@example.com
     ```
   - Click "Send"
   - Check faeriepoetics@gmail.com inbox ✅

✅ **Both test emails sent successfully!**

---

## Part 6: Update Your Website Code

### Step 6: Add Credentials to Your Code

Now you need to update the website with your new EmailJS credentials.

1. **Open your code editor**
   - Open file: `/workspaces/Yaya/simple-email.js`

2. **Find the EMAILJS_CONFIG section** (lines 8-13)
   
3. **Update with YOUR credentials:**

   ```javascript
   // EmailJS configuration - Complete setup
   const EMAILJS_CONFIG = {
     serviceId: 'service_YOUR_ID_HERE',        // ← Paste your Service ID from Step 2
     newsletterTemplateId: 'template_YOUR_ID_HERE',  // ← Paste Newsletter Template ID
     orderTemplateId: 'template_YOUR_ID_HERE',     // ← Paste Order Template ID
     userId: 'YOUR_PUBLIC_KEY_HERE'          // ← Paste your Public Key from Step 3
   };
   ```

4. **Example (with your actual IDs):**
   ```javascript
   const EMAILJS_CONFIG = {
     serviceId: 'service_abc1234',
     newsletterTemplateId: 'template_xyz5678',
     orderTemplateId: 'template_def9012',
     userId: 'user_abc123xyz'
   };
   ```

5. **Save the file**

✅ **Code updated with your credentials!**

---

## Part 7: Test on Your Live Website

### Step 7A: Test Newsletter Signup

1. **Go to your website**
   - Visit: https://pastelpoetics.com

2. **Scroll to footer**
   - Find newsletter signup form

3. **Enter test email**
   - Email: `yourpersonal@email.com`
   - Click "Join" button

4. **Check for success**
   - Button should show "Subscribed!" ✅
   - Check faeriepoetics@gmail.com inbox
   - You should receive "New Newsletter Subscriber" email

✅ **Newsletter working!**

### Step 7B: Test Order Flow

1. **Go to shop page**
   - Visit: https://pastelpoetics.com/shop.html

2. **Add item to cart**
   - Click on any product
   - Click "Add to Cart"

3. **Go to checkout**
   - Click "Cart" in navigation
   - Click "Proceed to Checkout"

4. **Complete test order**
   - Fill in all fields with test data
   - Click "Pay Now"
   - Complete Stripe checkout (use test card)

5. **Check for confirmation**
   - After payment, check faeriepoetics@gmail.com inbox
   - You should receive "New Order" email ✅

✅ **Order notifications working!**

---

## Part 8: Configure Additional Settings (Optional)

### Step 8: Adjust EmailJS Settings

1. **Email Quota Management**
   - Dashboard → Account → Usage
   - Free plan: 200 emails/month
   - If you need more, upgrade to paid plan

2. **Email From Name** (optional)
   - Email Services → Edit Gmail service
   - Change "From Name" to: `Yaya Starchild`
   - Save

3. **Auto-Reply** (optional)
   - Email Templates → Edit template
   - Add Auto-Reply section
   - Configure automatic response to subscribers

4. **Email Tracking** (optional)
   - Dashboard → Settings
   - Enable email open tracking
   - Enable link click tracking

✅ **Optional settings configured!**

---

## 📋 Summary: Your EmailJS Configuration

Once complete, you should have:

### ✅ Account Created
- Email: faeriepoetics@gmail.com
- Password: (saved securely)
- Account verified ✅

### ✅ Gmail Service Connected
- Service ID: `service_____________` (you wrote this down)
- All permissions granted ✅
- Test email sent ✅

### ✅ Public Key Retrieved
- User ID: `_________________` (you wrote this down)

### ✅ Templates Created
1. **Newsletter Template**
   - Name: Newsletter Signup Notification
   - ID: `template_____________`
   - Purpose: Notify you of new subscribers
   - Sends to: faeriepoetics@gmail.com ✅

2. **Order Template**
   - Name: Order Notification
   - ID: `template_____________`
   - Purpose: Notify you of new orders
   - Sends to: faeriepoetics@gmail.com ✅

### ✅ Code Updated
- File: `simple-email.js`
- All IDs added ✅
- Code saved ✅

### ✅ Testing Complete
- Newsletter signup tested ✅
- Order notification tested ✅
- Emails received in inbox ✅

---

## 🔧 Troubleshooting

### Issue: "Insufficient authentication scopes" error

**Solution:**
1. Go to EmailJS Dashboard → Email Services
2. Click on Gmail service
3. Click "Re-authenticate"
4. Sign in with faeriepoetics@gmail.com
5. **Grant ALL permissions** when Google asks
6. Save

### Issue: Emails not received

**Check:**
1. Spam folder in Gmail
2. EmailJS Dashboard → Usage (check if emails are being sent)
3. Browser console for errors (F12 → Console)
4. Verify all Template IDs are correct in code

### Issue: Test email works but website doesn't

**Check:**
1. File `simple-email.js` is loaded in HTML:
   ```html
   <script src="simple-email.js"></script>
   ```
2. EmailJS library is loaded:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
   ```
3. Load order: EmailJS library BEFORE simple-email.js

---

## 📞 Support Resources

- **EmailJS Documentation:** https://www.emailjs.com/docs/
- **EmailJS Support:** Dashboard → Help → Contact Support
- **Gmail Help:** https://support.google.com/mail
- **Your diagnostic tool:** `/fix-gmail-scope.html`

---

## 🎉 You're Done!

Your EmailJS account is fully configured! You'll now receive:

✅ Notifications when someone subscribes to your newsletter  
✅ Notifications when someone places an order  
✅ All emails delivered to: faeriepoetics@gmail.com  

**Emails sent per month:** Up to 200 (free plan)  
**Cost:** Free (or upgrade if you need more)  
**Reliability:** High (using Gmail's infrastructure)  

**Need help?** Open `/fix-gmail-scope.html` in your browser to test and diagnose any issues.

---

**Setup completed:** [Date]  
**Completed by:** [Your name]  
**Account email:** faeriepoetics@gmail.com  
**Website:** https://pastelpoetics.com

🌟 Happy email sending! 🌟

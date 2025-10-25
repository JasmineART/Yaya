Yaya payments server (example)

This folder contains a minimal Express server that demonstrates how to securely create Stripe Checkout sessions and PayPal orders.

Setup
1. Copy .env.example to .env and fill in keys.
2. Install dependencies and run locally:

```bash
cd server
npm install
npm run dev
```

3. The server will listen on the port in .env (default 4242). Client pages in the static site can POST to /create-stripe-session or /create-paypal-order.

Notes
- This is a demonstration scaffold. For production ensure webhooks are validated, secrets are stored securely, and checkout success handling is robust.
- PayPal endpoints use the sandbox API. For live use change the endpoints or environment variables accordingly.

Firebase & email: additional setup
--------------------------------

This server supports optionally writing orders to Google Firebase Firestore and sending an email notification when a new order is submitted.

Environment variables (pick one for Firebase):
- FIREBASE_SERVICE_ACCOUNT: JSON string of the Firebase service account (recommended for container deployments).
- FIREBASE_SERVICE_ACCOUNT_PATH: path on disk to the service account JSON file.

Email settings (one of these):
- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS — used by nodemailer to send email to COMPANY_EMAIL.
- SENDGRID_API_KEY — used by SendGrid to send email to COMPANY_EMAIL.

Required recipient:
- COMPANY_EMAIL (or EMAIL_TO): the address that should receive new order notifications.

Server endpoint:
- POST /submit-order — Accepts JSON {name,email,address,city,items,giftWrap,pay} and will store to Firestore (if configured) or Supabase, then email COMPANY_EMAIL.

Local testing notes:
- If you don't configure SMTP or SendGrid, the server will still store orders (if Firestore or Supabase configured) but will log that no recipient is configured.
- To test email delivery locally, configure SMTP with a service like MailHog, Mailtrap, or a real SMTP provider and set COMPANY_EMAIL.

Security:
- Do not commit service account JSON into version control. Use environment variables or secret storage.
- For public deployments, ensure you secure `/submit-order` with rate-limiting (already enabled) and consider adding recaptcha or other protections.

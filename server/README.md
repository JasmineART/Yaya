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

NEXT STEPS — Yaya Starchild project

Purpose

This document lists the actionable steps to continue development in the next session. It assumes you have the repository open at /workspaces/Yaya and a working Node.js environment for the `server` folder.

Quick repo map

- / (root): static site files (index.html, shop.html, product.html, about.html, cart.html, checkout.html), styles.css, app.js, products.js, assets/
- /server: Node/Express server scaffold (index.js), templates/, e2e scripts, package.json, .env.example, supabase.sql

Local dev checklist

1) Install server dependencies

  cd server
  npm install

2) Start the server in development

  # runs nodemon (auto-restart)
  npm run dev

3) Serve the static site locally (two options)

  # Simple Python static server (recommended for quick tests)
  python3 -m http.server 8000

  # Or use a simple Node static server (install serve globally if desired)
  npx serve -s . -l 8000

4) Connect the frontend to server

- The frontend expects the server endpoints under the `server` path; when running the static server from the repo root, set the server base URL to http://localhost:3000 (or whatever PORT is set in the server .env).
- To use the server from local static pages, open the site at http://localhost:8000 and ensure `server` is reachable at http://localhost:3000.

Supabase setup (free tier)

1) Create a Supabase project at https://supabase.com
2) In the SQL editor, run the file server/supabase.sql to create the `newsletter`, `comments`, and `orders` tables.
3) From Project Settings -> API, copy `SUPABASE_URL` and create (or copy) a `SUPABASE_SERVICE_ROLE` key.
4) Save keys in server/.env (do NOT commit) using the format in server/.env.example.

Stripe & PayPal (sandbox -> production)

1) Stripe (recommended flow)
  - Create a Stripe account and get your `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` for the webhook endpoint.
  - Add them to server/.env.
  - For local webhook testing, install the Stripe CLI and run: `stripe listen --forward-to localhost:3000/webhook/stripe` and copy the webhook secret into .env.
  - The server exposes `POST /create-stripe-session` which returns { url, id }. The E2E script prints the Stripe CLI command if a real session id is returned.

2) PayPal
  - Create a PayPal developer sandbox app and add `PAYPAL_CLIENT_ID` and `PAYPAL_SECRET` to server/.env.
  - The server has `POST /create-paypal-order` to create orders; finish capture flow in server if desired.

E2E testing (non-interactive)

- Run the automatic E2E flow (simulates webhook) without Stripe CLI:

  cd server
  AUTO_SIMULATE=1 npm run e2e

- To test with a real Stripe webhook (interactive):

  # start the Stripe CLI (on your local machine)
  stripe listen --forward-to localhost:3000/webhook/stripe
  # run E2E (it will print a stripe CLI command if using a live session id)
  npm run e2e

Troubleshooting Exit Code 254 (npm / server failures)

If `npm install` or `npm run dev` exits with code 254, do the following and paste outputs into the issue tracker if problems persist.

1) Check Node.js & npm versions

  node -v
  npm -v

Recommended: Node 18.x or 20.x (LTS). If your version is older, install a recent LTS using nvm.

2) Clear and reinstall

  # from server/
  rm -rf node_modules package-lock.json
  npm cache clean --force
  npm install

3) Run with debug output

  # to capture more verbose logs
  npm run dev --silent
  # or run node directly
  node index.js

4) Common causes
  - Missing network access for npm install (CI or firewall). Try again or switch networks.
  - Permissions issue when installing global packages. Avoid installing globally.
  - Environment variables missing that the server expects at startup. Use .env file.

If the server starts but E2E fails to report orders/emails

- Check `/_debug/orders` and `/_debug/sent-emails` endpoints on the server to see stored data.
- Check server logs for webhook verification errors: `Stripe signature verification failed` indicates `STRIPE_WEBHOOK_SECRET` mismatch.

Security & deployment notes

- Never commit `SUPABASE_SERVICE_ROLE` or `STRIPE_SECRET_KEY`. Use environment variables and CI secrets.
- For production email, configure SendGrid with `SENDGRID_API_KEY` or a real SMTP account; update templates and remove in-memory `sentEmails` storage.
- Harden CORS, configure HTTPS, and move to a managed DB/hosting for production flows.

What I will do next session (recommended priorities)

1) Reproduce and fix the Exit Code 254 error by running `npm install` and `npm run dev` in the dev container and capturing logs.
2) Finish server-side PayPal capture flow and verify orders insertion into Supabase.
3) Add unit/smoke tests for server endpoints and integrate them in CI.
4) Implement client-side reCAPTCHA tokens for the newsletter and comment forms and test server verification.
5) Replace placeholder images and finalize design and copy.

Contact

If you run into a blocker, copy the full terminal output from the failing command and paste it into the repo issue or here and I will debug further.

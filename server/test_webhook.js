// Simple script to POST a fake Stripe webhook event to the local server for testing.
// Usage: node test_webhook.js

const fetch = require('node-fetch');

(async ()=>{
  const url = 'http://localhost:4242/webhook/stripe';
  const event = {
    type: 'checkout.session.completed',
    data: { object: { id: 'cs_test_123', customer_details: { email: 'buyer@example.com' } } }
  };
  const res = await fetch(url, {method:'POST',body:JSON.stringify(event),headers:{'Content-Type':'application/json'}});
  console.log('status',res.status);
  console.log(await res.text());
})();

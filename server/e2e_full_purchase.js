// E2E test simulating a full purchase flow
const fetch = require('node-fetch');

(async ()=>{
  const base = 'http://localhost:4242';
  console.log('Starting E2E test against', base);
  // 1) Create session
  const items = [{id:1, title:'Suncatcher Spirit (Signed Edition)', price:18.99, qty:1}];
  const resp = await fetch(base + '/create-stripe-session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items})});
  if(resp.status!==200){console.error('create session failed', await resp.text()); process.exit(1);} 
  const data = await resp.json();
  console.log('session response', data);
  const sessionId = data.id;
  if(!sessionId){
    console.warn('No session id returned; webhook-based test requires Stripe integration. Falling back to simulated webhook.');
  }

  // Print Stripe CLI command to forward events for this session
  console.log('\nTo forward a real Stripe webhook for this session using the Stripe CLI, run:');
  console.log(`stripe trigger checkout.session.completed --add "id=${sessionId}" --forward-to http://localhost:4242/webhook/stripe`);
  console.log('\nAlternatively the script can simulate the webhook automatically.');

  const autoSim = process.env.AUTO_SIMULATE === '1' || process.argv.includes('--auto');
  if(!autoSim){
    console.log('Press Enter to continue (simulate webhook) or run the Stripe CLI command above in another terminal...');
    await new Promise(resolve=>process.stdin.once('data',()=>resolve()));
  } else {
    console.log('AUTO_SIMULATE enabled: proceeding to simulate webhook without waiting.');
  }

  // 2) Simulate webhook if necessary
  const webhookEvent = {type:'checkout.session.completed', data:{object:{id:sessionId || ('cs_test_e2e_'+Date.now()), customer_details:{email:'buyer@example.com'}}}};
  const wh = await fetch(base + '/webhook/stripe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(webhookEvent)});
  console.log('/webhook status', wh.status);

  // 3) Poll orders and emails with quick intervals (faster response detection)
  const poll = async (path, attempts=10, interval=500)=>{
    for(let i=0;i<attempts;i++){
      const r = await fetch(base + path);
      if(r.status===200){ const j = await r.json(); if(Array.isArray(j) && j.length>0) return j; }
      await new Promise(r=>setTimeout(r,interval));
    }
    return null;
  };

  const orders = await poll('/_debug/orders', 8, 400);
  console.log('orders (latest):', orders ? orders.slice(0,3) : 'none');
  const emails = await poll('/_debug/sent-emails', 8, 400);
  console.log('sent emails:', emails || 'none');
  console.log('E2E test complete.');
  process.exit(0);
})();

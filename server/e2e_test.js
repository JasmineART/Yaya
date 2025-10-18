// Basic smoke test for server endpoints. Requires server to be running.
const fetch = require('node-fetch');
(async ()=>{
  const base = 'http://localhost:4242';
  try{
    const r1 = await fetch(base + '/'); console.log('/ ->', r1.status);
    const r2 = await fetch(base + '/comments'); console.log('/comments ->', r2.status);
    const createStripe = await fetch(base + '/create-stripe-session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:[{id:1,qty:1}]})});
    console.log('/create-stripe-session ->', createStripe.status);
  }catch(e){console.error('e2e error',e)}
})();

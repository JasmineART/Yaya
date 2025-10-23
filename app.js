/* App-wide JS: cart, newsletter, comments, checkout simulation, sparkle animations */
const STORAGE_KEY = 'yaya_cart_v1';
const DISCOUNTS = { 'SUN10':0.10, 'FAIRY5':0.05, 'MAGIC15':0.15 };

// Add custom animation with drift - do this first
function injectSparkleStyles() {
  // Check if already injected
  if (document.getElementById('sparkle-animation-styles')) {
    console.log('✨ Sparkle styles already injected');
    return;
  }
  
  const style = document.createElement('style');
  style.id = 'sparkle-animation-styles';
  style.textContent = `
    @keyframes floatSparkle {
      0% { 
        transform: translateY(0) translateX(0) scale(0.5) rotate(0deg);
        opacity: 0;
      }
      5% {
        opacity: 0.6;
      }
      50% {
        transform: translateY(-50vh) translateX(var(--drift, 0)) scale(1) rotate(180deg);
        opacity: 0.8;
      }
      95% {
        opacity: 0.6;
      }
      100% {
        transform: translateY(-100vh) translateX(calc(var(--drift, 0) * 1.5)) scale(0.3) rotate(360deg);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
  console.log('✨ Sparkle animation styles injected');
}

// Magical sparkle stream animation - more particles, flowing pattern
function createMagicalSparkles() {
  // Calculate sparkles based on screen size (200 per inch of screen width - DOUBLED)
  const screenWidthInches = window.innerWidth / 96; // 96 DPI standard
  const targetSparkleCount = Math.floor(screenWidthInches * 200); // DOUBLED from 100 to 200
  
  // Limit to reasonable numbers for performance
  const maxSparkles = 1000; // Increased max
  const totalSparkles = Math.min(targetSparkleCount, maxSparkles);
  
  console.log('✨ Sparkle system starting...', {
    screenWidth: window.innerWidth,
    screenWidthInches: screenWidthInches.toFixed(2),
    targetSparkles: totalSparkles
  });
  
  // Create initial batch of sparkles distributed across screen
  function createSparklesBatch() {
    const batchSize = Math.min(20, Math.ceil(totalSparkles / 10)); // Create in batches
    
    for(let i = 0; i < batchSize; i++) {
      setTimeout(() => {
        createSingleSparkle();
      }, i * 50); // Stagger creation for smooth appearance
    }
  }
  
  function createSingleSparkle() {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    
    // Distribute across full screen width
    const posX = Math.random() * 100;
    sparkle.style.left = posX + '%';
    
    // Start from random vertical position for initial fill
    const startY = Math.random() * 120; // 0-120% to fill screen
    sparkle.style.bottom = -startY + '%';
    
    // Vary sizes for depth
    const size = Math.random() * 3 + 1.5; // Smaller sparkles (1.5-4.5px)
    sparkle.style.width = size + 'px';
    sparkle.style.height = size + 'px';
    
    // Randomize animation properties for organic movement
    const duration = Math.random() * 8 + 10; // Slower (10-18s)
    const delay = Math.random() * 2;
    const drift = (Math.random() - 0.5) * 80; // Reduced drift
    
    sparkle.style.animation = `floatSparkle ${duration}s ease-in-out ${delay}s infinite`;
    sparkle.style.setProperty('--drift', drift + 'px');
    
    document.body.appendChild(sparkle);
  }
  
  // Initial population - fill screen with sparkles
  const initialBatches = Math.ceil(totalSparkles / 20);
  for(let batch = 0; batch < initialBatches; batch++) {
    setTimeout(() => createSparklesBatch(), batch * 1000);
  }
  
  // Maintain sparkle count - check and refill periodically
  setInterval(() => {
    const currentSparkles = document.querySelectorAll('.sparkle').length;
    if (currentSparkles < totalSparkles * 0.8) { // If below 80%, add more
      const needed = totalSparkles - currentSparkles;
      const toAdd = Math.min(needed, 10);
      for(let i = 0; i < toAdd; i++) {
        setTimeout(() => createSingleSparkle(), i * 100);
      }
    }
  }, 3000); // Check every 3 seconds
  
  console.log('✨ Sparkle generation system active');
}

// Cloud animation system - fluffy clouds at top of page
function createClouds() {
  const isHomePage = window.location.pathname === '/' || window.location.pathname.includes('index.html') || window.location.pathname === '';
  
  if (!isHomePage) return; // Only on home page
  
  console.log('☁️ Creating clouds...');
  
  const cloudCount = 6; // Number of clouds
  
  for(let i = 0; i < cloudCount; i++) {
    setTimeout(() => {
      const cloud = document.createElement('div');
      cloud.className = 'cloud';
      
      // Start off-screen left, distributed across animation timeline
      cloud.style.left = '-250px';
      cloud.style.top = (Math.random() * 12 + 2) + '%'; // Top 2-14% of screen
      
      // Random size
      const scale = 0.4 + Math.random() * 0.9; // 0.4 to 1.3x
      cloud.style.transform = `scale(${scale})`;
      cloud.style.opacity = (0.5 + Math.random() * 0.4); // Varying opacity
      
      // Random animation duration (slower = more distant)
      const duration = 50 + (Math.random() * 50); // 50-100 seconds
      cloud.style.animationDuration = duration + 's';
      
      // Stagger starting positions
      cloud.style.animationDelay = (i * -15) + 's'; // Start at different points
      
      document.body.appendChild(cloud);
    }, i * 200);
  }
  
  console.log('☁️ Clouds created');
}

// Spotlight effect from bottom of page
function createSpotlights() {
  const isHomePage = window.location.pathname === '/' || window.location.pathname.includes('index.html') || window.location.pathname === '';
  
  if (!isHomePage) return; // Only on home page
  
  console.log('💡 Creating spotlights...');
  
  const spotlightCount = 4; // Number of spotlights
  
  for(let i = 0; i < spotlightCount; i++) {
    const spotlight = document.createElement('div');
    spotlight.className = 'spotlight';
    
    // Distribute across bottom
    spotlight.style.left = ((i / (spotlightCount - 1)) * 100) + '%';
    
    // Random animation delay for variety
    spotlight.style.animationDelay = (i * 0.5) + 's';
    
    document.body.appendChild(spotlight);
  }
  
  console.log('💡 Spotlights created');
}

// Scroll-triggered reveal animations
function revealOnScroll() {
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  
  reveals.forEach(element => {
    const elementTop = element.getBoundingClientRect().top;
    const elementBottom = element.getBoundingClientRect().bottom;
    const windowHeight = window.innerHeight;
    
    // Reveal when element is 15% into viewport
    if (elementTop < windowHeight * 0.85 && elementBottom > 0) {
      element.classList.add('active');
    }
  });
}

// Initialize on load
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 DOM Content Loaded - initializing...');
    injectSparkleStyles();
    createMagicalSparkles();
    createClouds();
    createSpotlights();
    revealOnScroll();
    console.log('✅ All systems initialized');
  });
  
  window.addEventListener('scroll', revealOnScroll);
  window.addEventListener('resize', revealOnScroll);
  
  // Handle window resize for sparkle recalculation
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Remove old sparkles and recreate with new screen size
      const oldSparkles = document.querySelectorAll('.sparkle');
      oldSparkles.forEach(s => s.remove());
      createMagicalSparkles();
      console.log('✨ Sparkles recalculated for new screen size');
    }, 500); // Debounce resize
  });
}

function getCart(){
  try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||[];}catch(e){return []}
}
function saveCart(items){localStorage.setItem(STORAGE_KEY,JSON.stringify(items));}

function addToCart(productId, qty=1){
  const items = getCart();
  const found = items.find(i=>i.id===productId);
  if(found) found.qty += qty; else items.push({id:productId,qty});
  saveCart(items);
}

function updateCartCount(){
  const count = getCart().reduce((s,i)=>s+i.qty,0);
  const el = document.getElementById('nav-cart-count');
  if(el) el.textContent = count;
}

function renderCartContents(){
  const node = document.getElementById('cart-contents');
  if(!node) return;
  const items = getCart();
  if(items.length===0){node.innerHTML='<p>Your enchanted cart is empty. ✨</p>';return}
  const rows = items.map(it=>{
    const p = window.PRODUCTS.find(x=>x.id===it.id);
    return `
      <div class="cart-item">
        <img src="${p.images[0]}" alt="${p.title}"/>
        <div>
          <strong>${p.title}</strong>
          <div>${it.qty} × ${formatPrice(p.price)}</div>
        </div>
        <div style="margin-left:auto">${formatPrice(p.price*it.qty)}</div>
      </div>
    `;
  }).join('');
  const total = items.reduce((s,it)=>s + (window.PRODUCTS.find(x=>x.id===it.id).price * it.qty),0);
  node.innerHTML = rows + `<p style="text-align:right"><strong>Total: ${formatPrice(total)}</strong></p>`;
}

function formatPrice(v){return '$'+v.toFixed(2)}

// discounts
function applyDiscount(code){
  const c = (code||'').toUpperCase().trim();
  return DISCOUNTS[c]||0;
}

// Newsletter and comments - try Supabase (free tier) then fallback to Formspree
const CONFIG = window.YAYA_CONFIG || {};

async function postToSupabase(path, body){
  try{
    if(!CONFIG.supabaseUrl || !CONFIG.supabaseAnonKey) throw new Error('supabase not configured');
    const url = CONFIG.supabaseUrl + path;
    const res = await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','apikey':CONFIG.supabaseAnonKey,'Authorization':'Bearer '+CONFIG.supabaseAnonKey},body:JSON.stringify(body)});
    return res.ok ? await res.json() : null;
  }catch(e){return null}
}

document.addEventListener('DOMContentLoaded',()=>{
  updateCartCount();
  renderCartContents();

  // newsletter
  const nf = document.getElementById('newsletter-form');
  if(nf){
    nf.addEventListener('submit',async e=>{
      e.preventDefault();
      const email = document.getElementById('newsletter-email').value;
      // If server configured, post to server endpoint
      if(window.YAYA_CONFIG && window.YAYA_CONFIG.serverUrl){
        try{
          const resp = await fetch(window.YAYA_CONFIG.serverUrl + '/newsletter',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})});
          const data = await resp.json();
          if(data && data.ok) { alert('Thanks — you are subscribed!'); nf.reset(); return; }
        }catch(e){console.warn('server subscribe failed',e)}
      }
      // Fallback to Supabase direct or Formspree
      const saved = await postToSupabase('/rest/v1/newsletter', {email, created_at: new Date().toISOString()});
      if(saved){alert('Thanks — you are subscribed!'); nf.reset(); return}
      fetch('https://formspree.io/f/maypznwl',{method:'POST',body:JSON.stringify({email}),headers:{'Content-Type':'application/json'}}).then(()=>{alert('Thanks — you are subscribed!');nf.reset()}).catch(()=>alert('Subscription failed'))
    });
  }

  // comments
  const cf = document.getElementById('comment-form');
  if(cf){
    cf.addEventListener('submit',async e=>{
      e.preventDefault();
      const name = document.getElementById('comment-name').value;
      const text = document.getElementById('comment-text').value;
      // Prefer server endpoint if available
      if(window.YAYA_CONFIG && window.YAYA_CONFIG.serverUrl){
        try{
          const r = await fetch(window.YAYA_CONFIG.serverUrl + '/comments',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,text})});
          const j = await r.json();
          if(j && j.ok){appendComment({name,text});cf.reset();return}
        }catch(e){console.warn('server comment failed',e)}
      }
      const saved = await postToSupabase('/rest/v1/comments',{name,text,created_at:new Date().toISOString()});
      if(saved){appendComment({name,text});cf.reset()}else{alert('Could not save comment.');}
    });
    loadComments();
  }

  // discount apply
  const discBtn = document.getElementById('apply-discount');
  if(discBtn){discBtn.addEventListener('click',()=>{
    const code = document.getElementById('discount-code').value;
    const pct = applyDiscount(code);
    if(!pct) alert('Invalid code'); else alert('Discount applied: '+(pct*100)+'%');
  })}

  // checkout
  const checkout = document.getElementById('checkout-form');
  if(checkout){
    checkout.addEventListener('submit',async e=>{
      e.preventDefault();
      const pay = document.querySelector('input[name="pay"]:checked').value;
      const name = document.getElementById('fullname').value;
      const email = document.getElementById('email').value;
      const items = getCart().map(it=>{
        const p = window.PRODUCTS.find(x=>x.id===it.id);
        return {id: it.id, title: p.title, price: p.price, qty: it.qty};
      });

      // Save order attempt to Supabase if available
      const orderRecord = {name,email,items,created_at:new Date().toISOString()};
      try{ await postToSupabase('/rest/v1/orders',orderRecord); }catch(e){}

      // Call server to create payment session
      try{
        if(pay==='stripe'){
          const resp = await fetch((window.YAYA_CONFIG && window.YAYA_CONFIG.serverUrl ? window.YAYA_CONFIG.serverUrl : '') + '/create-stripe-session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items,successUrl:location.origin + '/index.html',cancelUrl:location.origin + '/cart.html'})});
          const data = await resp.json();
          if(data.url) window.location.href = data.url; else throw new Error(data.error || 'No url');
        }else if(pay==='paypal'){
          const resp = await fetch((window.YAYA_CONFIG && window.YAYA_CONFIG.serverUrl ? window.YAYA_CONFIG.serverUrl : '') + '/create-paypal-order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items,returnUrl:location.origin + '/index.html',cancelUrl:location.origin + '/cart.html'})});
          const data = await resp.json();
          // PayPal returns links — find approval link
          const approve = data && data.links && data.links.find(l=>l.rel==='approve');
          if(approve) window.location.href = approve.href; else throw new Error('Could not create PayPal order');
        }
      }catch(err){
        console.error(err);
        alert('Payment failed to start: '+err.message);
      }
    });
    renderOrderSummary();
  }
});

async function loadComments(){
  const list = document.getElementById('comments-list');
  if(!list) return;
  // try supabase fetch
  try{
    if(window.YAYA_CONFIG && window.YAYA_CONFIG.serverUrl){
      const r = await fetch(window.YAYA_CONFIG.serverUrl + '/comments');
      if(r.ok){ const data = await r.json(); list.innerHTML = data.map(c=>`<div class="comment"><strong>${escapeHtml(c.name)}</strong><p>${escapeHtml(c.text)}</p></div>`).join(''); return; }
    }
    if(CONFIG.supabaseUrl && CONFIG.supabaseAnonKey){
      const res = await fetch(CONFIG.supabaseUrl + '/rest/v1/comments?select=name,text,created_at', {headers:{'apikey':CONFIG.supabaseAnonKey}});
      if(res.ok){
        const data = await res.json();
        list.innerHTML = data.map(c=>`<div class="comment"><strong>${escapeHtml(c.name)}</strong><p>${escapeHtml(c.text)}</p></div>`).join('');
        return;
      }
    }
  }catch(e){}
  // fallback: local placeholder
  list.innerHTML = '<p>No comments yet — be the first to leave one.</p>';
}

function appendComment(c){
  const list = document.getElementById('comments-list');
  if(!list) return;
  const node = document.createElement('div'); node.className='comment';
  node.innerHTML = `<strong>${escapeHtml(c.name)}</strong><p>${escapeHtml(c.text)}</p>`;
  list.prepend(node);
}

function escapeHtml(s){return (s+'').replace(/[&<>"']/g,function(m){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]})}

function renderOrderSummary(){
  const aside = document.getElementById('order-summary');
  if(!aside) return;
  const items = getCart();
  if(items.length===0){aside.innerHTML='<p>No items</p>';return}
  const rows = items.map(it=>{
    const p = window.PRODUCTS.find(x=>x.id===it.id);
    return `<div>${p.title} × ${it.qty} — ${formatPrice(p.price*it.qty)}</div>`;
  }).join('');
  const total = items.reduce((s,it)=>s + (window.PRODUCTS.find(x=>x.id===it.id).price * it.qty),0);
  aside.innerHTML = `<h4>Order summary</h4>${rows}<p><strong>Total: ${formatPrice(total)}</strong></p>`;
}

// utilities used by products.js
window.addToCart = addToCart;
window.updateCartCount = updateCartCount;
